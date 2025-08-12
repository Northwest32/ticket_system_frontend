// API Configuration File
export const API_CONFIG = {
  // Development Environment
  development: {
    baseURL: 'http://localhost:8080/api',
    timeout: 10000
  },
  // Production Environment
  production: {
    baseURL: 'https://sad-sarina-yezyeats-d7548659.koyeb.app/api',
    timeout: 10000
  }
}

// Get configuration based on current environment
const getCurrentConfig = () => {
  // Check if we have environment variable for API base URL
  if (import.meta.env.VITE_API_BASE_URL) {
    return {
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 10000
    }
  }
  
  // Fallback to environment-based configuration
  const env = import.meta.env.MODE || 'development'
  return API_CONFIG[env] || API_CONFIG.development
}

export const currentApiConfig = getCurrentConfig() 