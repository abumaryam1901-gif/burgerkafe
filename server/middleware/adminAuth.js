import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'burgerkafe-secret-key-2026';

export function signAdminToken(username) {
  return jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Avtorizatsiyadan o\'tilmagan' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAdminToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Sessiya muddati tugagan yoki noto\'g\'ri token' });
  }

  req.admin = decoded;
  next();
}
