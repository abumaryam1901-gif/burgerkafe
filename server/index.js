import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import app from './app.js';
import { bot } from './bot.js';

dotenv.config();

// Bu fayl FAQAT lokal (localhost) yoki doimiy server (Render/Railway/VPS)
// muhitida ishga tushiriladi. Vercelda esa api/index.js orqali serverless
// funksiya sifatida ishlaydi (u yerda bu fayl umuman chaqirilmaydi).

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const clientDir = path.resolve(rootDir, 'client');
const clientDistDir = path.resolve(clientDir, 'dist');

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
    const express = (await import('express')).default;
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

const PORT = process.env.PORT || 3000;

setupFrontend().then(() => {
  // Bot ishga tushirish (agar token mavjud bo'lsa) — faqat doimiy serverda ishlaydi
  bot.launch()
    .then(() => console.log('🤖 Telegram bot ishga tushdi'))
    .catch((err) => console.warn('Telegram bot ishga tushmadi:', err.message));

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server http://0.0.0.0:${PORT} da ishlayapti`);
  });
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
