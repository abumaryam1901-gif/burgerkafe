import { useEffect, useState } from 'react';
import {
  X,
  User,
  Phone,
  Clock,
  MapPin,
  ShieldCheck,
  Heart,
  ShoppingBag,
  Package,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Bike,
  ChevronRight,
} from 'lucide-react';
import { getTelegramUser } from '../lib/telegram.js';
import { useCartStore } from '../store/cartStore.js';
import { fetchSettings, fetchMyOrders } from '../lib/api.js';

const DEFAULT_SETTINGS = {
  name: 'Burger Kafe',
  logo_url: null,
  working_hours: 'Har kuni 10:00 dan 23:00 gacha',
  phone: '+998 71 200 00 00',
  address: 'Toshkent shahri, Burger Kafe filiali',
  payment_info: "Naqd pul va karta (Payme / Click) orqali",
};

const STATUS_CONFIG = {
  yangi: {
    label: 'Qabul qilindi',
    icon: Clock,
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  tayyorlanmoqda: {
    label: 'Tayyorlanmoqda',
    icon: ChefHat,
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300/40',
    dotClass: 'bg-blue-500 animate-pulse',
  },
  yetkazilmoqda: {
    label: 'Yetkazilmoqda',
    icon: Bike,
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300/40',
    dotClass: 'bg-purple-500 animate-pulse',
  },
  bajarildi: {
    label: 'Yetkazildi',
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40',
    dotClass: 'bg-emerald-500',
  },
  bekor_qilindi: {
    label: 'Bekor qilingan',
    icon: AlertCircle,
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300/40',
    dotClass: 'bg-red-500',
  },
};

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  if (isToday) {
    return `Bugun, ${timeStr}`;
  }
  const dateStr = d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  return `${dateStr}, ${timeStr}`;
}

