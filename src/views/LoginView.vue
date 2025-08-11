<template>
    <div class="login-page">
      <Header />
  
      <main class="login-main">
        <div class="login-split-container">
          <!-- Left: Picture -->
          <div class="login-image-section">
                         <img 
               src="@/assets/garden party-cuate.png" 
               alt="Garden Party" 
               class="login-image"
             />
          </div>
  
          <!-- Right: Login Form -->
          <div class="login-form-section">
            <h1 class="login-title">Login</h1>
            <form @submit.prevent="handleLogin" class="login-form">
              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  class="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  class="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div class="form-actions">
                <a class="forgot-link" href="#" @click.prevent="goToForgetPassword">Forget password?</a>
                <a class="register-link" href="#" @click.prevent="goToRegister">Register</a>
              </div>
              <button type="submit" class="login-button" :disabled="isLoading">
                {{ isLoading ? 'Logging in...' : 'Login' }}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, useAuth } from '../composables/useAuth'
import { getHomePath } from '../utils/userType'
import Header from '../components/Header.vue'

  const router = useRouter()
const { loginUser } = useAuth()
const email = ref('')
const password = ref('')
const isLoading = ref(false)

  const handleLogin = async () => {
    isLoading.value = true
    
    try {
      const response = await loginUser(email.value, password.value)
      
      // Token is already stored in realLogin, only store user information
      login(response.token, response.user)
      
      // Wait a bit for state to update, then redirect
      setTimeout(() => {
        const homePath = getHomePath(response.user.userType)
        router.push(homePath)
      }, 100)
    } catch (error) {
      console.error('Login failed:', error)
      // ensure it is a string instead of an object
      const errorMessage = typeof error.message === 'string' ? error.message : 'Login failed. Please check your credentials.'
      alert(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  const goToRegister = () => {
    router.push('/role-selection')
  }

  const goToForgetPassword = () => {
    router.push('/forget-password')
  }
  </script>
  
  <style scoped>
  .login-page {
    min-height: 100vh;
    background-color: #f5f5f5;
  }
  
  .login-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
  }
  
  .login-split-container {
    width: 900px;
    max-width: 95vw;
    min-height: 500px;
    display: flex;
    box-shadow: 0 8px 32px rgba(60, 64, 67, 0.08);
    border-radius: 32px;
    overflow: hidden;
    background: #fff;
  }
  
  .login-image-section {
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #f0f0f0;
  overflow: hidden;
}

.login-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
  
  .login-form-section {
    flex: 1;
    padding: 3rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .login-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 2.5rem;
    text-align: left;
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-label {
    font-size: 1rem;
    font-weight: 500;
    color: #374151;
  }
  
  .form-input {
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 14px;
    font-size: 1.08rem;
    transition: border-color 0.2s ease;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #2563eb;
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.2rem;
    font-size: 0.96rem;
  }
  
  .forgot-link,
.register-link {
  color: #4B164C;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
}
  
  .forgot-link:hover,
  .register-link:hover {
    text-decoration: underline;
  }
  
  .login-button {
    margin-top: 1.2rem;
    background-color: #993D8A;
    color: white;
    border: none;
    padding: 0.9rem 0;
    border-radius: 2rem;
    font-size: 1.15rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
    width: 100%;
  }
  
  .login-button:hover:not(:disabled) {
    background-color: #993D8A;
  }
  
  .login-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  
  @media (max-width: 900px) {
    .login-split-container {
      flex-direction: column;
      min-height: 0;
      border-radius: 18px;
    }
    .login-image-section {
      border-right: none;
      border-bottom: 1px solid #f0f0f0;
      min-height: 160px;
      max-height: 220px;
    }
    .login-form-section {
      padding: 2rem 1.5rem;
    }
    .login-image {
      height: 130px;
    }
  }
  
  @media (max-width: 600px) {
    .login-split-container {
      width: 100%;
      min-width: 0;
    }
    .login-form-section {
      padding: 1.5rem 0.8rem;
    }
  }
  </style>
  