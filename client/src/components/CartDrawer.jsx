import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore.js';
import { hapticImpact } from '../lib/telegram.js';

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { items, addItem, decreaseItem, removeItem, getTotalPrice } = useCartStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-tg-bg rounded-t-3xl max-h-[80vh] flex flex-col animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-tg-secondaryBg">
          <h2 className="font-bold text-lg">Savatcha</h2>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {items.length === 0 && <p className="text-tg-hint text-center py-8">Savatcha bo'sh</p>}
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-tg-secondaryBg rounded-xl p-2">
              <img
                src={item.image_url || 'https://placehold.co/100x100'}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-tg-hint">{Number(item.price).toLocaleString()} so'm</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    hapticImpact('light');
                    decreaseItem(item.id);
                  }}
                  className="w-7 h-7 rounded-full bg-tg-bg flex items-center justify-center"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => {
                    hapticImpact('light');
                    addItem(item);
                  }}
                  className="w-7 h-7 rounded-full bg-tg-bg flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-red-500 ml-1">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-tg-secondaryBg">
            <div className="flex justify-between mb-3 font-bold">
              <span>Jami:</span>
              <span>{getTotalPrice().toLocaleString()} so'm</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-tg-button text-tg-buttonText py-3 rounded-xl font-semibold"
            >
              Buyurtmani rasmiylashtirish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
