import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    `Assalomu alaykum, ${ctx.from.first_name}! 👋\n\nFastfood buyurtma tizimimizga xush kelibsiz. Menyuni ko'rish va buyurtma berish uchun quyidagi tugmani bosing:`,
    Markup.inlineKeyboard([
      Markup.button.webApp('🍔 Menyuni ochish', process.env.MINI_APP_URL)
    ])
  );
});

// Mijozga xabarnoma yuborish
export async function notifyCustomer(telegramUserId, orderId) {
  try {
    await bot.telegram.sendMessage(
      telegramUserId,
      `✅ Buyurtmangiz qabul qilindi!\n\n📦 Buyurtma ID: #${orderId}\n\nOshxonamiz buyurtmangizni tayyorlashni boshladi. Holatini kuzatib boring!`
    );
  } catch (err) {
    console.error('Mijozga xabar yuborishda xato:', err.message);
  }
}

// Oshxona/admin guruhiga xabarnoma yuborish
export async function notifyAdminGroup(order, items) {
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
    await bot.telegram.sendMessage(process.env.TELEGRAM_ADMIN_CHAT_ID, message);

    if (order.location_lat && order.location_lng) {
      await bot.telegram.sendLocation(
        process.env.TELEGRAM_ADMIN_CHAT_ID,
        order.location_lat,
        order.location_lng
      );
    }
  } catch (err) {
    console.error('Admin guruhiga xabar yuborishda xato:', err.message);
  }
}
