import { useState, useEffect } from 'react';
import { ChevronLeft, Star, Plus, Minus, Check } from 'lucide-react';
import { useCartStore } from '../store/cartStore.js';
import { hapticImpact, hapticNotify } from '../lib/telegram.js';

export default function ProductDetailModal({ product, categoryName, onClose }) {
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'reviews'
  const [isExpanded, setIsExpanded] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isFavorite = useCartStore((s) => (product ? s.isFavorite(product.id) : false));
  const toggleFavorite = useCartStore((s) => s.toggleFavorite);
  const addItem = useCartStore((s) => s.addItem);
  const currentInCart = useCartStore((s) => (product ? s.getQuantity(product.id) : 0));

  // Local quantity in the modal
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (currentInCart > 0) {
      setQty(currentInCart);
    } else {
      setQty(1);
    }
  }, [product, currentInCart]);

  useEffect(() => {
    // Prevent body scrolling while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!product) return null;

  const handleIncrease = () => {
    hapticImpact('light');
    setQty((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (qty > 1) {
      hapticImpact('light');
      setQty((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    hapticNotify('success');
    for (let i = 0; i < qty; i++) {
      addItem(product);
    }
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 450);
  };

  const description =
    product.description ||
    `${product.name} — eng yangi va sifatli mahsulotlardan, tabiiy souslar va yangi pishirilgan yumshoq non bilan maxsus retsept asosida tayyorlangan.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full sm:h-[90vh] sm:max-h-[820px] bg-white dark:bg-[#161619] text-gray-900 dark:text-white sm:rounded-[36px] shadow-2xl flex flex-col overflow-hidden">
        {/* Top Curved Red Background Banner matching reference image */}
        <div className="relative w-full bg-white dark:bg-[#161619] shrink-0">
          {/* The Red Arc / Dome shape extending downwards behind the food */}
          <div
            className="relative w-full h-[270px] sm:h-[290px] bg-[#8B1121] dark:bg-[#730D1B] shadow-md flex items-center justify-center overflow-hidden"
            style={{
              borderBottomLeftRadius: '50% 32%',
              borderBottomRightRadius: '50% 32%',
            }}
          >
            {/* Top Floating Controls: Back Button */}
            <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
              {/* Back Button matching white circle */}
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white text-gray-900 shadow-md flex items-center justify-center hover:bg-gray-100 active:scale-90 transition cursor-pointer"
                aria-label="Orqaga"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
              </button>
            </div>

            {/* Large Hero Product Image positioned on top of the red curved arc */}
            <div className="relative z-20 w-60 h-60 sm:w-68 sm:h-68 flex items-center justify-center transition-transform hover:scale-105 duration-300 mt-2">
              <img
                src={
                  product.image_url ||
                  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600'
                }
                alt={product.name}
                className="max-w-full max-h-full object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.45)] select-none"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600';
                }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-2 -mt-2">
          {/* Product Title and Price Header */}
          <div className="flex items-start justify-between gap-4 mt-2 mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                {product.name}
              </h2>
              <p className="text-sm font-semibold text-gray-400 dark:text-zinc-400 mt-1">
                {categoryName || 'Fastfood'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xl sm:text-2xl font-black text-[#8B1121] dark:text-[#ff4d6d] tracking-tight">
                {Number(product.price).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 block -mt-1">
                so'm
              </span>
            </div>
          </div>

          {/* Pill Tabs: Details / Reviews */}
          <div className="flex items-center gap-3 my-4">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-[#8B1121] text-white shadow-md shadow-[#8B1121]/30'
                  : 'bg-gray-100 dark:bg-[#232328] text-gray-600 dark:text-zinc-400 hover:text-gray-900'
              }`}
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-[#8B1121] text-white shadow-md shadow-[#8B1121]/30'
                  : 'bg-gray-100 dark:bg-[#232328] text-gray-600 dark:text-zinc-400 hover:text-gray-900'
              }`}
            >
              <span>Reviews</span>
              <span className="flex items-center text-amber-400 text-xs">
                <Star size={12} fill="currentColor" /> 4.9
              </span>
            </button>
          </div>

          {/* Tab 1: Details */}
          {activeTab === 'details' && (
            <div className="space-y-3 text-gray-600 dark:text-zinc-300 text-sm leading-relaxed pb-4">
              <p>
                {isExpanded ? description : `${description.slice(0, 130)}... `}
                {description.length > 130 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="font-bold text-[#8B1121] dark:text-[#ff4d6d] hover:underline cursor-pointer inline ml-1"
                  >
                    {isExpanded ? 'Kamroq ko\'rsatish' : 'See more.'}
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Tab 2: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-3 pb-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                    4.9
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">A'lo darajada</div>
                    <div className="text-[11px] text-gray-500">120+ mijozlar baholagan</div>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              </div>

              {/* Sample Review */}
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#202024] text-xs space-y-1 border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 dark:text-white">Jasur R.</span>
                  <span className="text-[10px] text-gray-400">Kecha</span>
                </div>
                <p className="text-gray-600 dark:text-zinc-300">
                  «Juda mazali burger, go'shti shirali va qarsildoq non bilan ajoyib kombinatsiya bo'lgan!»
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar matching reference image */}
        <div className="p-4 sm:p-5 bg-white/95 dark:bg-[#161619]/95 backdrop-blur-md border-t border-gray-100 dark:border-white/10 shrink-0 flex items-center justify-between gap-4">
          {/* Quantity Selector: [-]  count  [+] */}
          <div className="flex items-center gap-3 bg-gray-100 dark:bg-[#232328] rounded-full p-1.5 px-2">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={qty <= 1}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition active:scale-90 cursor-pointer ${
                qty <= 1
                  ? 'bg-gray-300 dark:bg-zinc-700 cursor-not-allowed opacity-60'
                  : 'bg-[#8B1121] hover:bg-[#730D1B]'
              }`}
              aria-label="Kamaytirish"
            >
              <Minus size={16} strokeWidth={2.6} />
            </button>
            <span className="font-black text-base min-w-[20px] text-center text-gray-900 dark:text-white">
              {qty}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              className="w-9 h-9 rounded-full bg-[#8B1121] hover:bg-[#730D1B] flex items-center justify-center text-white transition active:scale-90 cursor-pointer"
              aria-label="Ko'paytirish"
            >
              <Plus size={16} strokeWidth={2.6} />
            </button>
          </div>

          {/* Order Big Red Pill Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-6 rounded-full font-bold text-sm sm:text-base text-white bg-[#8B1121] hover:bg-[#730D1B] active:scale-[0.98] shadow-lg shadow-[#8B1121]/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {addedAnimation ? (
              <>
                <Check size={20} strokeWidth={3} className="animate-bounce" />
                <span>Qo'shildi!</span>
              </>
            ) : (
              <span>Buyurtma</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
