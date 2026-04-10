import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pf_token');
      localStorage.removeItem('pf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
  register: (data) => api.post('/auth/register', data),
};

// ── Medicines ─────────────────────────────────────────────────────────────────
export const medicinesAPI = {
  getAll:  (params) => api.get('/medicines', { params }),
  getOne:  (id)     => api.get(`/medicines/${id}`),
  create:  (data)   => api.post('/medicines', data),
  update:  (id, data) => api.put(`/medicines/${id}`, data),
  remove:  (id)     => api.delete(`/medicines/${id}`),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  summary: () => api.get('/dashboard/summary'),
};

export default api;
