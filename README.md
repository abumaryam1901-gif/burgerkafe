# 🍔 Fastfood Telegram Mini App

Fastfood oshxonasi uchun to'liq ishlaydigan Telegram Mini App buyurtma tizimi.

## Struktura

```
fastfood-tma/
├── client/          # React + Vite + Tailwind (Vercel'ga deploy qilinadi)
├── server/          # Node.js + Express + Telegraf (Render'ga deploy qilinadi)
└── supabase/
    └── schema.sql   # Supabase SQL Editor'da ishga tushiriladigan skript
```

## O'rnatish tartibi

### 1. Supabase
1. Yangi loyiha yarating: https://supabase.com
2. **SQL Editor** ga o'ting va `supabase/schema.sql` faylini to'liq nusxalab ishga tushiring.
3. **Project Settings → API** dan `SUPABASE_URL` va `service_role` kalitni oling.

### 2. Telegram Bot
1. @BotFather orqali yangi bot yarating, tokenni saqlab qo'ying.
2. Botni oshxona admin guruhiga qo'shing, `TELEGRAM_ADMIN_CHAT_ID`ni @getidsbot yordamida aniqlang.

### 3. Backend (Render)
```bash
cd server
npm install
cp .env.example .env   # va qiymatlarni to'ldiring
npm run dev             # lokal test uchun
```
Render'da:
- New Web Service → GitHub repo → Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: `.env.example`dagi barcha o'zgaruvchilar

### 4. Frontend (Vercel)
```bash
cd client
npm install
cp .env.example .env   # VITE_API_URL ni to'ldiring
npm run dev             # lokal test uchun
```
Vercel'da:
- New Project → GitHub repo → Root Directory: `client`
- Framework Preset: Vite
- Environment Variables: `VITE_API_URL=https://xxx.onrender.com`

### 5. Bog'lash
- Render'dagi `MINI_APP_URL` ni Vercel URL bilan yangilang, qayta deploy qiling.
- Botga `/start` yuboring — Mini App tugmasi chiqadi.

## Texnologiyalar
- **Frontend:** React, Vite, Tailwind CSS, Zustand, Lucide Icons, Telegram WebApp SDK
- **Backend:** Node.js, Express, Telegraf
- **Database:** Supabase (PostgreSQL)
