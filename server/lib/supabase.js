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
  let nextOrderId = 1001;
  let nextOrderItemId = 1;
  let nextCategoryId = 10;
  let nextProductId = 100;

  return {
    from(tableName) {
      if (!store[tableName]) {
        store[tableName] = [];
      }

      let operation = 'select'; // 'select' | 'insert' | 'update' | 'delete'
      let updatePayload = null;
      let inserted = null;
      let sortConfig = null;
      const filters = [];

      const execute = () => {
        if (operation === 'insert') {
          return inserted;
        }

        if (operation === 'update') {
          const updatedItems = [];
          store[tableName] = store[tableName].map((item) => {
            const matches = filters.every((fn) => fn(item));
            if (matches) {
              const updated = {
                ...item,
                ...updatePayload,
                updated_at: new Date().toISOString(),
              };
              updatedItems.push(updated);
              return updated;
            }
            return item;
          });
          return updatedItems;
        }

        if (operation === 'delete') {
          const remaining = [];
          const deleted = [];
          store[tableName].forEach((item) => {
            const matches = filters.every((fn) => fn(item));
            if (matches) {
              deleted.push(item);
            } else {
              remaining.push(item);
            }
          });
          store[tableName] = remaining;
          return deleted;
        }

        // Default: 'select'
        let results = [...store[tableName]];
        for (const fn of filters) {
          results = results.filter(fn);
        }
        if (sortConfig) {
          const { field, ascending } = sortConfig;
          results.sort((a, b) => {
            if (a[field] < b[field]) return ascending ? -1 : 1;
            if (a[field] > b[field]) return ascending ? 1 : -1;
            return 0;
          });
        }
        return results;
      };

      const chain = {
        select(cols = '*') {
          return chain;
        },
        order(field, { ascending = true } = {}) {
          sortConfig = { field, ascending };
          return chain;
        },
        eq(field, val) {
          filters.push((item) => item[field] === val);
          return chain;
        },
        neq(field, val) {
          filters.push((item) => item[field] !== val);
          return chain;
        },
        in(field, vals) {
          const set = new Set(vals);
          filters.push((item) => set.has(item[field]));
          return chain;
        },
        insert(rows) {
          operation = 'insert';
          const toInsert = Array.isArray(rows) ? rows : [rows];
          const created = [];
          for (const row of toInsert) {
            let id = row.id;
            if (!id) {
              if (tableName === 'orders') id = nextOrderId++;
              else if (tableName === 'order_items') id = nextOrderItemId++;
              else if (tableName === 'categories') id = nextCategoryId++;
              else if (tableName === 'products') id = nextProductId++;
              else id = Date.now() + Math.floor(Math.random() * 1000);
            }
            const item = {
              id,
              created_at: new Date().toISOString(),
              ...row,
            };
            store[tableName].push(item);
            created.push(item);
          }
          inserted = Array.isArray(rows) ? created : created[0];
          return chain;
        },
        update(payload) {
          operation = 'update';
          updatePayload = payload;
          return chain;
        },
        delete() {
          operation = 'delete';
          return chain;
        },
        single() {
          const res = execute();
          const item = Array.isArray(res) ? (res[0] || null) : (res || null);
          return Promise.resolve({ data: item, error: null });
        },
        then(resolve, reject) {
          const res = execute();
          return Promise.resolve({ data: res, error: null }).then(resolve, reject);
        },
      };

      return chain;
    },
    storage: {
      from(bucket) {
        return {
          upload: async (filename, buffer, options) => ({ data: { path: filename }, error: null }),
          getPublicUrl: (filename) => ({ data: { publicUrl: `/uploads/${filename}` } }),
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