export default function ProfileModal({ open, onClose, onOpenFavorites, onOpenCart }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'info'
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const favoritesCount = useCartStore((s) => (s.favorites || []).length);
  const cartCount = useCartStore((s) => s.getTotalCount());

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const tgUser = getTelegramUser();
      let savedIds = [];
      try {
        savedIds = JSON.parse(localStorage.getItem('my_order_ids') || '[]');
      } catch {}
      const res = await fetchMyOrders({
        telegramUserId: tgUser?.id,
        orderIds: savedIds,
      });
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load my orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchSettings()
      .then((d) => {
        if (d.settings) setSettings({ ...DEFAULT_SETTINGS, ...d.settings });
      })
      .catch(() => {});

    loadOrders();
  }, [open]);

  if (!open) return null;

  const tgUser = getTelegramUser();
  const userName = tgUser
    ? `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || tgUser.username
    : 'Qadrli Mijoz';
  const userHandle = tgUser?.username ? `@${tgUser.username}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#1C1C1F] text-gray-900 dark:text-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-gray-100 dark:border-white/10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#8B1121]/10 dark:bg-[#8B1121]/20 flex items-center justify-center text-[#8B1121] dark:text-[#ff4d6d] overflow-hidden">
              <User size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">{userName}</h3>
              {userHandle ? (
                <p className="text-xs text-gray-500 dark:text-zinc-400">{userHandle}</p>
              ) : (
                <p className="text-[11px] text-[#8B1121] dark:text-[#ff4d6d] font-medium">
                  {settings.name} mijozi
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 bg-gray-100 dark:bg-zinc-800 transition active:scale-95 cursor-pointer"
            aria-label="Yopish"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 my-3 shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`p-2.5 rounded-xl border text-left transition active:scale-95 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-red-50 dark:bg-[#8B1121]/20 border-[#8B1121]/40 text-[#8B1121] dark:text-[#ff4d6d]'
                : 'bg-[#F7F8FA] dark:bg-[#232328] border-gray-200/60 dark:border-white/5 text-gray-600 dark:text-zinc-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <Package size={16} strokeWidth={2.2} />
              <span className="text-xs font-bold">{orders.length}</span>
            </div>
            <div className="text-[11px] font-semibold mt-1">Buyurtmalar</div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenFavorites();
            }}
            className="p-2.5 rounded-xl bg-[#F7F8FA] dark:bg-[#232328] border border-gray-200/60 dark:border-white/5 text-left active:scale-95 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-red-500">
              <Heart size={16} strokeWidth={2.2} />
              <span className="text-xs font-bold">{favoritesCount}</span>
            </div>
            <div className="text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mt-1">Sevimlilar</div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenCart();
            }}
            className="p-2.5 rounded-xl bg-[#F7F8FA] dark:bg-[#232328] border border-gray-200/60 dark:border-white/5 text-left active:scale-95 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-amber-500">
              <ShoppingBag size={16} strokeWidth={2.2} />
              <span className="text-xs font-bold">{cartCount}</span>
            </div>
            <div className="text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mt-1">Savatda</div>
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-[#232328] p-1 mb-3 shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800'
            }`}
          >
            <Package size={14} />
            <span>Buyurtmalar tarixi</span>
            {orders.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-[#8B1121] text-white font-semibold">
                {orders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'info'
                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800'
            }`}
          >
            <Clock size={14} />
            <span>Kafe ma'lumotlari</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-0.5 space-y-3">
          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                  Oxirgi buyurtmalar
                </span>
                <button
                  onClick={loadOrders}
                  disabled={loadingOrders}
                  className="flex items-center gap-1 text-xs text-[#8B1121] dark:text-[#ff4d6d] font-semibold active:opacity-70 transition cursor-pointer"
                  title="Yangilash"
                >
                  <RefreshCw size={12} className={loadingOrders ? 'animate-spin' : ''} />
                  <span>Yangilash</span>
                </button>
              </div>

              {loadingOrders && orders.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#8B1121]" />
                  Yuklanmoqda...
                </div>
              ) : orders.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-[#F7F8FA] dark:bg-[#232328] border border-gray-200/60 dark:border-white/5 my-2">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag size={24} />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                    Hozircha buyurtmalar yo'q
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4 max-w-xs mx-auto leading-relaxed">
                    Menyudan mazali burger va ichimliklarni tanlab, birinchi buyurtmangizni bering!
                  </p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-[#8B1121] text-white text-xs font-bold hover:bg-[#A61427] transition shadow-xs cursor-pointer"
                  >
                    Menyuni ko'rish
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {orders.map((ord) => {
                    const statusInfo = STATUS_CONFIG[ord.status] || STATUS_CONFIG.yangi;
                    const StatusIcon = statusInfo.icon;
                    return (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-2xl bg-[#F7F8FA] dark:bg-[#232328] border border-gray-200/70 dark:border-white/10 shadow-2xs hover:border-gray-300 dark:hover:border-white/20 transition"
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                              #{ord.id}
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-zinc-400">
                              {formatDate(ord.created_at)}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusInfo.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                            <StatusIcon size={12} />
                            <span>{statusInfo.label}</span>
                          </span>
                        </div>

                        {/* Order Items Summary */}
                        {ord.items && ord.items.length > 0 && (
                          <div className="py-2 border-y border-gray-200/50 dark:border-white/5 my-2 space-y-1">
                            {ord.items.map((it, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs text-gray-700 dark:text-zinc-300"
                              >
                                <span className="truncate max-w-[220px]">
                                  <strong className="text-gray-900 dark:text-white font-semibold">
                                    {it.quantity}x
                                  </strong>{' '}
                                  {it.product_name}
                                </span>
                                <span className="text-gray-500 dark:text-zinc-400 text-[11px] font-mono">
                                  {(it.price_at_order * it.quantity).toLocaleString()} so'm
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Delivery details & Total */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center gap-1 truncate max-w-[180px]">
                            {ord.delivery_type === 'olib_ketish' ? (
                              <span>🏃 Olib ketish</span>
                            ) : (
                              <span className="truncate">
                                🚗 {ord.address || 'Yetkazib berish'}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-sm text-[#8B1121] dark:text-[#ff4d6d]">
                              {Number(ord.total_price || 0).toLocaleString()} so'm
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-2.5 text-xs text-gray-600 dark:text-zinc-300">
              {settings.description && (
                <p className="text-[13px] text-gray-700 dark:text-zinc-300 px-1 leading-relaxed">
                  {settings.description}
                </p>
              )}

              {settings.working_hours && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#232328]">
                  <Clock size={16} className="text-[#8B1121] dark:text-[#ff4d6d] shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">Ish vaqti:</span>
                    {settings.working_hours}
                  </div>
                </div>
              )}

              {settings.phone && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#232328]">
                  <Phone size={16} className="text-[#8B1121] dark:text-[#ff4d6d] shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">
                      Aloqa va yetkazish:
                    </span>
                    <a
                      href={`tel:${settings.phone}`}
                      className="text-[#8B1121] dark:text-[#ff4d6d] font-semibold hover:underline"
                    >
                      {settings.phone}
                    </a>
                  </div>
                </div>
              )}

              {settings.address && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#232328]">
                  <MapPin size={16} className="text-[#8B1121] dark:text-[#ff4d6d] shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">Manzil:</span>
                    {settings.address}
                  </div>
                </div>
              )}

              {settings.payment_info && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#232328]">
                  <ShieldCheck size={16} className="text-[#8B1121] dark:text-[#ff4d6d] shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">
                      To'lov turlari:
                    </span>
                    {settings.payment_info}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 dark:border-white/10 mt-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-[#8B1121] dark:bg-[#A61427] text-white shadow-xs active:scale-[0.98] transition cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}

