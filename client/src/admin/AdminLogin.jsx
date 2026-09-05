import { useState } from 'react';
import { adminApi, setToken } from './lib/adminApi.js';

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await adminApi.login(username, password);
      setToken(data.token);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">🍔 Admin Panel</h1>
        <p className="text-slate-500 text-sm mb-6">Boshqaruv paneliga kirish</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Login</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
              placeholder="admin"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </div>
      </form>
    </div>
  );
}
