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
      <div className="relative w-full max-w-md mx-auto bg-tg-bg rounded-t-3xl max-h-[90vh] overflow-y-auto p-4 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Buyurtmani rasmiylashtirish</h2>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-tg-hint">Ismingiz</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-tg-secondaryBg outline-none"
              placeholder="Ism Familiya"
            />
          </div>

          <div>
            <label className="text-sm text-tg-hint">Telefon raqam</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-tg-secondaryBg outline-none"
              placeholder="+998 90 123 45 67"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setDeliveryType('yetkazib_berish')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                deliveryType === 'yetkazib_berish' ? 'bg-tg-button text-tg-buttonText' : 'bg-tg-secondaryBg'
              }`}
            >
              🚗 Yetkazib berish
            </button>
            <button
              onClick={() => setDeliveryType('olib_ketish')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                deliveryType === 'olib_ketish' ? 'bg-tg-button text-tg-buttonText' : 'bg-tg-secondaryBg'
              }`}
            >
              🏃 Olib ketish
            </button>
          </div>

          {deliveryType === 'yetkazib_berish' && (
            <div>
              <label className="text-sm text-tg-hint">Manzil</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl bg-tg-secondaryBg outline-none"
                placeholder="Ko'cha, uy raqami"
              />
              <button
                onClick={handleGetLocation}
                className="flex items-center gap-1 text-sm text-tg-button mt-2"
              >
                <MapPin size={16} /> {location ? 'Lokatsiya yuborildi ✓' : 'Lokatsiyani yuborish'}
              </button>
            </div>
          )}

          <div>
            <label className="text-sm text-tg-hint">To'lov usuli</label>
            <div className="flex gap-2 mt-1">
              {['naqd', 'click', 'payme'].map((pm) => (
                <button
                  key={pm}
                  onClick={() => setPaymentMethod(pm)}
                  className={`flex-1 py-2 rounded-xl text-sm capitalize ${
                    paymentMethod === pm ? 'bg-tg-button text-tg-buttonText' : 'bg-tg-secondaryBg'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between font-bold pt-2">
            <span>Jami:</span>
            <span>{getTotalPrice().toLocaleString()} so'm</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-tg-button text-tg-buttonText py-3 rounded-xl font-semibold disabled:opacity-60"
          >
            {loading ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}
