const API_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api/admin${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error('Sessiya tugadi, qaytadan kiring');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');
  return data;
}

export const adminApi = {
  login: (username, password) =>
    fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kirishda xatolik');
      return data;
    }),

  // Statistika
  getStats: () => request('/stats'),

  // Kategoriyalar
  getCategories: () => request('/categories'),
  createCategory: (payload) => request('/categories', { method: 'POST', body: JSON.stringify(payload) }),
  updateCategory: (id, payload) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Mahsulotlar
  getProducts: () => request('/products'),
  createProduct: (payload) => request('/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  toggleVisibility: (id, is_available) =>
    request(`/products/${id}/visibility`, { method: 'PATCH', body: JSON.stringify({ is_available }) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return request('/upload-image', { method: 'POST', body: formData });
  },

  // Buyurtmalar
  getOrders: (status) => request(`/orders${status && status !== 'hammasi' ? `?status=${status}` : ''}`),
  getOrder: (id) => request(`/orders/${id}`),
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Foydalanuvchilar
  getUsers: () => request('/users'),
};
