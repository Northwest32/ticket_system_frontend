import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://sad-sarina-yezyeats-d7548659.koyeb.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // 定义需要认证的路径
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
    '/cloudinary/signature'
  ];
  
  // 检查当前请求路径是否需要认证
  let isProtectedPath = protectedPaths.some(path => config.url.includes(path));
  
  // 特殊处理：/events路径只有POST/PUT/DELETE方法需要认证，GET方法不需要
  if (config.url.includes('/events') && !config.url.includes('/events/my')) {
    isProtectedPath = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase());
  }
  
  // 对于需要认证的路径且有token，添加Authorization头
  if (token && isProtectedPath) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 对于multipart/form-data请求，不设置Content-Type，让浏览器自动设置
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 响应拦截器 - 处理错误
http.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    // token过期或无效，清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  }
  
  // 处理CORS错误
  if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
    console.error('CORS Error: 请确保后端服务器正在运行且CORS配置正确');
  }
  
  return Promise.reject(error);
});

export default http;
