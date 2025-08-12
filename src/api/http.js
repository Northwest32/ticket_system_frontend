import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://sad-sarina-yezyeats-d7548659.koyeb.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// request interceptor - add token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // define protected paths
  const protectedPaths = [
    '/events/my',
    '/me',
    '/orders',
    '/bookmarks',
    '/follows',
    '/comments',
    '/payments',
    '/refund-request',
    '/seckill',
    '/organizer-profile',
    '/cloudinary/signature',
    '/update-avatar'
  ];
  
  // check if current request path is protected
  let isProtectedPath = protectedPaths.some(path => config.url.includes(path));
  
  // special handling: /events path only needs authentication for POST/PUT/DELETE methods, GET method does not need authentication
  if (config.url.includes('/events') && !config.url.includes('/events/my')) {
    isProtectedPath = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase());
  }
  
  // for protected paths with token, add Authorization header
  if (token && isProtectedPath) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // for multipart/form-data requests, do not set Content-Type, let browser set it automatically
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// response interceptor - handle errors
http.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    // token expired or invalid, clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  }
  
  // handle CORS errors
  if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
    console.error('CORS Error: please ensure the backend server is running and CORS configuration is correct');
  }
  
  return Promise.reject(error);
});

export default http;
