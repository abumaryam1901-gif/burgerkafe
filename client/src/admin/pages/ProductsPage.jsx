import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Upload } from 'lucide-react';
import { adminApi } from '../lib/adminApi.js';

const EMPTY_FORM = {
  category_id: '',
  name: '',
  description: '',
  price: '',
  image_url: '',
  is_available: true,
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('hammasi');

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.getProducts(), adminApi.getCategories()])
      .then(([p, c]) => {
        setProducts(p.products);
        setCategories(c.categories);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, category_id: categories[0]?.id || '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      category_id: product.category_id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      image_url: product.image_url || '',
      is_available: product.is_available,
    });
    setError('');
    setModalOpen(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await adminApi.uploadImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    if (!form.category_id || !form.name.trim() || form.price === '') {
      setError('Kategoriya, nomi va narxi majburiy');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), category_id: Number(form.category_id) };
      if (editing) {
        await adminApi.updateProduct(editing.id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`"${product.name}" ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await adminApi.deleteProduct(product.id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggle = async (product) => {
    try {
      await adminApi.toggleVisibility(product.id, !product.is_available);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '—';

  const filteredProducts =
    filterCategory === 'hammasi' ? products : products.filter((p) => p.category_id === Number(filterCategory));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Taomlar</h2>
        <div className="flex items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-200 text-sm outline-none"
          >
            <option value="hammasi">Barcha kategoriyalar</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            <Plus size={16} /> Yangi taom
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Yuklanmoqda...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={product.image_url || 'https://placehold.co/400x250?text=Rasm+yoq'}
                  className={`w-full h-36 object-cover ${!product.is_available ? 'opacity-40 grayscale' : ''}`}
                />
                {!product.is_available && (
                  <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded-full">
                    Yashirilgan
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-400 mb-1">{categoryName(product.category_id)}</p>
                <h3 className="font-semibold text-slate-800 leading-tight">{product.name}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-[2.5rem]">{product.description}</p>
                <p className="font-bold text-slate-800 mt-2">{Number(product.price).toLocaleString()} so'm</p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleToggle(product)}
                    className="flex-1 flex items-center justify-center gap-1 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium"
                  >
                    {product.is_available ? <EyeOff size={14} /> : <Eye size={14} />}
                    {product.is_available ? 'Yashirish' : "Ko'rsatish"}
                  </button>
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <p className="text-slate-400 col-span-full text-center py-12">Hozircha taom yo'q</p>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800">
                {editing ? 'Taomni tahrirlash' : 'Yangi taom qo\'shish'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Rasm</label>
                <div className="mt-1 flex items-center gap-3">
                  {form.image_url && (
                    <img src={form.image_url} className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-3 text-sm text-slate-500 cursor-pointer hover:border-blue-400">
                    <Upload size={16} />
                    {uploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                  </label>
                </div>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full mt-2 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-sm"
                  placeholder="yoki rasm URL manzilini kiriting"
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Kategoriya</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="">Tanlang</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-600">Nomi</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  placeholder="Cheeseburger"
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Tavsif</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  rows={2}
                  placeholder="Mol go'shti, pishloq, pomidor..."
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Narxi (so'm)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  placeholder="28000"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                />
                Menyuda ko'rinib tursin (mavjud)
              </label>

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
