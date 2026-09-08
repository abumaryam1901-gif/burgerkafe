import { LayoutDashboard, UtensilsCrossed, Tags, ClipboardList, Users, Store, LogOut, ArrowLeft } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Bosh sahifa', shortLabel: 'Asosiy', icon: LayoutDashboard },
  { id: 'products', label: 'Taomlar', shortLabel: 'Taomlar', icon: UtensilsCrossed },
  { id: 'categories', label: 'Kategoriyalar', shortLabel: 'Kategoriya', icon: Tags },
  { id: 'orders', label: 'Buyurtmalar', shortLabel: 'Buyurtma', icon: ClipboardList },
  { id: 'users', label: 'Foydalanuvchilar', shortLabel: 'Mijozlar', icon: Users },
  { id: 'settings', label: 'Oshxona profili', shortLabel: 'Oshxona', icon: Store },
];

export default function Sidebar({ active, onSelect, onLogout, onClose }) {
  return (
    <>
      {/* MOBILE: Yuqori ixcham sarlavha paneli (faqat kichik ekranlar uchun) */}
      <header className="md:hidden bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍔</span>
          <div>
            <h1 className="text-sm font-bold leading-tight">Burger Kafe</h1>
            <p className="text-[10px] text-slate-400 leading-none">Boshqaruv paneli</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              title="Mijoz ilovasiga qaytish"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30 hover:bg-amber-400/25 active:scale-95 transition"
            >
              <ArrowLeft size={14} />
              <span>Ilova</span>
            </button>
          )}
          <button
            onClick={onLogout}
            title="Chiqish"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 active:scale-95 transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* MOBILE: Pastki navigatsiya menyusi (ekranning eng pastida qotirilgan) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-1 py-1 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition active:scale-95 ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition ${
                  isActive ? 'bg-blue-600/25 text-blue-400 shadow-xs' : ''
                }`}
              >
                <Icon size={18} />
              </div>
              <span className="text-[9.5px] leading-tight mt-0.5 tracking-tight truncate max-w-[54px]">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>

      {/* DESKTOP: Chap tomondagi to'liq sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white min-h-screen flex-col shrink-0">
        <div className="p-5 border-b border-slate-800">
          <h1 className="text-lg font-bold">🍔 Burger Kafe</h1>
          <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            title="Mijoz ilovasiga qaytish"
            className="mx-3 mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-300 hover:bg-slate-800 transition cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>Ilovaga qaytish</span>
          </button>
        )}

        <nav className="flex-1 p-3 space-y-1 mt-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isActive ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={onLogout}
            title="Chiqish"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition cursor-pointer"
          >
            <LogOut size={18} />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>
    </>
  );
}
