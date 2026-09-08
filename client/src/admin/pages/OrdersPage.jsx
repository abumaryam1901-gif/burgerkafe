import { useEffect, useState } from 'react';
import { RefreshCw, Phone, MapPin, CheckCircle, Clock, Truck, XCircle, AlertCircle } from 'lucide-react';
import { adminApi } from '../lib/adminApi.js';

const STATUS_LABELS = {
  yangi: { label: 'Yangi', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
  tayyorlanmoqda: { label: 'Tayyorlanmoqda', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  yolda: { label: 'Yo\'lda', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Truck },
  yetkazildi: { label: 'Yetkazildi', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  bekor_qilindi: { label: 'Bekor qilindi', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('hammasi');
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getOrders(selectedStatus);
      setOrders(res.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await adminApi.updateOrderStatus(id, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert('Statusni o\'zgartirishda xatolik: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Buyurtmalar ro'yxati</h1>
          <p className="text-slate-500 text-sm">Kelib tushgan buyurtmalarni ko'rish va boshqarish</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition w-fit"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {['hammasi', 'yangi', 'tayyorlanmoqda', 'yolda', 'yetkazildi', 'bekor_qilindi'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3.5 py-2 rounded-xl border transition whitespace-nowrap ${
              selectedStatus === st
                ? 'bg-[#8B1121] text-white border-[#8B1121]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st === 'hammasi' ? 'Barchasi' : STATUS_LABELS[st]?.label || st}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Orders Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Buyurtmalar yuklanmoqda...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Ushbu statusda hech qanday buyurtma topilmadi
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => {
            const stMeta = STATUS_LABELS[order.status] || {
              label: order.status,
              color: 'bg-slate-100 text-slate-700',
            };
            const created = new Date(order.created_at || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-base font-black text-slate-900">
                        #{order.id}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">{created}</span>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold border ${stMeta.color}`}
                    >
                      {stMeta.label}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="py-3 text-xs space-y-1.5 border-b border-slate-100">
                    <div className="font-bold text-slate-900 text-sm">{order.customer_name}</div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone size={13} className="text-slate-400" />
                      <a href={`tel:${order.customer_phone}`} className="hover:underline font-semibold">
                        {order.customer_phone}
                      </a>
                    </div>
                    {order.address && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span>{order.address}</span>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400">
                      Yetkazish: <span className="font-semibold text-slate-700 capitalize">{order.delivery_type}</span> | To'lov: <span className="font-semibold text-slate-700 uppercase">{order.payment_method}</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="py-3 space-y-1.5 text-xs">
                    <div className="font-semibold text-slate-500 uppercase text-[10px]">Tarkibi:</div>
                    {(order.order_items || []).map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-700">
                        <span>
                          {it.products?.name || `Mahsulot #${it.product_id}`} <span className="font-bold text-slate-900">x{it.quantity}</span>
                        </span>
                        <span className="font-semibold text-slate-900">
                          {(it.price_at_order * it.quantity).toLocaleString()} so'm
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer with Total & Status Selector */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Jami:</span>
                    <span className="text-base font-black text-[#8B1121]">
                      {Number(order.total_price).toLocaleString()} so'm
                    </span>
                  </div>

                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="p-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#8B1121] bg-white cursor-pointer"
                  >
                    <option value="yangi">Yangi</option>
                    <option value="tayyorlanmoqda">Tayyorlanmoqda</option>
                    <option value="yolda">Yo'lda</option>
                    <option value="yetkazildi">Yetkazildi</option>
                    <option value="bekor_qilindi">Bekor qilindi</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
