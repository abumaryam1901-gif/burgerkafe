import { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { adminApi } from '../lib/adminApi.js';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = () => {
    setLoading(true);
    setError('');
    adminApi
      .getStats()
      .then((data) => setStats(data.stats))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading && !stats) {
    return <div className="p-6 text-slate-500">Statistika yuklanmoqda...</div>;
  }

  const byStatus = stats?.by_status || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Boshqaruv paneli</h1>
          <p className="text-slate-500 text-sm mt-0.5">Bugungi ko'rsatkichlar va buyurtmalar statistikasi</p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Yangilash</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Bugungi buyurtmalar</span>
            <Clock size={18} className="text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {stats?.today_orders || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Bugun qabul qilingan</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Jami buyurtmalar</span>
            <ShoppingBag size={18} className="text-[#8B1121]" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {stats?.total_orders || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Barcha vaqt davomida</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Umumiy tushum</span>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {Number(stats?.total_revenue || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">so'm</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Muvaffaqiyatli buyurtmalar</div>
        </div>
      </div>

      {/* Status Breakdown Grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">Statuslar bo'yicha buyurtmalar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-center">
            <span className="text-xs font-medium text-blue-700 block">Yangi</span>
            <span className="text-xl font-bold text-blue-900 block mt-1">{byStatus.yangi || 0}</span>
          </div>
          <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-xl text-center">
            <span className="text-xs font-medium text-amber-700 block">Tayyorlanmoqda</span>
            <span className="text-xl font-bold text-amber-900 block mt-1">{byStatus.tayyorlanmoqda || 0}</span>
          </div>
          <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl text-center">
            <span className="text-xs font-medium text-purple-700 block">Yo'lda</span>
            <span className="text-xl font-bold text-purple-900 block mt-1">{byStatus.yolda || 0}</span>
          </div>
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center">
            <span className="text-xs font-medium text-emerald-700 block">Yetkazildi</span>
            <span className="text-xl font-bold text-emerald-900 block mt-1">{byStatus.yetkazildi || 0}</span>
          </div>
          <div className="p-3.5 bg-red-50/70 border border-red-100 rounded-xl text-center">
            <span className="text-xs font-medium text-red-700 block">Bekor qilindi</span>
            <span className="text-xl font-bold text-red-900 block mt-1">{byStatus.bekor_qilindi || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
