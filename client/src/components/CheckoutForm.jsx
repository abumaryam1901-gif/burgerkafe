import { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { useCartStore } from '../store/cartStore.js';
import { getTelegramUser, requestLocation, hapticNotify } from '../lib/telegram.js';
import { createOrder } from '../lib/api.js';

export default function CheckoutForm({ open, onClose, onSuccess }) {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const tgUser = getTelegramUser();

  const [name, setName] = useState(tgUser ? `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() : '');
  const [phone, setPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState('yetkazib_berish');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('naqd');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleGetLocation = async () => {
    const loc = await requestLocation();
    if (loc) setLocation(loc);
    else setError('Lokatsiyani olib bo\'lmadi, iltimos manzilni qo\'lda kiriting');
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim() || !phone.trim()) {
      setError('Ism va telefon raqamini kiriting');
      return;
    }
    if (deliveryType === 'yetkazib_berish' && !address.trim() && !location) {
      setError('Manzil kiriting yoki lokatsiya yuboring');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        telegram_user_id: tgUser?.id || Math.floor(100000 + Math.random() * 900000),
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        delivery_type: deliveryType,
        address: address.trim() || null,
        location_lat: location?.latitude || null,
        location_lng: location?.longitude || null,
        payment_method: paymentMethod,
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      };
      const result = await createOrder(payload);
      hapticNotify('success');
      clearCart();
      try {
        const savedIds = JSON.parse(localStorage.getItem('my_order_ids') || '[]');
        if (result.order_id && !savedIds.includes(result.order_id)) {
          savedIds.unshift(result.order_id);
          localStorage.setItem('my_order_ids', JSON.stringify(savedIds.slice(0, 50)));
        }
      } catch (e) {
        console.error('Failed to save order ID to localStorage:', e);
      }
      onSuccess(result.order_id);
    } catch (err) {
      setError(err.message);
      hapticNotify('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-white dark:bg-[#1E1E22] text-gray-900 dark:text-white rounded-t-3xl max-h-[90vh] overflow-y-auto p-4 shadow-2xl animate-slide-up border-t border-gray-100 dark:border-white/10">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-white/10">
          <h2 className="font-bold text-lg">Buyurtmani rasmiylashtirish</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-zinc-400">Ismingiz</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-white outline-none focus:border-[#8B1121] dark:focus:border-[#A61427] transition"
              placeholder="Ism Familiya"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-zinc-400">Telefon raqam</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-white outline-none focus:border-[#8B1121] dark:focus:border-[#A61427] transition"
              placeholder="+998 90 123 45 67"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setDeliveryType('yetkazib_berish')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                deliveryType === 'yetkazib_berish'
                  ? 'bg-[#8B1121] dark:bg-[#A61427] text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
              }`}
            >
              🚗 Yetkazib berish
            </button>
            <button
              onClick={() => setDeliveryType('olib_ketish')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                deliveryType === 'olib_ketish'
                  ? 'bg-[#8B1121] dark:bg-[#A61427] text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
              }`}
            >
              🏃 Olib ketish
            </button>
          </div>

          {deliveryType === 'yetkazib_berish' && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-zinc-400">Manzil</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-white outline-none focus:border-[#8B1121] dark:focus:border-[#A61427] transition"
                placeholder="Ko'cha, uy raqami"
              />
              <button
                onClick={handleGetLocation}
                className="flex items-center gap-1.5 text-sm font-medium text-[#8B1121] dark:text-[#ff4d6d] mt-2 active:opacity-80 transition"
              >
                <MapPin size={16} /> {location ? 'Lokatsiya yuborildi ✓' : 'Lokatsiyani yuborish'}
              </button>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-zinc-400">To'lov usuli</label>
            <div className="flex gap-2 mt-1">
              {['naqd', 'click', 'payme'].map((pm) => (
                <button
                  key={pm}
                  onClick={() => setPaymentMethod(pm)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition ${
                    paymentMethod === pm
                      ? 'bg-[#8B1121] dark:bg-[#A61427] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <div className="flex justify-between font-bold text-base pt-2">
            <span>Jami:</span>
            <span>{getTotalPrice().toLocaleString()} so'm</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#8B1121] dark:bg-[#A61427] hover:bg-[#730e1b] text-white py-3 rounded-2xl font-semibold shadow-md active:scale-[0.99] transition disabled:opacity-60"
          >
            {loading ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}
