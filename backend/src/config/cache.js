/**
 * Simple in-memory cache for API responses.
 * Uses a Map keyed by request URL. Each entry stores { data, expiresAt }.
 * No external dependencies — runs entirely in the Node.js process.
 */

const store = new Map();

/**
 * Set a value in cache.
 * @param {string} key
 * @param {*} data
 * @param {number} ttlSeconds  - how long to keep it (default 5 min)
 */
export function cacheSet(key, data, ttlSeconds = 300) {
  store.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Get a value from cache. Returns null if missing or expired.
 * @param {string} key
 */
export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Delete all cache keys that start with a given prefix.
 * Use this to invalidate related entries after a write.
 * @param {string} prefix
 */
export function cacheInvalidatePrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

/**
 * Express middleware — caches GET responses for `ttlSeconds`.
 * Skips cache for non-GET requests.
 * @param {number} ttlSeconds
 */
export function cacheMiddleware(ttlSeconds = 300) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = req.originalUrl;
    const cached = cacheGet(key);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Intercept res.json to store the response in cache
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) {
        cacheSet(key, body, ttlSeconds);
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

// Refurbished
