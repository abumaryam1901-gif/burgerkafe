import { useEffect, useState } from 'react';
import { User, Phone, ShoppingBag, Calendar } from 'lucide-react';
import { adminApi } from '../lib/adminApi.js';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .getUsers()
      .then((res) => setUsers(res.users || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mijozlar</h1>
        <p className="text-slate-500 text-sm">Buyurtma bergan foydalanuvchilar va ularning faolligi</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="py-3 px-4">Mijoz</th>
              <th className="py-3 px-4">Telefon</th>
              <th className="py-3 px-4">Buyurtmalar soni</th>
              <th className="py-3 px-4">Umumiy xarid</th>
              <th className="py-3 px-4">Oxirgi buyurtma</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400">Yuklanmoqda...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400">Hozircha mijozlar mavjud emas</td>
              </tr>
            ) : (
              users.map((u, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                        {u.customer_name?.[0]?.toUpperCase() || <User size={14} />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{u.customer_name || 'Noma\'lum'}</div>
                        <div className="text-[11px] text-slate-400">ID: {u.telegram_user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    <a href={`tel:${u.customer_phone}`} className="hover:underline flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" />
                      <span>{u.customer_phone}</span>
                    </a>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs">
                      {u.order_count} ta
                    </span>
                  </td>
                  <td className="py-3 px-4 font-black text-[#8B1121]">
                    {Number(u.total_spent).toLocaleString()} so'm
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {new Date(u.last_order_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
