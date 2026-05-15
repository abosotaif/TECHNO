import axios from 'axios';

/**
 * Plain Axios instance. RTK Query is the primary data layer; this client is
 * available as a fallback for ad-hoc calls (file uploads, third-party APIs,
 * non-cacheable requests, etc).
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: false,
  headers: { Accept: 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('vt_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (resp) => resp,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('vt_token');
      localStorage.removeItem('vt_user');
    }
    return Promise.reject(err);
  },
);
