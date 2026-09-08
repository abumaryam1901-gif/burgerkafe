import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './lib/supabase.js';
import { notifyCustomer, notifyAdminGroup } from './bot.js';
import { adminRouter } from './routes/admin.js';

dotenv.config();

// Bu fayl faqat Express "app"ni yaratadi va API yo'llarini ro'yxatdan o'tkazadi.
// app.listen(...) BU YERDA CHAQIRILMAYDI — buni faqat lokal server (server/index.js)
// va Vercel serverless funksiyasi (api/index.js) o'zlari, o'ziga mos usulda qiladi.

const app = express();
app.use(cors());
app.use(express.json());

// ============ API: HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ============ API: MENYUNI OLISH ============
app.get('/api/menu', async (req, res) => {
  try {
    const { data: categories, error: catErr } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (catErr) throw catErr;

    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('id', { ascending: true });

    if (prodErr) throw prodErr;

    res.json({ categories: categories || [], products: products || [] });
  } catch (err) {
    console.error('Menyuni olishda xato:', err);
    res.status(500).json({ error: 'Menyuni olishda xatolik yuz berdi' });
  }
});

// ============ API: BUYURTMA YARATISH ============
app.post('/api/orders', async (req, res) => {
  try {
    const {
      telegram_user_id,
      customer_name,
      customer_phone,
      delivery_type,
      address,
      location_lat,
      location_lng,
      payment_method,
      items // [{ product_id, quantity }]
    } = req.body;

    if (
      telegram_user_id === undefined ||
      telegram_user_id === null ||
      !customer_name ||
      !customer_phone ||
      !items?.length
    ) {
      return res.status(400).json({ error: "Majburiy maydonlar to'ldirilmagan" });
    }

    // Narxlarni serverda qayta tekshirish (frontend'dan kelgan narxga ishonmaymiz!)
    const productIds = items.map((i) => i.product_id);
    const { data: dbProducts, error: prodErr } = await supabase
      .from('products')
      .select('id, name, price, is_available')
      .in('id', productIds);

    if (prodErr) throw prodErr;

    let total_price = 0;
    const orderItemsData = [];
    const itemsForMessage = [];

    for (const item of items) {
      const product = dbProducts?.find((p) => p.id === item.product_id);
      if (!product || !product.is_available) {
        return res.status(400).json({ error: `Mahsulot mavjud emas: ID ${item.product_id}` });
      }
      const qty = Number(item.quantity);
      if (!qty || qty <= 0) {
        return res.status(400).json({ error: "Miqdor noto'g'ri" });
      }
      const realPrice = Number(product.price);
      total_price += realPrice * qty;
      orderItemsData.push({ product_id: product.id, quantity: qty, price_at_order: realPrice });
      itemsForMessage.push({ name: product.name, quantity: qty, price_at_order: realPrice });
    }

    // Buyurtmani yaratish
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        telegram_user_id: Number(telegram_user_id) || 0,
        customer_name,
        customer_phone,
        delivery_type: delivery_type || 'yetkazib_berish',
        address: address || null,
        location_lat: location_lat || null,
        location_lng: location_lng || null,
        total_price,
        payment_method: payment_method || 'naqd',
        status: 'yangi'
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // order_items yozish
    const itemsToInsert = orderItemsData.map((it) => ({ ...it, order_id: order.id }));
    const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsErr) throw itemsErr;

    // Telegram xabarnomalari (asinxron)
    notifyAdminGroup(order, itemsForMessage).catch(console.error);
    notifyCustomer(telegram_user_id, order.id).catch(console.error);

    res.status(201).json({ success: true, order_id: order.id, total_price });
  } catch (err) {
    console.error('Buyurtma yaratishda xato:', err);
    res.status(500).json({ error: 'Buyurtma yaratishda xatolik yuz berdi' });
  }
});

// ============ API: OSHXONA PROFILI (public, faqat o'qish) ============
app.get('/api/settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw error;
    res.json({ settings: data || null });
  } catch (err) {
    console.error("Oshxona sozlamalarini olishda xato:", err);
    res.status(500).json({ error: 'Sozlamalarni olishda xatolik yuz berdi' });
  }
});

// ============ API: MIJOZ BUYURTMALAR TARIXI ============
app.get('/api/orders/my', async (req, res) => {
  try {
    const { telegram_user_id, ids } = req.query;
    const tgId = Number(telegram_user_id);
    const parsedIds = ids
      ? String(ids)
          .split(',')
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n) && n > 0)
      : [];

    let orders = [];

    if (tgId && tgId > 0) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('telegram_user_id', tgId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) orders.push(...data);
    }

    if (parsedIds.length > 0) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('id', parsedIds)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const existingIds = new Set(orders.map((o) => o.id));
        for (const ord of data) {
          if (!existingIds.has(ord.id)) {
            orders.push(ord);
            existingIds.add(ord.id);
          }
        }
      }
    }

    // Sanasi bo'yicha saralash
    orders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    // Taomlar ro'yxatini biriktirish
    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      const itemsWithProd = items || [];
      const productIds = [...new Set(itemsWithProd.map((it) => it.product_id))];
      const { data: prods } = await supabase
        .from('products')
        .select('id, name, image_url')
        .in('id', productIds);

      const prodMap = new Map((prods || []).map((p) => [p.id, p]));

      const enriched = orders.map((ord) => {
        const ordItems = itemsWithProd
          .filter((it) => it.order_id === ord.id)
          .map((it) => ({
            ...it,
            product_name: prodMap.get(it.product_id)?.name || `Mahsulot #${it.product_id}`,
            product_image: prodMap.get(it.product_id)?.image_url || null,
          }));
        return {
          ...ord,
          items: ordItems,
        };
      });

      return res.json({ orders: enriched });
    }

    res.json({ orders: [] });
  } catch (err) {
    console.error('Mijoz buyurtmalarini olishda xato:', err);
    res.status(500).json({ error: 'Buyurtmalar tarixini olishda xatolik yuz berdi' });
  }
});

// ============ API: TELEGRAM FOYDALANUVCHISI ADMINMI? ============
// Faqat Admin Panelga kirish tugmasini ko'rsatish/yashirish uchun ishlatiladi.
// Haqiqiy amallar hamon login (JWT) orqali himoyalangan — bu shunchaki UI signal.
app.get('/api/check-admin/:telegramId', (req, res) => {
  const adminIdsStr = `${process.env.ADMIN_TELEGRAM_IDS || ''},${process.env.TELEGRAM_ADMIN_CHAT_ID || ''}`;
  const ids = adminIdsStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const isAdmin = ids.includes(String(req.params.telegramId));
  res.json({ isAdmin });
});

// ============ ADMIN API ============
app.use('/api/admin', adminRouter);

export default app;
