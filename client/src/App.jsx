import { useEffect, useState } from 'react';
import { ShoppingCart, Sun, Moon, SearchX, Heart } from 'lucide-react';
import { initTelegram, getTelegramUser } from './lib/telegram.js';
import { fetchMenu, checkIsAdmin } from './lib/api.js';
import { useCartStore } from './store/cartStore.js';
import ProductCard from './components/ProductCard.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import SearchBar from './components/SearchBar.jsx';
import BottomNavBar from './components/BottomNavBar.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutForm from './components/CheckoutForm.jsx';
import ProductDetailModal from './components/ProductDetailModal.jsx';
import AdminApp from './admin/AdminApp.jsx';

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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successOrderId, setSuccessOrderId] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      (window.location.search.includes('admin') || window.location.hash.includes('admin'))
    );
  });
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
  const tgUser = getTelegramUser();

  useEffect(() => {
    initTelegram();
    fetchMenu()
      .then((data) => {
        setCategories(data.categories || []);
        setProducts(data.products || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Bu foydalanuvchi (Telegram ID bo'yicha) admin ekanligini tekshiramiz.
    // Bu faqat "Profil" tugmasi nima ochishini aniqlash uchun — haqiqiy
    // himoya Admin Panel ichidagi login (JWT) orqali ta'minlanadi.
    if (tgUser?.id) {
      checkIsAdmin(tgUser.id).then(setIsAdminUser);
    }
  }, [tgUser?.id]);

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

  const isRealTelegram = Boolean(
    typeof window !== 'undefined' &&
    window.Telegram?.WebApp?.initData &&
    window.Telegram.WebApp.initData.length > 0
  );

  // Admin Panel Mini App ichida to'liq ekran sifatida ochiladi.
  // "Ilovaga qaytish" tugmasi bosilsa, mijoz interfeysiga qaytadi.
  if (adminPanelOpen) {
    return <AdminApp onClose={() => setAdminPanelOpen(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-tg-hint">Yuklanmoqda...</p>
      </div>
    );
  }

  if (successOrderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#F7F8FA] dark:bg-[#121214] text-gray-900 dark:text-white">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Buyurtmangiz qabul qilindi!
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 font-medium">
          Buyurtma ID: #{successOrderId}
        </p>
        <button
          onClick={() => setSuccessOrderId(null)}
          className="bg-[#8B1121] hover:bg-[#730D1B] text-white px-8 py-3.5 rounded-[30px] border-none font-bold text-sm sm:text-base shadow-lg shadow-[#8B1121]/30 active:scale-95 transition cursor-pointer"
          style={{ borderRadius: '30px', borderStyle: 'none' }}
        >
          Menyuga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto relative bg-[#F7F8FA] dark:bg-[#121214] text-gray-900 dark:text-white shadow-sm transition-colors duration-200">
      {!isRealTelegram && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-2 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🧪</span>
            <span className="font-semibold text-gray-800 dark:text-zinc-200">
              {isAdminUser ? '👑 Admin ko‘rinishi' : '👤 Mijoz ko‘rinishi'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAdminUser(!isAdminUser)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-amber-500/30 font-semibold text-xs text-gray-800 dark:text-zinc-200 shadow-2xs hover:bg-amber-50 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              {isAdminUser ? "Mijozga o'tish" : "Admin qilish"}
            </button>
            <button
              type="button"
              onClick={() => setAdminPanelOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-[#8B1121] text-white font-semibold text-xs shadow-2xs hover:bg-[#A61427] transition cursor-pointer"
            >
              Admin Panel ↗
            </button>
          </div>
        </div>
      )}

      <header className="px-5 pt-4 pb-1">
        {/* Top Bar: User Profile Picture & Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
            title="Profil va buyurtmalar"
          >
            <div className="relative">
              <img
                src={
                  tgUser?.photo_url ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                }
                alt={tgUser?.first_name || 'Profil'}
                className="w-12 h-12 rounded-full object-cover shadow-2xs border-2 border-white dark:border-zinc-800 ring-1 ring-gray-200 dark:ring-white/10 group-hover:ring-[#8B1121] transition duration-200"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            {tgUser?.first_name && (
              <div className="hidden min-[380px]:block">
                <span className="text-[11px] text-gray-400 dark:text-zinc-500 block font-medium leading-none mb-0.5">
                  Salom,
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {tgUser.first_name}
                </span>
              </div>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#1E1E22] border border-gray-200/80 dark:border-white/10 text-gray-600 dark:text-amber-400 shadow-2xs active:scale-90 hover:bg-gray-50 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Mavzuni almashtirish"
              aria-label="Mavzuni almashtirish"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Title Matching Reference Screenshot */}
        <div className="mt-4 mb-1">
          <h1 className="text-[26px] sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.18]">
            Choose
            <br />
            Your Favorite <span className="text-[#8B1121] dark:text-[#ff4d6d]">Food</span>
          </h1>
        </div>
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
                onSelect={(prod, catName) =>
                  setSelectedProduct({ ...prod, categoryName: catName })
                }
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
        onOpenProfile={() => {
          // Admin bo'lsa — Profil tugmasi to'g'ridan-to'g'ri Admin Panelni ochadi.
          // Oddiy mijozlar uchun — odatdagidek ProfileModal ochiladi.
          if (isAdminUser) {
            setAdminPanelOpen(true);
          } else {
            setProfileOpen(true);
          }
        }}
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

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          categoryName={selectedProduct.categoryName}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
