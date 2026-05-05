// frontend/src/services/api.js

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('learnhub_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include' // For cookies if needed
    });

    // Handle non-JSON responses gracefully
    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json') 
      ? await response.json() 
      : { message: await response.text() };

    if (!response.ok) {
      // Auto-logout on 401
      if (response.status === 401) {
        localStorage.removeItem('learnhub_token');
        localStorage.removeItem('learnhub_user');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
      
      throw new Error(data?.message || data?.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    // Network errors (CORS, offline, etc.)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

// Convenience methods
export const apiGet = (endpoint, options) => api(endpoint, { ...options, method: 'GET' });
export const apiPost = (endpoint, body, options) => 
  api(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
export const apiPut = (endpoint, body, options) => 
  api(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
export const apiDelete = (endpoint, options) => 
  api(endpoint, { ...options, method: 'DELETE' });