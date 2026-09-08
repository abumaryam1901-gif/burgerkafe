-- =========================================
-- FASTFOOD TELEGRAM MINI APP — SCHEMA
-- =========================================

-- CATEGORIES
create table if not exists categories (
  id serial primary key,
  name text not null,
  slug text not null unique,
  icon text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- PRODUCTS
create table if not exists products (
  id serial primary key,
  category_id int references categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- ORDERS
create type delivery_type_enum as enum ('yetkazib_berish', 'olib_ketish');
create type order_status_enum as enum ('yangi', 'tayyorlanmoqda', 'yolda', 'yetkazildi', 'bekor_qilindi');
create type payment_method_enum as enum ('naqd', 'click', 'payme');

create table if not exists orders (
  id serial primary key,
  telegram_user_id bigint not null,
  customer_name text not null,
  customer_phone text not null,
  delivery_type delivery_type_enum not null,
  address text,
  location_lat double precision,
  location_lng double precision,
  total_price numeric(10,2) not null,
  status order_status_enum default 'yangi',
  payment_method payment_method_enum default 'naqd',
  created_at timestamptz default now()
);

-- ORDER ITEMS
create table if not exists order_items (
  id serial primary key,
  order_id int references orders(id) on delete cascade,
  product_id int references products(id),
  quantity int not null check (quantity > 0),
  price_at_order numeric(10,2) not null
);

-- INDEXLAR
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_orders_telegram_user on orders(telegram_user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_order_items_order on order_items(order_id);

-- RLS (Row Level Security)
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Public read categories" on categories for select using (true);
create policy "Public read products" on products for select using (true);
-- orders va order_items faqat backend (service_role) orqali yoziladi/o'qiladi,
-- shuning uchun policy qo'shmaymiz — service_role RLS'ni bypass qiladi.

-- =========================================
-- BOSHLANG'ICH FASTFOOD MA'LUMOTLARI
-- =========================================

insert into categories (name, slug, icon, sort_order) values
('Burgerlar', 'burgers', '🍔', 1),
('Lavashlar', 'lavash', '🌯', 2),
('Ichimliklar', 'drinks', '🥤', 3),
('Qo''shimchalar', 'sides', '🍟', 4)
on conflict (slug) do nothing;

insert into products (category_id, name, description, price, image_url, is_available) values
(1, 'Cheeseburger', 'Mol go''shti, pishloq, pomidor, salat', 28000, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', true),
(1, 'Double Burger', 'Ikki qavat go''sht, cheddar, sous', 38000, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500', true),
(1, 'Chicken Burger', 'Panirovkali tovuq filesi, majonez sous', 26000, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', true),
(2, 'Klassik Lavash', 'Tovuq go''shti, sabzavotlar, sous', 22000, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500', true),
(2, 'Katta Lavash', 'Ikki xil go''sht, ko''p sabzavot', 30000, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500', true),
(3, 'Coca-Cola 0.5L', 'Sovutilgan gazli ichimlik', 8000, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500', true),
(3, 'Fanta 0.5L', 'Sovutilgan gazli ichimlik', 8000, 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=500', true),
(4, 'Kartoshka Fri', 'Xrustkash kartoshka fri, o''rtacha porsiya', 14000, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500', true),
(4, 'Sous (ketchup/majonez)', 'Qo''shimcha sous', 3000, null, true)
on conflict do nothing;

-- =========================================
-- OSHXONA PROFILI (restaurant_settings)
-- =========================================
-- Bitta qatorli sozlamalar jadvali — admin panelda tahrirlanadi,
-- mijoz ilovasida (Profil oynasida) ko'rsatiladi.
create table if not exists restaurant_settings (
  id int primary key default 1,
  name text not null default 'Burger Kafe',
  description text default '',
  logo_url text,
  phone text default '',
  address text default '',
  working_hours text default '',
  payment_info text default '',
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

alter table restaurant_settings enable row level security;
create policy "Public read restaurant settings" on restaurant_settings for select using (true);
-- Yozish/yangilash faqat backend (service_role) orqali amalga oshiriladi

insert into restaurant_settings (id, name, description, phone, address, working_hours, payment_info)
values (
  1,
  'Burger Kafe',
  'Tez va mazali fastfood taomlari',
  '+998 71 200 00 00',
  'Toshkent shahri, Burger Kafe filiali',
  'Har kuni 10:00 dan 23:00 gacha',
  'Naqd pul va karta (Payme / Click) orqali'
)
on conflict (id) do nothing;
