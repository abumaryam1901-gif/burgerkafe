import { Plus, Minus } from 'lucide-react';
import { useCartStore } from '../store/cartStore.js';
import { hapticImpact } from '../lib/telegram.js';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const decreaseItem = useCartStore((s) => s.decreaseItem);
  const quantity = useCartStore((s) => s.getQuantity(product.id));

  const handleAdd = () => {
    hapticImpact('light');
    addItem(product);
  };

  const handleDecrease = () => {
    hapticImpact('light');
    decreaseItem(product.id);
  };

  return (
    <div className="bg-tg-secondaryBg rounded-2xl overflow-hidden flex flex-col">
      <img
        src={product.image_url || 'https://placehold.co/300x200?text=Fastfood'}
        alt={product.name}
        className="w-full h-28 object-cover"
      />
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-tg-hint mt-1 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-sm">{Number(product.price).toLocaleString()} so'm</span>

          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="bg-tg-button text-tg-buttonText w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition"
            >
              <Plus size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-tg-button text-tg-buttonText rounded-full px-1">
              <button onClick={handleDecrease} className="w-7 h-7 flex items-center justify-center active:scale-90">
                <Minus size={14} />
              </button>
              <span className="text-sm font-semibold min-w-[16px] text-center">{quantity}</span>
              <button onClick={handleAdd} className="w-7 h-7 flex items-center justify-center active:scale-90">
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
