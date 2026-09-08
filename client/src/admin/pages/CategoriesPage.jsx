import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Tags, X } from 'lucide-react';
import { adminApi } from '../lib/adminApi.js';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCat(null);
    setFormData({ name: '', slug: '', sort_order: categories.length + 1 });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCat(cat);
    setFormData({ name: cat.name, slug: cat.slug, sort_order: cat.sort_order || 0 });
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Kategoriyani o'chirmoqchimisiz? Undagi taomlar ham ta'sirlanishi mumkin.")) return;
    try {
      await adminApi.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) return setError('Kategoriya nomi kiritilishi shart');
    if (!formData.slug.trim()) return setError('Slug kiritilishi shart');

    setSaving(true);
    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      sort_order: Number(formData.sort_order) || 0,
    };

    try {
      if (editingCat) {
        const res = await adminApi.updateCategory(editingCat.id, payload);
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCat.id ? { ...c, ...res.category } : c))
        );
      } else {
        const res = await adminApi.createCategory(payload);
        setCategories((prev) => [...prev, res.category]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kategoriyalar</h1>
          <p className="text-slate-500 text-sm">Menyu bo'limlarini tartibga solish</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#8B1121] hover:bg-[#A61427] text-white rounded-xl text-sm font-semibold shadow-xs transition"
        >
          <Plus size={16} />
          <span>Yangi kategoriya</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="py-3 px-4">Tartib</th>
              <th className="py-3 px-4">Nomi</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-400">Yuklanmoqda...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-400">Kategoriyalar yo'q</td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-500">#{c.sort_order || 0}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{c.slug}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Tahrirlash"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="O'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">
                {editingCat ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="my-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nomi *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      name,
                      slug: editingCat ? formData.slug : name.toLowerCase().replace(/\s+/g, '-'),
                    });
                  }}
                  placeholder="Burgerlar"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#8B1121] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Slug (inglizcha kalit) *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="burgers"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#8B1121] text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tartib raqami</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  placeholder="1"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#8B1121] text-sm"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#8B1121] hover:bg-[#A61427] text-white rounded-xl text-sm font-semibold transition shadow-xs disabled:opacity-60"
                >
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
