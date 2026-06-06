import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8001',
});

// Automatically attach Authorization token if available in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vb_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('vb_token');
      localStorage.removeItem('vb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
