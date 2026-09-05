# 🍔 Burger Kafe — Telegram Mini App + Admin Panel

Fastfood oshxonasi uchun to'liq ishlaydigan Telegram Mini App buyurtma tizimi va uni boshqarish uchun Admin Panel.

## Struktura

```
burgerkafe/
├── client/                  # React + Vite + Tailwind
│   └── src/
│       ├── App.jsx          # Mijozlar uchun Mini App (menyu, savat, buyurtma)
│       ├── components/      # Mini App komponentlari
│       └── admin/           # 🆕 Admin Panel (/admin yo'lida ochiladi)
│           ├── AdminApp.jsx
│           ├── AdminLogin.jsx
│           ├── components/Sidebar.jsx
│           └── pages/       # Dashboard, Products, Categories, Orders, Users
├── server/                  # Node.js + Express + Telegraf
│   ├── index.js              # Asosiy server (API + client build'ni serve qiladi)
│   ├── bot.js                 # Telegram bot logikasi va xabarnomalar
│   ├── middleware/adminAuth.js  # 🆕 JWT autentifikatsiya
│   ├── lib/upload.js          # 🆕 Rasm yuklash (Supabase Storage)
│   └── routes/admin.js        # 🆕 Admin API endpointlari
└── supabase/
    └── schema.sql             # Supabase SQL Editor'da ishga tushiriladigan skript
```

## Admin Panel

Mini App bilan bir xil domenda, **`/admin`** yo'lida ochiladi (masalan `https://sizning-app.com/admin`).

### Kirish
- Login: `.env` dagi `ADMIN_USERNAME` (standart: `admin`)
- Parol: `.env` dagi `ADMIN_PASSWORD` (standart: `admin123`)

**Muhim:** productionga chiqishdan oldin `ADMIN_USERNAME`, `ADMIN_PASSWORD` va `JWT_SECRET`ni albatta o'zgartiring!

### Nima nazorat qilinadi

| Bo'lim | Imkoniyatlar |
|---|---|
| **Bosh sahifa** | Jami buyurtmalar, bugungi buyurtmalar, jami tushum, statuslar bo'yicha statistika |
| **Taomlar** | Yaratish, tahrirlash, o'chirish, yashirish/ko'rsatish (hide/show), rasm yuklash yoki URL kiritish, kategoriya bo'yicha filtrlash |
| **Kategoriyalar** | To'liq CRUD (yaratish, tahrirlash, o'chirish), tartib raqami va emoji-ikonka |
| **Buyurtmalar** | Status bo'yicha filtrlash, batafsil ko'rish (mahsulotlar, mijoz, manzil, lokatsiya xaritada), statusni o'zgartirish — **status o'zgarganda mijozga Telegram orqali avtomatik xabar boradi** |
| **Foydalanuvchilar** | Buyurtma bergan har bir mijoz: ism, telefon, buyurtmalar soni, jami xarid summasi, oxirgi buyurtma vaqti |

Buyurtmalar sahifasi har 15 soniyada avtomatik yangilanadi, shuning uchun yangi buyurtmalarni sahifani qayta yuklamasdan ko'rish mumkin.

## O'rnatish tartibi

### 1. Supabase
1. Yangi loyiha yarating: https://supabase.com
2. **SQL Editor** ga o'ting va `supabase/schema.sql` faylini to'liq nusxalab ishga tushiring.
   - Bu kategoriyalar, mahsulotlar, buyurtmalar jadvallarini yaratadi
   - Boshlang'ich fastfood ma'lumotlarini qo'shadi
   - Mahsulot rasmlari uchun `products` nomli **Storage bucket**ni yaratadi (public)
3. **Project Settings → API** dan `SUPABASE_URL` va `service_role` kalitni oling.

### 2. Telegram Bot
1. @BotFather orqali yangi bot yarating, tokenni saqlab qo'ying.
2. Botni oshxona admin guruhiga qo'shing, `TELEGRAM_ADMIN_CHAT_ID`ni @getidsbot yordamida aniqlang.

### 3. Muhit o'zgaruvchilari (.env)
```bash
cp .env.example .env
```
Va quyidagilarni to'ldiring:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `MINI_APP_URL`
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` — admin panelga kirish uchun **o'zingiznikini qo'ying**
- `JWT_SECRET` — uzun, tasodifiy satr (masalan `openssl rand -hex 32` orqali generatsiya qiling)
- `SUPABASE_STORAGE_BUCKET=products`

### 4. Lokal ishga tushirish
```bash
npm install
npm run dev
```
Server `http://localhost:3000` da ishga tushadi:
- Mini App: `http://localhost:3000`
- Admin Panel: `http://localhost:3000/admin`

### 5. Production'ga deploy qilish
Bu loyiha **bitta xizmat** sifatida deploy qilinadi (frontend build'ini backend o'zi serve qiladi):

- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Barcha `.env.example` dagi o'zgaruvchilarni Environment Variables bo'limiga kiriting

Deploy tugagach, bot orqali `/start` yuboring — Mini App tugmasi chiqadi. Admin panelga esa `https://sizning-domen.com/admin` orqali kiring.

## Texnologiyalar
- **Frontend:** React, Vite, Tailwind CSS, Zustand, Lucide Icons, Telegram WebApp SDK
- **Admin Panel:** React (bir xil client ichida, `/admin` yo'li), JWT autentifikatsiya
- **Backend:** Node.js, Express, Telegraf, JSON Web Token, Multer
- **Database & Storage:** Supabase (PostgreSQL + Storage)

## Xavfsizlik eslatmalari
- `ADMIN_PASSWORD` va `JWT_SECRET`ni **hech qachon** standart qiymatda qoldirmang
- `.env` faylini hech qachon Git'ga qo'shmang (`.gitignore`da allaqachon bor)
- Admin panel havolasini faqat ishonchli xodimlarga bering
