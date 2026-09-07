import { useEffect, useState } from 'react';
import { MapPin, Phone, X } from 'lucide-react';
import { adminApi } from '../lib/adminApi.js';

const STATUS_OPTIONS = [
  { value: 'hammasi', label: 'Barchasi' },
  { value: 'yangi', label: 'Yangi' },
  { value: 'tayyorlanmoqda', label: 'Tayyorlanmoqda' },
  { value: 'yolda', label: "Yo'lda" },
  { value: 'yetkazildi', label: 'Yetkazildi' },
  { value: 'bekor_qilindi', label: 'Bekor qilindi' },
];

const STATUS_COLORS = {
  yangi: 'bg-blue-100 text-blue-700',
  tayyorlanmoqda: 'bg-amber-100 text-amber-700',
  yolda: 'bg-purple-100 text-purple-700',
  yetkazildi: 'bg-green-100 text-green-700',
  bekor_qilindi: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('hammasi');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    adminApi
      .getOrders(filter)
      .then((d) => setOrders(d.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
    // Har 15 soniyada yangi buyurtmalarni avtomatik yangilash
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatusChange = async (order, status) => {
    try {
      await adminApi.updateOrderStatus(order.id, status);
      load();
      if (selected?.id === order.id) setSelected({ ...selected, status });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Buyurtmalar</h2>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                filter === opt.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Yuklanmoqda...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="p-4 font-medium">#</th>
                <th className="p-4 font-medium">Mijoz</th>
                <th className="p-4 font-medium">Turi</th>
                <th className="p-4 font-medium">Summa</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Vaqt</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className="border-t border-slate-100 cursor-pointer hover:bg-slate-50"
                >
                  <td className="p-4 font-medium text-slate-800">#{order.id}</td>
                  <td className="p-4 text-slate-700">{order.customer_name}</td>
                  <td className="p-4 text-slate-500">
                    {order.delivery_type === 'yetkazib_berish' ? '🚗 Yetkazib berish' : '🏃 Olib ketish'}
                  </td>
                  <td className="p-4 font-medium text-slate-800">{Number(order.total_price).toLocaleString()} so'm</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_OPTIONS.find((s) => s.value === order.status)?.label}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-xs">
                    {new Date(order.created_at).toLocaleString('uz-UZ')}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Buyurtmalar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800">Buyurtma #{selected.id}</h3>
              <button onClick={() => setSelected(null)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Mijoz</span>
                <span className="font-medium text-slate-800">{selected.customer_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1"><Phone size={14} /> Telefon</span>
                <a href={`tel:${selected.customer_phone}`} className="font-medium text-blue-600">
                  {selected.customer_phone}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Yetkazish</span>
                <span className="font-medium text-slate-800">
                  {selected.delivery_type === 'yetkazib_berish' ? '🚗 Yetkazib berish' : '🏃 Olib ketish'}
                </span>
              </div>
              {selected.address && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500 flex items-center gap-1 shrink-0"><MapPin size={14} /> Manzil</span>
                  <span className="font-medium text-slate-800 text-right">{selected.address}</span>
                </div>
              )}
              {selected.location_lat && (
                <a
                  href={`https://maps.google.com/?q=${selected.location_lat},${selected.location_lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center bg-slate-100 rounded-xl p-2 text-blue-600 font-medium"
                >
                  📍 Xaritada ko'rish
                </a>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">To'lov</span>
                <span className="font-medium text-slate-800 capitalize">{selected.payment_method}</span>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-slate-500 mb-2">Tarkibi:</p>
                <div className="space-y-1.5">
                  {(selected.order_items || []).map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-700">
                      <span>{item.products?.name || `Mahsulot #${item.product_id}`} x{item.quantity}</span>
                      <span>{(item.price_at_order * item.quantity).toLocaleString()} so'm</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-3">
                <span>Jami</span>
                <span>{Number(selected.total_price).toLocaleString()} so'm</span>
              </div>

              <div className="pt-2">
                <p className="text-slate-500 mb-2">Statusni o'zgartirish:</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.filter((s) => s.value !== 'hammasi').map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusChange(selected, opt.value)}
                      className={`p-2 rounded-xl text-xs font-medium border transition ${
                        selected.status === opt.value
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
