import { useEffect, useState } from 'react';
import { adminApi } from '../lib/adminApi.js';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi
      .getUsers()
      .then((d) => setUsers(d.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.customer_phone?.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Foydalanuvchilar</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism yoki telefon bo'yicha qidirish..."
          className="p-2.5 rounded-xl border border-slate-200 outline-none text-sm w-64"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">Yuklanmoqda...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="p-4 font-medium">Ism</th>
                <th className="p-4 font-medium">Telefon</th>
                <th className="p-4 font-medium">Buyurtmalar soni</th>
                <th className="p-4 font-medium">Jami xarid</th>
                <th className="p-4 font-medium">Oxirgi buyurtma</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.telegram_user_id} className="border-t border-slate-100">
                  <td className="p-4 font-medium text-slate-800">{u.customer_name}</td>
                  <td className="p-4">
                    <a href={`tel:${u.customer_phone}`} className="text-blue-600">
                      {u.customer_phone}
                    </a>
                  </td>
                  <td className="p-4 text-slate-700">{u.order_count}</td>
                  <td className="p-4 font-medium text-slate-800">{u.total_spent.toLocaleString()} so'm</td>
                  <td className="p-4 text-slate-400 text-xs">
                    {new Date(u.last_order_at).toLocaleString('uz-UZ')}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
