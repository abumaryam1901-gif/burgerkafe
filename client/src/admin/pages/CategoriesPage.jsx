import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { adminApi } from '../lib/adminApi.js';

const EMPTY_FORM = { name: '', slug: '', icon: '', sort_order: 0 };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .getCategories()
      .then((d) => setCategories(d.categories))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '', sort_order: cat.sort_order || 0 });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setError('');
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Nomi va slug majburiy');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
      if (editing) {
        await adminApi.updateCategory(editing.id, payload);
      } else {
        await adminApi.createCategory(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`"${cat.name}" kategoriyasini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await adminApi.deleteCategory(cat.id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Kategoriyalar</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          <Plus size={16} /> Yangi kategoriya
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Yuklanmoqda...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="p-4 font-medium">Ikonka</th>
                <th className="p-4 font-medium">Nomi</th>
                <th className="p-4 font-medium">Slug</th>
                <th className="p-4 font-medium">Tartib</th>
                <th className="p-4 font-medium text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t border-slate-100">
                  <td className="p-4 text-xl">{cat.icon}</td>
                  <td className="p-4 font-medium text-slate-800">{cat.name}</td>
                  <td className="p-4 text-slate-500">{cat.slug}</td>
                  <td className="p-4 text-slate-500">{cat.sort_order}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Hozircha kategoriya yo'q
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800">
                {editing ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Nomi</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  placeholder="Burgerlar"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Slug (lotincha, bo'shliqsiz)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  placeholder="burgers"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Ikonka (emoji)</label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  placeholder="🍔"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Tartib raqami</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-60"
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
