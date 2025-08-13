<template>
  <div class="forget-password-page">
    <Header />
    
    <main class="forget-password-main">
      <div class="forget-password-container">
        <div class="forget-password-card">
          <h1 class="forget-password-title">Reset Password</h1>
          
          <form @submit.prevent="handleResetPassword" class="forget-password-form">
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
              <label for="newPassword" class="form-label">New Password</label>
              <input
                id="newPassword"
                v-model="newPassword"
                type="password"
                class="form-input"
                placeholder="Enter new password"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
              <input
                id="confirmNewPassword"
                v-model="confirmNewPassword"
                type="password"
                class="form-input"
                placeholder="Confirm new password"
                required
              />
            </div>
            
            <button type="submit" class="reset-button" :disabled="isLoading">
              {{ isLoading ? 'Resetting...' : 'Reset Password' }}
            </button>
          </form>
          
          <div class="forget-password-footer">
            <p>Remember your password? <a href="#" @click="goToLogin">Login</a></p>
            <p>Don't have an account? <a href="#" @click="goToRegister">Register</a></p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Header from '../components/Header.vue'

const router = useRouter()
const { forgetPassword } = useAuth()
const email = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const isLoading = ref(false)

const handleResetPassword = async () => {
  // Validate passwords match
  if (newPassword.value !== confirmNewPassword.value) {
    alert('Passwords do not match')
    return
  }
  
  // Validate password length
  if (newPassword.value.length < 6) {
    alert('Password must be at least 6 characters long')
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await forgetPassword({
      email: email.value,
      newPassword: newPassword.value
    })
    
    alert('Password reset successful! Please login with your new password.')
    router.push('/login')
  } catch (error) {
    console.error('Password reset failed:', error)
    // ensure display is string instead of object
    const errorMessage = typeof error.message === 'string' ? error.message : 'Password reset failed. Please try again.'
    alert(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.forget-password-page {
  min-height: 100vh;
  background-color: #fafafa;
}

.forget-password-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.forget-password-container {
  width: 100%;
  max-width: 400px;
}

.forget-password-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.forget-password-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 2rem;
}

.forget-password-form {
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
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #C26CB5;
}

.reset-button {
  background-color: #993D8A;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.reset-button:hover:not(:disabled) {
  background-color: #993D8A;
}

.reset-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.forget-password-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.forget-password-footer p {
  margin-bottom: 0.5rem;
}

.forget-password-footer a {
  color: #4B164C;
  text-decoration: none;
  font-weight: 500;
}

.forget-password-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .forget-password-card {
    padding: 1.5rem;
  }
  
  .forget-password-title {
    font-size: 1.75rem;
  }
}
</style> 