import { useEffect, useState } from 'react';
import { Upload, Save } from 'lucide-react';
import { adminApi } from '../lib/adminApi.js';

const EMPTY_FORM = {
  name: '',
  description: '',
  logo_url: '',
  phone: '',
  address: '',
  working_hours: '',
  payment_info: '',
};

export default function SettingsPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    adminApi
      .getSettings()
      .then((d) => {
        if (d.settings) {
          setForm({
            name: d.settings.name || '',
            description: d.settings.description || '',
            logo_url: d.settings.logo_url || '',
            phone: d.settings.phone || '',
            address: d.settings.address || '',
            working_hours: d.settings.working_hours || '',
            payment_info: d.settings.payment_info || '',
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await adminApi.uploadImage(file);
      setForm((f) => ({ ...f, logo_url: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    if (!form.name.trim()) {
      setError('Oshxona nomi majburiy');
      return;
    }
    setSaving(true);
    try {
      await adminApi.updateSettings(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-500">Yuklanmoqda...</p>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Oshxona profili</h2>
      <p className="text-slate-500 text-sm mb-6">
        Bu ma'lumotlar mijozlarga Mini App ichidagi "Profil" oynasida ko'rsatiladi.
      </p>

      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-600">Logo / rasm</label>
          <div className="mt-1 flex items-center gap-3">
            {form.logo_url && (
              <img
                src={form.logo_url}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                alt="Logo"
              />
            )}
            <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-3 text-sm text-slate-500 cursor-pointer hover:border-blue-400">
              <Upload size={16} />
              {uploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>
          </div>
          <input
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            className="w-full mt-2 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-sm"
            placeholder="yoki rasm URL manzilini kiriting"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600">Oshxona nomi</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
            placeholder="Burger Kafe"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600">Tavsif</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
            rows={2}
            placeholder="Tez va mazali fastfood taomlari"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Telefon</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
              placeholder="+998 71 200 00 00"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Ish vaqti</label>
            <input
              value={form.working_hours}
              onChange={(e) => setForm({ ...form, working_hours: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
              placeholder="Har kuni 10:00 dan 23:00 gacha"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600">Manzil</label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
            placeholder="Toshkent shahri, ..."
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600">To'lov turlari haqida matn</label>
          <input
            value={form.payment_info}
            onChange={(e) => setForm({ ...form, payment_info: e.target.value })}
            className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
            placeholder="Naqd pul va karta (Payme / Click) orqali"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Saqlandi ✅</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saqlanmoqda...' : "Saqlash"}
        </button>
      </div>
    </div>
  );
}
