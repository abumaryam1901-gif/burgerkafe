import { LayoutDashboard, UtensilsCrossed, Tags, ClipboardList, Users, Store, LogOut, ArrowLeft } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
  { id: 'products', label: 'Taomlar', icon: UtensilsCrossed },
  { id: 'categories', label: 'Kategoriyalar', icon: Tags },
  { id: 'orders', label: 'Buyurtmalar', icon: ClipboardList },
  { id: 'users', label: 'Foydalanuvchilar', icon: Users },
  { id: 'settings', label: 'Oshxona profili', icon: Store },
];

export default function Sidebar({ active, onSelect, onLogout, onClose }) {
  return (
    <aside className="w-16 md:w-64 bg-slate-900 text-white min-h-screen flex flex-col shrink-0 transition-all">
      <div className="p-3 md:p-5 border-b border-slate-800 flex items-center justify-center md:justify-start">
        <div className="hidden md:block">
          <h1 className="text-lg font-bold">🍔 Burger Kafe</h1>
          <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
        </div>
        <span className="md:hidden text-2xl">🍔</span>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          title="Mijoz ilovasiga qaytish"
          className="mx-2 mt-3 md:mx-3 flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 rounded-xl text-sm font-medium text-amber-300 hover:bg-slate-800 transition"
        >
          <ArrowLeft size={18} />
          <span className="hidden md:inline">Ilovaga qaytish</span>
        </button>
      )}

      <nav className="flex-1 p-2 md:p-3 space-y-1 mt-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              title={item.label}
              className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-2 md:p-3 border-t border-slate-800">
        <button
          onClick={onLogout}
          title="Chiqish"
          className="w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">Chiqish</span>
        </button>
      </div>
    </aside>
  );
}
