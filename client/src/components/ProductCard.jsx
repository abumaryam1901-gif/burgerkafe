import { useState } from 'react';
import { Plus, Minus, Heart } from 'lucide-react';
import { useCartStore } from '../store/cartStore.js';
import { hapticImpact } from '../lib/telegram.js';

export default function ProductCard({ product, categoryName, onSelect }) {
  const isFavorite = useCartStore((s) => s.isFavorite(product.id));
  const toggleFavorite = useCartStore((s) => s.toggleFavorite);
  const addItem = useCartStore((s) => s.addItem);
  const decreaseItem = useCartStore((s) => s.decreaseItem);
  const quantity = useCartStore((s) => s.getQuantity(product.id));

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(product, categoryName);
    }
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    hapticImpact('light');
    addItem(product);
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    hapticImpact('light');
    decreaseItem(product.id);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    hapticImpact('light');
    toggleFavorite(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative bg-white dark:bg-[#1E1E22] dark:hover:bg-[#232328] rounded-3xl p-3.5 flex flex-col justify-between border border-gray-100 dark:border-white/10 shadow-[0_4px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.35)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.09)] transition-all cursor-pointer active:scale-[0.99]"
    >
      {/* Favorite Heart Button */}
      <button
        onClick={handleToggleFavorite}
        className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full flex items-center justify-center text-[#8B1121] dark:text-[#ff4d6d] active:scale-90 transition-transform bg-white/90 dark:bg-zinc-800/90 shadow-xs border border-gray-100 dark:border-white/10"
        aria-label="Sevimlilarga qo'shish"
      >
        <Heart
          size={20}
          strokeWidth={2.2}
          className="transition-colors"
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
        />
      </button>

      {/* Product Image */}
      <div className="w-full pt-1 pb-2 flex items-center justify-center overflow-hidden">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'}
          alt={product.name}
          className="w-full h-32 object-cover rounded-2xl select-none"
          loading="lazy"
        />
      </div>

      {/* Text Info */}
      <div className="mt-1 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-[15px] leading-snug line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs font-normal text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
            {categoryName || product.description || 'Fastfood'}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between mt-3 pt-1">
          <div className="flex items-baseline gap-0.5">
            <span className="font-bold text-gray-900 dark:text-white text-[15px]">
              {Number(product.price).toLocaleString()}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium ml-1">
              so'm
            </span>
          </div>

          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="w-8 h-8 rounded-lg bg-[#8B1121] hover:bg-[#730e1b] dark:bg-[#A61427] dark:hover:bg-[#bc172c] text-white flex items-center justify-center shadow-xs active:scale-90 transition"
              aria-label="Savatga qo'shish"
            >
              <Plus size={18} strokeWidth={2.6} />
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-[#8B1121] dark:bg-[#A61427] text-white rounded-lg p-1 shadow-xs">
              <button
                onClick={handleDecrease}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/15 active:scale-90 transition"
                aria-label="Kamaytirish"
              >
                <Minus size={13} strokeWidth={2.6} />
              </button>
              <span className="text-xs font-bold px-1 min-w-[14px] text-center leading-none">
                {quantity}
              </span>
              <button
                onClick={handleAdd}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/15 active:scale-90 transition"
                aria-label="Ko'paytirish"
              >
                <Plus size={13} strokeWidth={2.6} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
