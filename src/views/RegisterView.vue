<template>
  <div class="register-page">
    <Header />
    
    <main class="register-main">
      <div class="register-container">
        <div class="register-card">
          <h1 class="register-title">Register</h1>
          
          <div v-if="selectedRole" class="role-indicator">
            <span class="role-badge">{{ selectedRole === 'BUYER' ? 'Buyer' : 'Organizer' }}</span>
          </div>
          
          <form @submit.prevent="handleRegister" class="register-form">
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <input
                id="username"
                v-model="username"
                type="text"
                class="form-input"
                placeholder="Enter your username"
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
            
            <div class="form-group">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                class="form-input"
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <button type="submit" class="register-button" :disabled="isLoading">
              {{ isLoading ? 'Registering...' : 'Register' }}
            </button>
          </form>
          
          <div class="register-footer">
            <p>Already have an account? <a href="#" @click="goToLogin">Login</a></p>
            <p><a href="#" @click="goToForgetPassword">Forgot Password?</a></p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Header from '../components/Header.vue'

const router = useRouter()
const { registerUser } = useAuth()
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const selectedRole = ref('')
const isLoading = ref(false)

onMounted(() => {
  // Get selected role from localStorage
  const role = localStorage.getItem('selectedRole')
  if (!role) {
    // If no role selected, redirect to role selection
    router.push('/role-selection')
    return
  }
  selectedRole.value = role
})

const handleRegister = async () => {
  // Validate username
  if (!username.value.trim()) {
    alert('Please enter a username')
    return
  }
  
  if (username.value.length < 3) {
    alert('Username must be at least 3 characters long')
    return
  }
  
  // Validate email format
  if (!email.value.trim()) {
    alert('Please enter an email')
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    alert('Please enter a valid email address')
    return
  }
  
  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match')
    return
  }
  
  // Validate password length
  if (password.value.length < 6) {
    alert('Password must be at least 6 characters long')
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await registerUser({
      username: username.value,
      email: email.value,
      password: password.value,
      userType: selectedRole.value
    })
    
    alert('Registration successful! Please login with your credentials.')
    // Clear selected role from localStorage
    localStorage.removeItem('selectedRole')
    // Redirect to login page
    router.push('/login')
  } catch (error) {
    console.error('Registration failed:', error)
    // 显示具体的错误信息
    const errorMessage = error.message || 'Registration failed. Please try again.'
    alert(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  localStorage.removeItem('selectedRole')
  router.push('/login')
}

const goToForgetPassword = () => {
  localStorage.removeItem('selectedRole')
  router.push('/forget-password')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background-color: #fafafa;
}

.register-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.register-container {
  width: 100%;
  max-width: 400px;
}

.register-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 1rem;
}

.role-indicator {
  text-align: center;
  margin-bottom: 1.5rem;
}

.role-badge {
  background-color: #993D8A;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.register-form {
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

.register-button {
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

.register-button:hover:not(:disabled) {
  background-color: #993D8A;
}

.register-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.register-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.register-footer p {
  margin-bottom: 0.5rem;
}

.register-footer a {
  color: #4B164C;
  text-decoration: none;
  font-weight: 500;
}

.register-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-card {
    padding: 1.5rem;
  }
  
  .register-title {
    font-size: 1.75rem;
  }
}
</style> 