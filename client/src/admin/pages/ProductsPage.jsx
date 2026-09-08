import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload, Search, X } from 'lucide-react';
import { adminApi } from '../lib/adminApi.js';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    image_url: '',
    is_available: true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories(),
      ]);
      setProducts(pRes.products || []);
      setCategories(cRes.categories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      description: '',
      price: '',
      image_url: '',
      is_available: true,
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category_id: p.category_id,
      description: p.description || '',
      price: p.price,
      image_url: p.image_url || '',
      is_available: p.is_available,
    });
    setError('');
    setModalOpen(true);
  };

  const handleToggleVisibility = async (p) => {
    try {
      const updated = await adminApi.toggleVisibility(p.id, !p.is_available);
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, is_available: !p.is_available } : item))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?")) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      setFormData((f) => ({ ...f, image_url: res.url }));
    } catch (err) {
      alert('Rasm yuklashda xatolik: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) return setError('Mahsulot nomi kiritilishi shart');
    if (!formData.category_id) return setError('Kategoriya tanlanishi shart');
    if (!formData.price) return setError('Narx kiritilishi shart');

    setSaving(true);
    const payload = {
      ...formData,
      category_id: Number(formData.category_id),
      price: Number(formData.price),
    };

    try {
      if (editingProduct) {
        const res = await adminApi.updateProduct(editingProduct.id, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...res.product } : p))
        );
      } else {
        const res = await adminApi.createProduct(payload);
        setProducts((prev) => [res.product, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Taomlar menyusi</h1>
          <p className="text-slate-500 text-sm">Barcha taomlarni boshqarish, narxlar va rasmlar</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#8B1121] hover:bg-[#A61427] text-white rounded-xl text-sm font-semibold shadow-xs transition"
        >
          <Plus size={16} />
          <span>Yangi taom qo'shish</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nomi bo'yicha qidirish..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#8B1121]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="py-3 px-4">Rasm</th>
                <th className="py-3 px-4">Nomi</th>
                <th className="py-3 px-4">Kategoriya</th>
                <th className="py-3 px-4">Narxi</th>
                <th className="py-3 px-4">Mavjudligi</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">Yuklanmoqda...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">Taomlar topilmadi</td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <img
                          src={p.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100'}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-slate-400 line-clamp-1">{p.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700">
                          {cat?.name || `#${p.category_id}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {Number(p.price).toLocaleString()} so'm
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleVisibility(p)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                            p.is_available
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {p.is_available ? <Eye size={14} /> : <EyeOff size={14} />}
                          <span>{p.is_available ? 'Mavjud' : 'Yashirilgan'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Tahrirlash"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="O'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">
                {editingProduct ? 'Taomni tahrirlash' : 'Yangi taom qo\'shish'}
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masalan: Double Burger"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#8B1121] text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kategoriya *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#8B1121] text-sm bg-white"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Narxi (so'm) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="35000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#8B1121] text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mol go'shti, pishloq, maxsus sous..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#8B1121] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Rasm</label>
                <div className="flex items-center gap-3">
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                    />
                  )}
                  <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer transition">
                    <Upload size={16} />
                    <span>{uploading ? 'Yuklanmoqda...' : 'Rasm faylini yuklash'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="yoki rasm URL manzili (https://...)"
                  className="w-full mt-2 p-2 rounded-xl border border-slate-200 outline-none focus:border-[#8B1121] text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="rounded text-[#8B1121] focus:ring-[#8B1121]"
                />
                <label htmlFor="is_available" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Menyuda mavjud (mijozlar ko'rishi mumkin)
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
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
