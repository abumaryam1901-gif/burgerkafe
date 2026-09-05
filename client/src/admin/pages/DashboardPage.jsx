import { useEffect, useState } from 'react';
import { ShoppingBag, Calendar, Wallet } from 'lucide-react';
import { adminApi } from '../lib/adminApi.js';

const STATUS_LABELS = {
  yangi: 'Yangi',
  tayyorlanmoqda: 'Tayyorlanmoqda',
  yolda: "Yo'lda",
  yetkazildi: 'Yetkazildi',
  bekor_qilindi: 'Bekor qilindi',
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getStats()
      .then((d) => setStats(d.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Yuklanmoqda...</p>;
  if (!stats) return <p className="text-red-500">Statistikani yuklab bo'lmadi</p>;

  const cards = [
    { label: 'Jami buyurtmalar', value: stats.total_orders, icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Bugungi buyurtmalar', value: stats.today_orders, icon: Calendar, color: 'bg-green-500' },
    { label: 'Jami tushum', value: `${stats.total_revenue.toLocaleString()} so'm`, icon: Wallet, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Bosh sahifa</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className={`${card.color} text-white p-3 rounded-xl`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">{card.label}</p>
                <p className="text-xl font-bold text-slate-800">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4">Statuslar bo'yicha</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(stats.by_status).map(([status, count]) => (
            <div key={status} className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">{count}</p>
              <p className="text-xs text-slate-500 mt-1">{STATUS_LABELS[status] || status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
