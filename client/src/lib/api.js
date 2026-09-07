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

export async function fetchSettings() {
  const res = await fetch(`${API_URL}/api/settings`);
  if (!res.ok) throw new Error("Oshxona ma'lumotlarini yuklab bo'lmadi");
  return res.json();
}

export async function checkIsAdmin(telegramUserId) {
  if (!telegramUserId) return false;
  try {
    const res = await fetch(`${API_URL}/api/check-admin/${telegramUserId}`);
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.isAdmin);
  } catch {
    return false;
  }
}
