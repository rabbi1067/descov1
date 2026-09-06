/// <reference types="vite/client" />
import axios from 'axios';

/**
 * Axios client configured for future Python FastAPI backend connection.
 * Base URL defaults to /api or VITE_API_BASE_URL.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token if present
apiClient.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem('desco_auth_token') || localStorage.getItem('desco_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Graceful fallback for demo frontend without active FastAPI backend
    console.warn('Axios placeholder intercepted network call:', error.config?.url);
    return Promise.reject(error);
  }
);

export default apiClient;
