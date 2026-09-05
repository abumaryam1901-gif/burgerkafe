const API_URL = import.meta.env.VITE_API_URL || '';

export async function fetchMenu() {
  const res = await fetch(`${API_URL}/api/menu`);
  if (!res.ok) throw new Error('Menyuni yuklab bo\'lmadi');
  return res.json();
}

export async function createOrder(orderData) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Buyurtma yuborilmadi');
  }
  return res.json();
}
