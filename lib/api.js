import axios from 'axios';

// Ensure API_URL always ends with /api
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

// Log API URL for debugging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_URL);
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

// Auth API
export const authAPI = {
  register: (data) => {
    console.log(data);
    return api.post('/auth/register', data);
  },
  login: (data) => {
    console.log(data);
    return api.post('/auth/login', data);
  },
};

// Notes API
export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  getOne: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

// Bookmarks API
export const bookmarksAPI = {
  getAll: (params) => api.get('/bookmarks', { params }),
  getOne: (id) => api.get(`/bookmarks/${id}`),
  create: (data) => api.post('/bookmarks', data),
  update: (id, data) => api.put(`/bookmarks/${id}`, data),
  delete: (id) => api.delete(`/bookmarks/${id}`),
};

export default api;

