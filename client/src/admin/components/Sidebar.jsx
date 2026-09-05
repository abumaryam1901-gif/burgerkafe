import { LayoutDashboard, UtensilsCrossed, Tags, ClipboardList, Users, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
  { id: 'products', label: 'Taomlar', icon: UtensilsCrossed },
  { id: 'categories', label: 'Kategoriyalar', icon: Tags },
  { id: 'orders', label: 'Buyurtmalar', icon: ClipboardList },
  { id: 'users', label: 'Foydalanuvchilar', icon: Users },
];

export default function Sidebar({ active, onSelect, onLogout }) {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shrink-0">
      <div className="p-5 border-b border-slate-800">
        <h1 className="text-lg font-bold">🍔 Burger Kafe</h1>
        <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
        >
          <LogOut size={18} />
          Chiqish
        </button>
      </div>
    </aside>
  );
}
