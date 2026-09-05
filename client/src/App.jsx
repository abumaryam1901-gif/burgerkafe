import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { initTelegram } from './lib/telegram.js';
import { fetchMenu } from './lib/api.js';
import { useCartStore } from './store/cartStore.js';
import CategoryFilter from './components/CategoryFilter.jsx';
import ProductCard from './components/ProductCard.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutForm from './components/CheckoutForm.jsx';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState(null);

  const totalCount = useCartStore((s) => s.getTotalCount());
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  useEffect(() => {
    initTelegram();
    fetchMenu()
      .then((data) => {
        setCategories(data.categories);
        setProducts(data.products);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products;

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
    <div className="min-h-screen pb-20">
      <header className="p-4">
        <h1 className="text-xl font-bold">🍔 Fastfood Menyu</h1>
      </header>

      <CategoryFilter categories={categories} active={activeCategory} onSelect={setActiveCategory} />

      <main className="grid grid-cols-2 gap-3 px-4 mt-2">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </main>

      {totalCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 left-4 right-4 bg-tg-button text-tg-buttonText py-3 rounded-2xl flex items-center justify-between px-5 font-semibold shadow-lg"
        >
          <span className="flex items-center gap-2">
            <ShoppingCart size={18} /> {totalCount} ta mahsulot
          </span>
          <span>{totalPrice.toLocaleString()} so'm</span>
        </button>
      )}

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
