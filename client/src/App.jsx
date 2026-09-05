import { useEffect, useState } from 'react';
import { ShoppingCart, Sun, Moon, SearchX, Heart } from 'lucide-react';
import { initTelegram } from './lib/telegram.js';
import { fetchMenu } from './lib/api.js';
import { useCartStore } from './store/cartStore.js';
import ProductCard from './components/ProductCard.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import SearchBar from './components/SearchBar.jsx';
import BottomNavBar from './components/BottomNavBar.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutForm from './components/CheckoutForm.jsx';
import logoImg from './assets/logo.png';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    return (
      document.documentElement.classList.contains('dark') ||
      (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
    );
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const totalCount = useCartStore((s) => s.getTotalCount());
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const favorites = useCartStore((s) => s.favorites || []);

  useEffect(() => {
    initTelegram();
    fetchMenu()
      .then((data) => {
        setCategories(data.categories || []);
        setProducts(data.products || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'favorites' && !favorites.includes(p.id)) {
      return false;
    }
    const matchesCat = activeCategory ? p.category_id === activeCategory : true;
    const matchesSearch = searchTerm.trim()
      ? p.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase().trim()))
      : true;
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-tg-hint">Yuklanmoqda...</p>
      </div>
    );
  }

  if (successOrderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-2">Buyurtmangiz qabul qilindi!</h2>
        <p className="text-tg-hint mb-6">Buyurtma ID: #{successOrderId}</p>
        <button
          onClick={() => setSuccessOrderId(null)}
          className="bg-tg-button text-tg-buttonText px-6 py-3 rounded-xl font-semibold"
        >
          Menyuga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto relative bg-[#F7F8FA] dark:bg-[#121214] text-gray-900 dark:text-white shadow-sm transition-colors duration-200">
      <header className="p-4 border-b border-gray-200/70 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Burger Kafe Logo"
            className="w-11 h-11 object-contain rounded-full shadow-xs bg-white dark:bg-white/10 p-0.5"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Burger Kafe</h1>
            <p className="text-[11px] font-medium text-gray-500 dark:text-zinc-400">Tez va mazali menyu</p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E1E22] border border-gray-200/80 dark:border-white/10 text-gray-700 dark:text-amber-400 shadow-xs active:scale-90 transition"
          title="Mavzuni almashtirish"
          aria-label="Mavzuni almashtirish"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Search Bar matching the design */}
      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      {/* Category Filter Pills */}
      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onSelect={setActiveCategory}
        />
      )}

      {/* Favorites Tab Indicator */}
      {activeTab === 'favorites' && (
        <div className="px-4 pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
            <Heart size={18} className="text-[#8B1121] dark:text-[#ff4d6d] fill-current" />
            <span>Saralangan taomlar ({filteredProducts.length})</span>
          </div>
          <button
            onClick={() => setActiveTab('home')}
            className="text-xs font-semibold text-[#8B1121] dark:text-[#ff4d6d] hover:underline"
          >
            Barchasini ko'rish
          </button>
        </div>
      )}

      {/* Products Grid */}
      <main className="px-4 mt-2">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-3 text-gray-400 dark:text-zinc-500">
              {activeTab === 'favorites' ? (
                <Heart size={28} strokeWidth={1.8} />
              ) : (
                <SearchX size={28} strokeWidth={1.8} />
              )}
            </div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
              {activeTab === 'favorites' ? "Sevimli taomlar yo'q" : 'Hech narsa topilmadi'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-xs mb-4">
              {activeTab === 'favorites'
                ? "Taomlardagi yurakcha belgisini bosib, sevimli taomlaringizni shu yerga saqlab qo'ying."
                : `"${searchTerm}" bo'yicha hech qanday mahsulot topilmadi. Qidiruv so'zini o'zgartirib ko'ring.`}
            </p>
            <button
              onClick={() => {
                if (activeTab === 'favorites') {
                  setActiveTab('home');
                } else {
                  setSearchTerm('');
                  setActiveCategory(null);
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#8B1121] dark:bg-[#A61427] text-white shadow-xs active:scale-95 transition"
            >
              {activeTab === 'favorites' ? "Menyuga o'tish" : 'Qidiruvni tozalash'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={categories.find((c) => c.id === product.category_id)?.name}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Crimson Pill Bottom Menu Bar (transitions into Order Action Bar when cart has items) */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenCart={() => setCartOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onOpenFavorites={() => setActiveTab('favorites')}
        onOpenCart={() => setCartOpen(true)}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutForm
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={(orderId) => {
          setCheckoutOpen(false);
          setSuccessOrderId(orderId);
        }}
      />
    </div>
  );
}
