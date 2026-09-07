import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const initialCategories = [
  { id: 1, name: 'Burgerlar', slug: 'burgers', icon: '🍔', sort_order: 1 },
  { id: 2, name: 'Lavashlar', slug: 'lavash', icon: '🌯', sort_order: 2 },
  { id: 3, name: 'Ichimliklar', slug: 'drinks', icon: '🥤', sort_order: 3 },
  { id: 4, name: "Qo'shimchalar", slug: 'sides', icon: '🍟', sort_order: 4 },
];

const initialProducts = [
  { id: 1, category_id: 1, name: 'Cheeseburger', description: "Mol go'shti, pishloq, pomidor, salat", price: 28000, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', is_available: true },
  { id: 2, category_id: 1, name: 'Double Burger', description: "Ikki qavat go'sht, cheddar, sous", price: 38000, image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500', is_available: true },
  { id: 3, category_id: 1, name: 'Chicken Burger', description: 'Panirovkali tovuq filesi, majonez sous', price: 26000, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', is_available: true },
  { id: 4, category_id: 2, name: 'Klassik Lavash', description: "Tovuq go'shti, sabzavotlar, sous", price: 22000, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500', is_available: true },
  { id: 5, category_id: 2, name: 'Katta Lavash', description: "Ikki xil go'sht, ko'p sabzavot", price: 30000, image_url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500', is_available: true },
  { id: 6, category_id: 3, name: 'Coca-Cola 0.5L', description: 'Sovutilgan gazli ichimlik', price: 8000, image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500', is_available: true },
  { id: 7, category_id: 3, name: 'Fanta 0.5L', description: 'Sovutilgan gazli ichimlik', price: 8000, image_url: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=500', is_available: true },
  { id: 8, category_id: 4, name: 'Kartoshka Fri', description: "Xrustkash kartoshka fri, o'rtacha porsiya", price: 14000, image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500', is_available: true },
  { id: 9, category_id: 4, name: 'Sous (ketchup/majonez)', description: "Qo'shimcha sous", price: 3000, image_url: null, is_available: true },
];

const initialRestaurantSettings = [
  {
    id: 1,
    name: 'Burger Kafe',
    description: 'Tez va mazali fastfood taomlari',
    logo_url: null,
    phone: '+998 71 200 00 00',
    address: 'Toshkent shahri, Burger Kafe filiali',
    working_hours: 'Har kuni 10:00 dan 23:00 gacha',
    payment_info: 'Naqd pul va karta (Payme / Click) orqali',
    updated_at: new Date().toISOString(),
  },
];

function createMockSupabase() {
  const store = {
    categories: [...initialCategories],
    products: [...initialProducts],
    orders: [],
    order_items: [],
    restaurant_settings: [...initialRestaurantSettings],
  };
  let nextCategoryId = 100;
  let nextProductId = 100;
  let nextOrderId = 1001;
  let nextOrderItemId = 1;
  const nextIdFor = (tableName) => {
    if (tableName === 'orders') return nextOrderId++;
    if (tableName === 'order_items') return nextOrderItemId++;
    if (tableName === 'categories') return nextCategoryId++;
    if (tableName === 'products') return nextProductId++;
    return Date.now() + Math.floor(Math.random() * 1000);
  };

  return {
    from(tableName) {
      let data = [...(store[tableName] || [])];
      let inserted = null;
      let op = 'select';
      let pendingPatch = null;

      const chain = {
        select(cols = '*') {
          return chain;
        },
        order(field, { ascending = true } = {}) {
          data.sort((a, b) => {
            if (a[field] < b[field]) return ascending ? -1 : 1;
            if (a[field] > b[field]) return ascending ? 1 : -1;
            return 0;
          });
          return chain;
        },
        eq(field, val) {
          data = data.filter((item) => item[field] === val);
          return chain;
        },
        in(field, vals) {
          const set = new Set(vals);
          data = data.filter((item) => set.has(item[field]));
          return chain;
        },
        insert(rows) {
          const toInsert = Array.isArray(rows) ? rows : [rows];
          const created = [];
          for (const row of toInsert) {
            const item = {
              id: nextIdFor(tableName),
              created_at: new Date().toISOString(),
              ...row,
            };
            store[tableName] = store[tableName] || [];
            store[tableName].push(item);
            created.push(item);
          }
          inserted = Array.isArray(rows) ? created : created[0];
          return chain;
        },
        update(patch) {
          op = 'update';
          pendingPatch = patch;
          return chain;
        },
        delete() {
          op = 'delete';
          return chain;
        },
        single() {
          const result = resolveOp();
          const item = Array.isArray(result) ? result[0] || null : result;
          return Promise.resolve({ data: item, error: null });
        },
        then(resolve, reject) {
          const res = resolveOp();
          return Promise.resolve({ data: res, error: null }).then(resolve, reject);
        },
      };

      function resolveOp() {
        if (op === 'update') {
          const matchIds = new Set(data.map((d) => d.id));
          store[tableName] = (store[tableName] || []).map((item) =>
            matchIds.has(item.id) ? { ...item, ...pendingPatch } : item
          );
          return store[tableName].filter((item) => matchIds.has(item.id));
        }
        if (op === 'delete') {
          const matchIds = new Set(data.map((d) => d.id));
          const removed = (store[tableName] || []).filter((item) => matchIds.has(item.id));
          store[tableName] = (store[tableName] || []).filter((item) => !matchIds.has(item.id));
          return removed;
        }
        return inserted !== null ? inserted : data;
      }

      return chain;
    },
    storage: {
      from() {
        return {
          upload: async () => ({ data: { path: 'mock' }, error: null }),
          getPublicUrl: (name) => ({ data: { publicUrl: `https://placehold.co/400x300?text=${encodeURIComponent(name)}` } }),
        };
      },
    },
  };
}

const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
let client = null;

if (hasSupabase) {
  try {
    client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
  } catch (err) {
    console.warn('[AI Studio] Supabase init failed, falling back to mock data:', err.message);
  }
}

export const supabase = client || createMockSupabase();
