import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import AdminLogin from './AdminLogin.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { getToken, clearToken } from './lib/adminApi.js';

const PAGES = {
  dashboard: DashboardPage,
  products: ProductsPage,
  categories: CategoriesPage,
  orders: OrdersPage,
  users: UsersPage,
  settings: SettingsPage,
};

// `onClose` berilsa (Mini App ichidan admin sifatida ochilganda), Sidebar'da
// "Ilovaga qaytish" tugmasi chiqadi. `/admin` sahifasi orqali to'g'ridan-to'g'ri
// ochilganda onClose berilmaydi va bu tugma ko'rinmaydi.
export default function AdminApp({ onClose }) {
  const [authed, setAuthed] = useState(Boolean(getToken()));
  const [page, setPage] = useState('dashboard');

  useEffect(() => {
    document.title = 'Admin Panel — Burger Kafe';
  }, []);

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  const handleLogout = () => {
    clearToken();
    setAuthed(false);
  };

  const Page = PAGES[page] || DashboardPage;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar active={page} onSelect={setPage} onLogout={handleLogout} onClose={onClose} />
      <main className="flex-1 p-3 md:p-8 overflow-x-auto">
        <Page />
      </main>
    </div>
  );
}
