<template>
  <div class="role-selection-page">
    <Header />
    
    <main class="role-selection-main">
      <div class="role-selection-container">
        <h1 class="role-selection-title">Select Your Role</h1>
        
        <div class="role-options">
          <div class="role-option" @click="selectRole('BUYER')">
            <div class="role-icon">
              <img 
                src="@/assets/buyer.png" 
                alt="Buyer" 
                class="role-image"
              />
            </div>
            <h2 class="role-name">Buyer</h2>
            <p class="role-description">Browse and purchase tickets for events</p>
          </div>
          
                     <div class="role-option" @click="selectRole('ORGANIZER')">
             <div class="role-icon">
               <img 
                 src="@/assets/event-planning.png" 
                 alt="Event Planning" 
                 class="role-image"
               />
             </div>
             <h2 class="role-name">Organizer</h2>
             <p class="role-description">Create and manage your events</p>
           </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'

const router = useRouter()

const selectRole = (role) => {
  // Store the selected role in localStorage
  localStorage.setItem('selectedRole', role)
  // Navigate to register page with role pre-selected
  router.push('/register')
}
</script>

<style scoped>
.role-selection-page {
  min-height: 100vh;
  background-color: #fafafa;
}

.role-selection-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.role-selection-container {
  width: 100%;
  max-width: 800px;
  text-align: center;
}

.role-selection-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 3rem;
}

.role-options {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.role-option {
  flex: 1;
  min-width: 280px;
  max-width: 350px;
  background-color: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.role-option:hover {
  border-color: #C26CB5;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(194, 108, 181, 0.15);
}

.role-icon {
  color: #C26CB5;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.role-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.role-description {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 768px) {
  .role-selection-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  
  .role-options {
    flex-direction: column;
    align-items: center;
  }
  
  .role-option {
    width: 100%;
    max-width: 320px;
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .role-selection-container {
    padding: 0 0.5rem;
  }
  
  .role-selection-title {
    font-size: 1.75rem;
  }
  
  .role-option {
    min-width: 250px;
    padding: 1.5rem 1rem;
  }
}
</style> 