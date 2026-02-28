import axios, { AxiosInstance } from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API error handler
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== Simple in-memory cache (cleared on page refresh) =====
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data;
}

// ===== Opportunities =====
export const opportunitiesAPI = {
  getAll: (filters?: {
    category?: string;
    level?: string;
    fundingType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const key = JSON.stringify(filters || {});
    const cached = getCached(key);
    if (cached) return Promise.resolve({ data: cached });
    return apiClient.get('/opportunities', { params: filters }).then(res => {
      cache.set(key, { data: res.data, ts: Date.now() });
      return res;
    });
  },

  getOne: (id: string) => {
    const key = `one:${id}`;
    const cached = getCached(key);
    if (cached) return Promise.resolve({ data: cached });
    return apiClient.get(`/opportunities/${id}`).then(res => {
      cache.set(key, { data: res.data, ts: Date.now() });
      return res;
    });
  },

  create: (data: any, apiKey: string) =>
    apiClient.post('/opportunities', data, {
      headers: { 'x-api-key': apiKey },
    }),

  update: (id: string, data: any, apiKey: string) =>
    apiClient.put(`/opportunities/${id}`, data, {
      headers: { 'x-api-key': apiKey },
    }),

  delete: (id: string, apiKey: string) =>
    apiClient.delete(`/opportunities/${id}`, {
      headers: { 'x-api-key': apiKey },
    }),
};

// ===== Subscribers =====
export const subscribersAPI = {
  subscribe: (email: string, preferences?: {
    categories?: string[];
    allUpdates?: boolean;
    interests?: { category: string; subfields: string[] }[];
    whatsapp?: string;
  }) =>
    apiClient.post('/subscribers', {
      email,
      ...preferences,
    }),

  unsubscribe: (email: string) =>
    apiClient.post(`/subscribers/unsubscribe/${email}`),

  getCount: () => apiClient.get('/subscribers/count'),
};

// ===== Analytics =====
export const analyticsAPI = {
  track: (opportunityId: string, action: 'view' | 'click' | 'apply') =>
    apiClient.post('/analytics/track', {
      opportunityId,
      action,
    }),

  getDashboard: (apiKey: string) =>
    apiClient.get('/analytics/dashboard', {
      headers: { 'x-api-key': apiKey },
    }),
};

// ===== Ads =====
export const adsAPI = {
  getRandom: () => apiClient.get('/ads/random'),

  create: (data: any, apiKey: string) =>
    apiClient.post('/ads', data, {
      headers: { 'x-api-key': apiKey },
    }),

  update: (id: string, data: any, apiKey: string) =>
    apiClient.put(`/ads/${id}`, data, {
      headers: { 'x-api-key': apiKey },
    }),

  delete: (id: string, apiKey: string) =>
    apiClient.delete(`/ads/${id}`, {
      headers: { 'x-api-key': apiKey },
    }),
};

// ===== Admin =====
export const adminAPI = {
  getStats: (apiKey: string) =>
    apiClient.get('/admin/stats', {
      headers: { 'x-api-key': apiKey },
    }),
};

// ===== Health Check =====
export const healthAPI = {
  check: () => apiClient.get('/health'),
};

export default apiClient;
