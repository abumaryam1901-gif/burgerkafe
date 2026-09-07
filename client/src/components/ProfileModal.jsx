import { useEffect, useState } from 'react';
import { X, User, Phone, Clock, MapPin, ShieldCheck, Heart, ShoppingBag } from 'lucide-react';
import { getTelegramUser } from '../lib/telegram.js';
import { useCartStore } from '../store/cartStore.js';
import { fetchSettings } from '../lib/api.js';

const DEFAULT_SETTINGS = {
  name: 'Burger Kafe',
  logo_url: null,
  working_hours: 'Har kuni 10:00 dan 23:00 gacha',
  phone: '+998 71 200 00 00',
  address: 'Toshkent shahri, Burger Kafe filiali',
  payment_info: "Naqd pul va karta (Payme / Click) orqali",
};

export default function ProfileModal({ open, onClose, onOpenFavorites, onOpenCart }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const favoritesCount = useCartStore((s) => (s.favorites || []).length);
  const cartCount = useCartStore((s) => s.getTotalCount());

  useEffect(() => {
    if (!open) return;
    fetchSettings()
      .then((d) => {
        if (d.settings) setSettings({ ...DEFAULT_SETTINGS, ...d.settings });
      })
      .catch(() => {
        // Xatolik bo'lsa standart ma'lumotlar bilan qolaveramiz
      });
  }, [open]);

  if (!open) return null;

  const tgUser = getTelegramUser();
  const userName = tgUser ? `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || tgUser.username : 'Qadrli Mijoz';
  const userHandle = tgUser?.username ? `@${tgUser.username}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#1C1C1F] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-gray-100 dark:border-white/10 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#8B1121]/10 dark:bg-[#8B1121]/20 flex items-center justify-center text-[#8B1121] dark:text-[#ff4d6d] overflow-hidden">
              {tgUser ? (
                <User size={24} strokeWidth={2.2} />
              ) : (
                <User size={24} strokeWidth={2.2} />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                {userName}
              </h3>
              {userHandle ? (
                <p className="text-xs text-gray-500 dark:text-zinc-400">{userHandle}</p>
              ) : (
                <p className="text-[11px] text-[#8B1121] dark:text-[#ff4d6d] font-medium">
                  {settings.name} a'zosi
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 bg-gray-100 dark:bg-zinc-800 transition active:scale-95"
            aria-label="Yopish"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          <button
            onClick={() => {
              onClose();
              onOpenFavorites();
            }}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F7F8FA] dark:bg-[#232328] border border-gray-200/60 dark:border-white/5 text-left active:scale-95 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-[#8B1121] dark:text-[#ff4d6d]">
              <Heart size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-zinc-400">Sevimlilar</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">{favoritesCount} ta</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenCart();
            }}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F7F8FA] dark:bg-[#232328] border border-gray-200/60 dark:border-white/5 text-left active:scale-95 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShoppingBag size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-zinc-400">Savatda</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">{cartCount} ta</div>
            </div>
          </button>
        </div>

        {/* Kafe Info — admin panelda tahrirlanadigan ma'lumotlar */}
        <div className="space-y-2.5 mb-5 text-xs text-gray-600 dark:text-zinc-300">
          {settings.description && (
            <p className="text-[13px] text-gray-700 dark:text-zinc-300 px-1">{settings.description}</p>
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
                <span className="font-semibold text-gray-900 dark:text-white block">Aloqa va yetkazish:</span>
                {settings.phone}
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
                <span className="font-semibold text-gray-900 dark:text-white block">To'lov turlari:</span>
                {settings.payment_info}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-sm bg-[#8B1121] dark:bg-[#A61427] text-white shadow-xs active:scale-[0.98] transition"
        >
          Tushunarli
        </button>
      </div>
    </div>
  );
}
