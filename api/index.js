import app from '../server/app.js';

// Vercel bu faylni "serverless function" sifatida ishga tushiradi.
// Express "app" o'zi (req, res) => {...} shaklidagi funksiya bo'lgani uchun
// uni to'g'ridan-to'g'ri export qilish yetarli — alohida handler yozish shart emas.
// DIQQAT: bu yerda app.listen(...) va bot.launch() CHAQIRILMAYDI — Vercelda
// doimiy jarayon (process) ishlamaydi, har bir so'rov alohida ishga tushadi.
export default function handler(req, res) {
  return app(req, res);
}
