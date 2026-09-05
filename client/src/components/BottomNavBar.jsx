import { Home, Heart, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../store/cartStore.js';
import { hapticImpact } from '../lib/telegram.js';

export default function BottomNavBar({ activeTab, onTabChange, onOpenCart, onOpenProfile }) {
  const totalCount = useCartStore((s) => s.getTotalCount());
  const favorites = useCartStore((s) => s.favorites || []);

  const handleTabClick = (tab) => {
    hapticImpact('light');
    if (tab === 'cart') {
      onOpenCart();
    } else if (tab === 'profile') {
      onOpenProfile();
    } else {
      onTabChange(tab);
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 max-w-sm mx-auto px-5 z-40 pointer-events-none">
      <nav
        aria-label="Pastki menyu"
        className="pointer-events-auto bg-[#8B1121] dark:bg-[#780e1c] text-white rounded-full py-3 px-7 flex items-center justify-between shadow-[0_10px_28px_rgba(139,17,33,0.42)] border border-white/10 backdrop-blur-xs transition-transform active:scale-[0.99]"
      >
        {/* Home Tab */}
        <button
          onClick={() => handleTabClick('home')}
          className="relative p-2 flex items-center justify-center transition-transform active:scale-90 text-white"
          title="Asosiy menyu"
          aria-label="Asosiy menyu"
        >
          <Home
            size={23}
            strokeWidth={2.2}
            className={`transition-all ${
              activeTab === 'home'
                ? 'fill-white text-white scale-110'
                : 'text-white/80 hover:text-white'
            }`}
          />
        </button>

        {/* Favorites Tab */}
        <button
          onClick={() => handleTabClick('favorites')}
          className="relative p-2 flex items-center justify-center transition-transform active:scale-90 text-white"
          title="Saralanganlar"
          aria-label="Saralanganlar"
        >
          <Heart
            size={23}
            strokeWidth={2.2}
            className={`transition-all ${
              activeTab === 'favorites'
                ? 'fill-white text-white scale-110'
                : 'text-white/80 hover:text-white'
            }`}
          />
          {favorites.length > 0 && activeTab !== 'favorites' && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#8B1121]" />
          )}
        </button>

        {/* Cart Tab */}
        <button
          onClick={() => handleTabClick('cart')}
          className="relative p-2 flex items-center justify-center transition-transform active:scale-90 text-white"
          title="Savat"
          aria-label="Savat"
        >
          <ShoppingCart
            size={23}
            strokeWidth={2.2}
            className="text-white/90 hover:text-white transition-all"
          />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-[#8B1121] text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs ring-2 ring-[#8B1121]">
              {totalCount}
            </span>
          )}
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => handleTabClick('profile')}
          className="relative p-2 flex items-center justify-center transition-transform active:scale-90 text-white"
          title="Profil"
          aria-label="Profil"
        >
          <User
            size={23}
            strokeWidth={2.2}
            className={`transition-all ${
              activeTab === 'profile'
                ? 'fill-white text-white scale-110'
                : 'text-white/80 hover:text-white'
            }`}
          />
        </button>
      </nav>
    </div>
  );
}
