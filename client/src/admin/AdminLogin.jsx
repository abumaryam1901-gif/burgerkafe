import { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { adminApi, setToken } from './lib/adminApi.js';

export default function AdminLogin({ onSuccess, onClose }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Login va parolni kiriting');
      return;
    }

    setLoading(true);
    try {
      const data = await adminApi.login(username, password);
      if (data.token) {
        setToken(data.token);
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#8B1121]/10 text-[#8B1121] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🍔</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Burger Kafe Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Boshqaruv paneliga xush kelibsiz</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Login
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#8B1121] focus:ring-2 focus:ring-[#8B1121]/20 text-sm font-medium transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Parol
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#8B1121] focus:ring-2 focus:ring-[#8B1121]/20 text-sm font-medium transition"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Standart parol: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">admin123</code></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B1121] hover:bg-[#A61427] text-white py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Tekshirilmoqda...' : 'Tizimga kirish'}
            <ArrowRight size={16} />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition text-center"
            >
              ← Mijoz menyusiga qaytish
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
