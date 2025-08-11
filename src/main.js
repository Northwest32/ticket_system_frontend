

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeAuth } from './composables/useAuth'

// 强制设置全局locale为英文
if (typeof Intl !== 'undefined') {
  // 设置默认的日期时间格式为英文
  const originalDateTimeFormat = Intl.DateTimeFormat
  Intl.DateTimeFormat = function(locales, options) {
    return originalDateTimeFormat.call(this, 'en-US', options)
  }
}

// Initialize authentication state and then mount the app
initializeAuth().then(() => {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
})
