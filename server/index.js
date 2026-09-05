import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { supabase } from './lib/supabase.js';
import { bot, notifyCustomer, notifyAdminGroup } from './bot.js';
import { adminRouter } from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const clientDir = path.resolve(rootDir, 'client');
const clientDistDir = path.resolve(clientDir, 'dist');

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

// ============ ADMIN API ============
app.use('/api/admin', adminRouter);

// ============ CLIENT FRONTEND SERVING ============
async function setupFrontend() {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasDist = fs.existsSync(path.join(clientDistDir, 'index.html'));

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true, host: '0.0.0.0' },
        appType: 'spa',
        root: clientDir,
      });
      app.use(vite.middlewares);
      return;
    } catch (err) {
      console.warn('Vite middleware could not start, falling back to static files:', err.message);
    }
  }

  if (hasDist) {
    app.use(express.static(clientDistDir));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDistDir, 'index.html'));
    });
  } else {
    app.get('/', (req, res) => {
      res.send('Fastfood API ishlayapti ✅ (Frontend dist yaratilmoqda)');
    });
  }
}

const PORT = 3000;

setupFrontend().then(() => {
  // Bot ishga tushirish (agar token mavjud bo'lsa)
  bot.launch()
    .then(() => console.log('🤖 Telegram bot ishga tushdi'))
    .catch((err) => console.warn('Telegram bot ishga tushmadi:', err.message));

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server http://0.0.0.0:${PORT} da ishlayapti`);
  });
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
