import express from 'express';
import { supabase } from '../lib/supabase.js';
import { signAdminToken, adminAuthMiddleware } from '../middleware/adminAuth.js';
import { upload, uploadImageToSupabase } from '../lib/upload.js';
import { notifyCustomerStatusUpdate } from '../bot.js';

export const adminRouter = express.Router();

// ============ LOGIN (himoyalanmagan) ============
adminRouter.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
  }

  const token = signAdminToken(username);
  res.json({ token, username });
});

// Bundan pastdagi barcha endpointlar himoyalangan
adminRouter.use(adminAuthMiddleware);

adminRouter.get('/me', (req, res) => {
  res.json({ username: req.admin.username });
});

// ============ KATEGORIYALAR ============
adminRouter.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json({ categories: data || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kategoriyalarni olishda xatolik' });
  }
});

adminRouter.post('/categories', async (req, res) => {
  try {
    const { name, slug, icon, sort_order } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'Nomi va slug majburiy' });

    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug, icon: icon || null, sort_order: sort_order || 0 })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ category: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Kategoriya yaratishda xatolik' });
  }
});

adminRouter.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, icon, sort_order } = req.body;

    const { data, error } = await supabase
      .from('categories')
      .update({ name, slug, icon, sort_order })
      .eq('id', Number(id))
      .select()
      .single();
    if (error) throw error;
    res.json({ category: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Kategoriyani yangilashda xatolik' });
  }
});

adminRouter.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('categories').delete().eq('id', Number(id));
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kategoriyani o'chirishda xatolik (unga bog'liq mahsulotlar bo'lishi mumkin)" });
  }
});

// ============ MAHSULOTLAR ============
adminRouter.get('/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    if (error) throw error;
    res.json({ products: data || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Mahsulotlarni olishda xatolik' });
  }
});

adminRouter.post('/products', async (req, res) => {
  try {
    const { category_id, name, description, price, image_url, is_available } = req.body;
    if (!category_id || !name || price === undefined) {
      return res.status(400).json({ error: 'Kategoriya, nomi va narxi majburiy' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        category_id,
        name,
        description: description || null,
        price,
        image_url: image_url || null,
        is_available: is_available !== undefined ? is_available : true,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ product: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Mahsulot yaratishda xatolik' });
  }
});

adminRouter.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, image_url, is_available } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({ category_id, name, description, price, image_url, is_available })
      .eq('id', Number(id))
      .select()
      .single();
    if (error) throw error;
    res.json({ product: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Mahsulotni yangilashda xatolik' });
  }
});

// Faqat ko'rinishini almashtirish (hide/show) — tezkor tugma uchun
adminRouter.patch('/products/:id/visibility', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({ is_available })
      .eq('id', Number(id))
      .select()
      .single();
    if (error) throw error;
    res.json({ product: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Holatni yangilashda xatolik' });
  }
});

adminRouter.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', Number(id));
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Mahsulotni o'chirishda xatolik" });
  }
});

// Rasm yuklash (Supabase Storage'ga)
adminRouter.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Fayl topilmadi' });
    const url = await uploadImageToSupabase(req.file);
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Rasm yuklashda xatolik' });
  }
});

// ============ BUYURTMALAR ============
// order_items va products'ni qo'lda birlashtiruvchi yordamchi funksiya
// (haqiqiy Supabase'da ham, mock rejimida ham ishonchli ishlaydi)
async function attachOrderItems(orders) {
  const orderIds = orders.map((o) => o.id);
  if (orderIds.length === 0) return orders;

  const { data: items, error: itemsErr } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);
  if (itemsErr) throw itemsErr;

  const productIds = [...new Set((items || []).map((i) => i.product_id))];
  let productsById = {};
  if (productIds.length > 0) {
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, name, image_url')
      .in('id', productIds);
    if (prodErr) throw prodErr;
    productsById = Object.fromEntries((products || []).map((p) => [p.id, p]));
  }

  const itemsByOrder = {};
  for (const item of items || []) {
    const enriched = { ...item, products: productsById[item.product_id] || null };
    (itemsByOrder[item.order_id] = itemsByOrder[item.order_id] || []).push(enriched);
  }

  return orders.map((o) => ({ ...o, order_items: itemsByOrder[o.id] || [] }));
}

adminRouter.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (status && status !== 'hammasi') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    const orders = await attachOrderItems(data || []);
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Buyurtmalarni olishda xatolik' });
  }
});

adminRouter.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('orders').select('*').eq('id', Number(id)).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Buyurtma topilmadi' });

    const [order] = await attachOrderItems([data]);
    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'Buyurtma topilmadi' });
  }
});

const VALID_STATUSES = ['yangi', 'tayyorlanmoqda', 'yolda', 'yetkazildi', 'bekor_qilindi'];

adminRouter.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Status noto'g'ri" });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', Number(id))
      .select()
      .single();
    if (error) throw error;

    // Mijozga statusi o'zgargani haqida xabar
    notifyCustomerStatusUpdate(data.telegram_user_id, data.id, status).catch(console.error);

    res.json({ order: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Statusni yangilashda xatolik' });
  }
});

// ============ FOYDALANUVCHILAR (buyurtma bergan mijozlar) ============
adminRouter.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('telegram_user_id, customer_name, customer_phone, total_price, created_at');
    if (error) throw error;

    const map = new Map();
    for (const o of data || []) {
      const key = o.telegram_user_id;
      if (!map.has(key)) {
        map.set(key, {
          telegram_user_id: key,
          customer_name: o.customer_name,
          customer_phone: o.customer_phone,
          order_count: 0,
          total_spent: 0,
          last_order_at: o.created_at,
        });
      }
      const u = map.get(key);
      u.order_count += 1;
      u.total_spent += Number(o.total_price);
      if (new Date(o.created_at) > new Date(u.last_order_at)) {
        u.last_order_at = o.created_at;
        u.customer_name = o.customer_name;
        u.customer_phone = o.customer_phone;
      }
    }

    const users = Array.from(map.values()).sort((a, b) => b.order_count - a.order_count);
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Foydalanuvchilarni olishda xatolik' });
  }
});

// ============ DASHBOARD STATISTIKA ============
adminRouter.get('/stats', async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, total_price, created_at');
    if (error) throw error;

    const today = new Date().toDateString();
    const stats = {
      total_orders: orders.length,
      today_orders: orders.filter((o) => new Date(o.created_at).toDateString() === today).length,
      total_revenue: orders
        .filter((o) => o.status !== 'bekor_qilindi')
        .reduce((sum, o) => sum + Number(o.total_price), 0),
      by_status: VALID_STATUSES.reduce((acc, s) => {
        acc[s] = orders.filter((o) => o.status === s).length;
        return acc;
      }, {}),
    };

    res.json({ stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Statistikani olishda xatolik' });
  }
});
