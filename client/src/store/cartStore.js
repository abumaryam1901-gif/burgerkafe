import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [], // { id, name, price, image_url, quantity }

  addItem: (product) => {
    const items = get().items;
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      set({
        items: items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)),
      });
    } else {
      set({ items: [...items, { ...product, quantity: 1 }] });
    }
  },

  decreaseItem: (productId) => {
    const items = get().items;
    const existing = items.find((i) => i.id === productId);
    if (!existing) return;
    if (existing.quantity <= 1) {
      set({ items: items.filter((i) => i.id !== productId) });
    } else {
      set({ items: items.map((i) => (i.id === productId ? { ...i, quantity: i.quantity - 1 } : i)) });
    }
  },

  removeItem: (productId) => set({ items: get().items.filter((i) => i.id !== productId) }),

  clearCart: () => set({ items: [] }),

  getQuantity: (productId) => {
    const item = get().items.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  },

  getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
