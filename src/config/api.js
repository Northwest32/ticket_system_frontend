// API Configuration File
export const API_CONFIG = {
  // Development Environment
  development: {
    baseURL: 'http://localhost:8080/api',
    timeout: 10000
  },
  // Production Environment
  production: {
    baseURL: '/api', // Production environment uses relative path
    timeout: 10000
  }
}

// Get configuration based on current environment
const getCurrentConfig = () => {
  const env = import.meta.env.MODE || 'development'
  return API_CONFIG[env] || API_CONFIG.development
}

export const currentApiConfig = getCurrentConfig() 