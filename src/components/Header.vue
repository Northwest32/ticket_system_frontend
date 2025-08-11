<template>
  <header class="header">
    <div class="header-content">
      <div class="logo-section">
        <button class="logo-button" @click="goHome">
          <span class="logo-text">Evoli</span>
        </button>
      </div>
      
      <div class="auth-section">
        <button 
          v-if="!isAuthenticated"
          class="auth-button" 
          @click="handleAuthClick"
        >
          Login
        </button>
        <div v-else class="auth-buttons">
          <button 
            class="auth-button account-button" 
            @click="goToAccount"
          >
            My Account
          </button>
          <button 
            class="auth-button logout-button" 
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { isAuthenticated, logout, currentUser } from '../composables/useAuth'
import { getHomePath } from '../utils/userType'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const handleAuthClick = () => {
  // Navigate to login page
  router.push('/login')
}

const goToAccount = () => {
  // Navigate to user homepage based on user type
  const homePath = getHomePath(currentUser.value?.userType)
  router.push(homePath)
}

const handleLogout = async () => {
  try {
    logout()
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Satisfy&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap');

.header {
  background-color: #F8E7F6;
  padding: 0.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 2rem;
  font-weight: bold;
  font-family: 'Satisfy', cursive;
  color: #C26CB5;
  letter-spacing: 0.1em;
  transition: color 0.2s ease;
}

.logo-button:hover {
  color: #c675b8;
}

.auth-button {
  background: none;
  color: #C26CB5;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  transition: color 0.2s ease;
}

.auth-button:hover {
  color: #a85a9e;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}

.account-button {
  background: none;
}

.account-button:hover {
  color: #a85a9e;
}

.logout-button {
  background: none;
}

.logout-button:hover {
  color: #a85a9e;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }
  
  .logo-text {
    font-size: 1.75rem;
  }
  
  .auth-button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
  
  .auth-buttons {
    gap: 0.5rem;
  }
}
</style> 