import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-fallback-secret-change-in-prod';

/**
 * verifyAdminKey — now accepts EITHER:
 *   1. A JWT Bearer token:  Authorization: Bearer <token>  (new, preferred)
 *   2. The raw API key:     x-api-key: <key>              (legacy, kept for compatibility)
 */
export function verifyAdminKey(req, res, next) {
  // ── 1. Try JWT Bearer token first ──────────────────────────────────────────
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.admin = decoded; // attach decoded payload to request
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized — token expired or invalid. Please log in again.' });
    }
  }

  // ── 2. Fall back to raw API key (legacy / server-to-server) ─────────────
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized — no valid credentials provided.' });
}

export function verifyUserToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — token needed' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'user') throw new Error('Invalid token type');
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized — token expired or invalid' });
  }
}

export function generateUserToken(email) {
  return jwt.sign({ email, type: 'user' }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * generateAdminToken — signs a JWT for a verified admin.
 * Called by POST /api/admin/login after password check.
 */
export function generateAdminToken() {
  return jwt.sign(
    { role: 'admin', iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// Refurbished
