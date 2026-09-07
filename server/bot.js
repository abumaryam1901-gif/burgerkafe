import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const hasBot = Boolean(token && token !== 'your_bot_token');

export const bot = hasBot
  ? new Telegraf(token)
  : {
      start: () => {},
      launch: async () => {
        console.log('🤖 Telegram bot skipped (TELEGRAM_BOT_TOKEN not provided)');
      },
      stop: () => {},
      telegram: {
        sendMessage: async (chatId, text) => {
          console.log(`[Telegram Bot Log] sendMessage to ${chatId}:\n${text}`);
          return { message_id: Date.now() };
        },
        sendLocation: async (chatId, lat, lng) => {
          console.log(`[Telegram Bot Log] sendLocation to ${chatId}: ${lat}, ${lng}`);
          return { message_id: Date.now() };
        },
      },
    };

if (hasBot) {
  bot.start((ctx) => {
    ctx.reply(
      `Assalomu alaykum, ${ctx.from.first_name}! 👋\n\nFastfood buyurtma tizimimizga xush kelibsiz. Menyuni ko'rish va buyurtma berish uchun quyidagi tugmani bosing:`,
      Markup.inlineKeyboard([
        Markup.button.webApp('🍔 Menyuni ochish', process.env.MINI_APP_URL || 'http://localhost:3000')
      ])
    );
  });
}

// Mijozga xabarnoma yuborish
export async function notifyCustomer(telegramUserId, orderId) {
  try {
    if (!telegramUserId) return;
    await bot.telegram.sendMessage(
      telegramUserId,
      `✅ Buyurtmangiz qabul qilindi!\n\n📦 Buyurtma ID: #${orderId}\n\nOshxonamiz buyurtmangizni tayyorlashni boshladi. Holatini kuzatib boring!`
    );
  } catch (err) {
    console.warn('Mijozga xabar yuborishda ogohlantirish:', err.message);
  }
}

const STATUS_LABELS = {
  yangi: '🆕 Yangi',
  tayyorlanmoqda: '👨‍🍳 Tayyorlanmoqda',
  yolda: '🚗 Yo\'lda',
  yetkazildi: '✅ Yetkazildi',
  bekor_qilindi: '❌ Bekor qilindi',
};

// Buyurtma statusi o'zgarganda mijozga xabar yuborish
export async function notifyCustomerStatusUpdate(telegramUserId, orderId, status) {
  try {
    if (!telegramUserId) return;
    const label = STATUS_LABELS[status] || status;
    await bot.telegram.sendMessage(
      telegramUserId,
      `📦 Buyurtma #${orderId} holati yangilandi:\n\n${label}`
    );
  } catch (err) {
    console.warn('Status xabarini yuborishda ogohlantirish:', err.message);
  }
}

// Oshxona/admin guruhiga xabarnoma yuborish
export async function notifyAdminGroup(order, items) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) {
    console.log(`[Order Log] Admin xabarnomasi: Buyurtma #${order.id} qabul qilindi (${order.customer_name})`);
    return;
  }

  const deliveryText = order.delivery_type === 'yetkazib_berish' ? '🚗 Yetkazib berish' : '🏃 Olib ketish';
  const paymentText = { naqd: '💵 Naqd', click: '💳 Click', payme: '💳 Payme' }[order.payment_method] || order.payment_method;

  let itemsText = items
    .map((it) => `• ${it.name} x${it.quantity} — ${(it.price_at_order * it.quantity).toLocaleString()} so'm`)
    .join('\n');

  let addressBlock = '';
  if (order.delivery_type === 'yetkazib_berish') {
    addressBlock = order.address ? `📍 Manzil: ${order.address}\n` : '';
  }

  const message =
    `🆕 YANGI BUYURTMA #${order.id}\n\n` +
    `👤 Mijoz: ${order.customer_name}\n` +
    `📞 Tel: ${order.customer_phone}\n` +
    `${deliveryText}\n` +
    addressBlock +
    `💳 To'lov: ${paymentText}\n\n` +
    `🛒 Buyurtma tarkibi:\n${itemsText}\n\n` +
    `💰 Jami: ${Number(order.total_price).toLocaleString()} so'm`;

  try {
    await bot.telegram.sendMessage(adminChatId, message);

    if (order.location_lat && order.location_lng) {
      await bot.telegram.sendLocation(
        adminChatId,
        order.location_lat,
        order.location_lng
      );
    }
  } catch (err) {
    console.warn('Admin guruhiga xabar yuborishda ogohlantirish:', err.message);
  }
}
