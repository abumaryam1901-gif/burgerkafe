import { useState, useEffect } from 'react';
import { Home, Heart, ShoppingCart, User, ChevronLeft, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore.js';
import { hapticImpact } from '../lib/telegram.js';

export default function BottomNavBar({ activeTab, onTabChange, onOpenCart, onOpenProfile }) {
  const totalCount = useCartStore((s) => s.getTotalCount());
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const favorites = useCartStore((s) => s.favorites || []);
  const [showFullNav, setShowFullNav] = useState(false);

  useEffect(() => {
    if (totalCount === 0) {
      setShowFullNav(false);
    }
  }, [totalCount]);

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
    <div className="fixed bottom-4 left-0 right-0 max-w-sm mx-auto px-4 z-40 pointer-events-none">
      {totalCount > 0 && !showFullNav ? (
        /* State 3: Vibrant Order Action Bar when cart has items */
        <div className="pointer-events-auto bg-[#8B1121] dark:bg-[#780e1c] text-white rounded-full p-2 pl-3 pr-2 flex items-center justify-between shadow-[0_10px_32px_rgba(139,17,33,0.48)] border border-white/10 backdrop-blur-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Menu button to switch back to 4-icon nav if user wants */}
          <button
            onClick={() => {
              hapticImpact('light');
              setShowFullNav(true);
            }}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white active:scale-90 transition shrink-0 cursor-pointer"
            title="Menyuga qaytish"
            aria-label="Menyuga qaytish"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          {/* Checkout & Total Summary */}
          <button
            onClick={() => {
              hapticImpact('medium');
              onOpenCart();
            }}
            className="flex-1 flex items-center justify-between pl-3 pr-1 text-left active:scale-[0.98] transition"
          >
            <div className="flex flex-col">
              <span className="text-[11px] text-white/80 font-medium leading-none">
                {totalCount} ta taom
              </span>
              <span className="text-sm font-black text-white mt-0.5 leading-tight">
                {totalPrice.toLocaleString()} so'm
              </span>
            </div>

            <div className="flex items-center justify-center bg-white text-[#8B1121] px-4 py-2 rounded-full font-bold text-xs shadow-xs hover:bg-gray-100 active:scale-95 transition">
              <span>Buyurtma berish</span>
            </div>
          </button>
        </div>
      ) : (
        /* 4-icon standard navigation pill */
        <nav
          aria-label="Pastki menyu"
          className="pointer-events-auto bg-[#8B1121] dark:bg-[#780e1c] text-white rounded-full py-3 px-6 flex items-center justify-between shadow-[0_10px_28px_rgba(139,17,33,0.42)] border border-white/10 backdrop-blur-xs transition-transform active:scale-[0.99] animate-in fade-in duration-150"
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

          {/* If cart has items and user is viewing the full 4 icons, show close icon to return to order bar */}
          {totalCount > 0 && (
            <button
              onClick={() => {
                hapticImpact('light');
                setShowFullNav(false);
              }}
              className="p-1.5 rounded-full bg-white/20 text-white active:scale-90 transition ml-1"
              title="Buyurtma tugmasiga qaytish"
              aria-label="Buyurtmaga qaytish"
            >
              <X size={16} strokeWidth={2.4} />
            </button>
          )}
        </nav>
      )}
    </div>
  );
}
