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

function createMockSupabase() {
  const store = {
    categories: [...initialCategories],
    products: [...initialProducts],
    orders: [],
    order_items: [],
  };
  let nextOrderId = 1001;
  let nextOrderItemId = 1;

  return {
    from(tableName) {
      let data = [...(store[tableName] || [])];
      let inserted = null;

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
              id: tableName === 'orders' ? nextOrderId++ : (tableName === 'order_items' ? nextOrderItemId++ : Date.now()),
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
        single() {
          const item = inserted || data[0] || null;
          return Promise.resolve({ data: item, error: null });
        },
        then(resolve, reject) {
          const res = inserted !== null ? inserted : data;
          return Promise.resolve({ data: res, error: null }).then(resolve, reject);
        }
      };

      return chain;
    }
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
