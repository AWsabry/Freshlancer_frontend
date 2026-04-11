import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let browser set Content-Type with boundary for FormData (file uploads)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Only redirect on 401 if it's NOT a login/signup endpoint
    // Login/signup 401 errors should be handled by the component, not the interceptor
    const isAuthEndpoint = error.response?.config?.url?.includes('/users/login') || 
                          error.response?.config?.url?.includes('/users/signup') ||
                          error.response?.config?.url?.includes('/users/forgotPassword') ||
                          error.response?.config?.url?.includes('/users/resetPassword');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Clear all storage on unauthorized access
      localStorage.clear();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      // Clear all cookies
      const cookies = document.cookie ? document.cookie.split(';') : [];
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        if (typeof window !== 'undefined') {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
      });
      
      // Redirect to login and reload to clear all state
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
