import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore.js';
import { hapticImpact } from '../lib/telegram.js';

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { items, addItem, decreaseItem, removeItem, getTotalPrice } = useCartStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-white dark:bg-[#1E1E22] text-gray-900 dark:text-white rounded-t-3xl max-h-[80vh] flex flex-col animate-slide-up shadow-2xl border-t border-gray-100 dark:border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
          <h2 className="font-bold text-lg">Savatcha</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800">
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {items.length === 0 && <p className="text-gray-400 text-center py-8">Savatcha bo'sh</p>}
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/80 border border-gray-100 dark:border-white/5 rounded-2xl p-2.5">
              <img
                src={item.image_url || 'https://placehold.co/100x100'}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 font-semibold mt-0.5">{Number(item.price).toLocaleString()} so'm</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    hapticImpact('light');
                    decreaseItem(item.id);
                  }}
                  className="w-7 h-7 rounded-full bg-white dark:bg-zinc-700 shadow-xs flex items-center justify-center active:scale-90 transition"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => {
                    hapticImpact('light');
                    addItem(item);
                  }}
                  className="w-7 h-7 rounded-full bg-white dark:bg-zinc-700 shadow-xs flex items-center justify-center active:scale-90 transition"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600 p-1">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-white/10">
            <div className="flex justify-between mb-3 font-bold text-base">
              <span>Jami:</span>
              <span>{getTotalPrice().toLocaleString()} so'm</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-[#8B1121] dark:bg-[#A61427] hover:bg-[#730e1b] text-white py-3 rounded-2xl font-semibold shadow-md active:scale-[0.99] transition"
            >
              Buyurtmani rasmiylashtirish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
