<template>
  <div class="profile-edit-page">
    <Header />
    
    <main class="profile-edit-main">
      <div class="container">
        <div class="profile-edit-card">
          <!-- Back Button -->
          <div class="back-section">
            <button class="back-button" @click="goBack">
              ← Back
            </button>
          </div>
          
          <!-- Title -->
          <h1 class="edit-title">Edit Public Profile</h1>
          
          <!-- Description Edit Area -->
          <div class="description-edit-section">
            <label for="description" class="description-label">
              Description
            </label>
            <TiptapEditor
              v-if="tiptapAvailable"
              v-model="description"
              :placeholder="'Enter your organizer description here... You can include details about your organization, mission, and what makes your events special. Use the toolbar above to format your text.'"
              :max-length="3000"
            />
            <SimpleTextEditor
              v-else
              v-model="description"
              :placeholder="'Enter your organizer description here... You can include details about your organization, mission, and what makes your events special.'"
              :max-length="3000"
            />
            

          </div>
          
          <!-- Submit Button -->
          <div class="submit-section">
            <button 
              class="submit-button" 
              @click="saveProfile"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Saving...' : 'Submit' }}
            </button>
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
import { organizerProfileApi } from '../services/api'
import Header from '../components/Header.vue'
import TiptapEditor from '../components/TiptapEditor.vue'
import SimpleTextEditor from '../components/SimpleTextEditor.vue'

const router = useRouter()
const { currentUser } = useAuth()

const description = ref('')
const isLoading = ref(false)
const tiptapAvailable = ref(false)

onMounted(() => {
  // check user permission
  if (!currentUser.value || currentUser.value.userType !== 'organizer') {
    alert('Only organizers can edit their public profile.')
    router.push('/')
    return
  }
  
  console.log('🔍 Current user in ProfileEditView:', currentUser.value)
  console.log('🔍 User ID type:', typeof currentUser.value.id)
  console.log('🔍 User ID value:', currentUser.value.id)
  
  // check if Tiptap is available
  checkTiptapAvailability()
  // load current user's description information
  loadCurrentProfile()
})

const checkTiptapAvailability = () => {
  try {
    // try to import Tiptap related modules
    import('@tiptap/vue-3').then(() => {
      tiptapAvailable.value = true
    }).catch(() => {
      tiptapAvailable.value = false
    })
  } catch (error) {
    tiptapAvailable.value = false
  }
}

const loadCurrentProfile = async () => {
  try {
    if (currentUser.value?.id) {
      const response = await organizerProfileApi.getProfile(currentUser.value.id)
      if (response.code === 0 && response.data) {
        description.value = response.data.homepageDescription || ''
      } else {
        // if no profile found, use empty string
        description.value = ''
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    // if API call fails, use empty string
    description.value = ''
  }
}



const saveProfile = async () => {
  // check if HTML content is empty (remove HTML tags)
  const textContent = description.value.replace(/<[^>]*>/g, '').trim()
  if (!textContent) {
    alert('Please enter a description')
    return
  }
  
  // check if character count (remove HTML tags)
  if (textContent.length > 3000) {
    alert('Description is too long. Please keep it under 3000 characters.')
    return
  }
  
  if (!currentUser.value?.id) {
    alert('User not found. Please login again.')
    router.push('/login')
    return
  }
  
  isLoading.value = true
  
  try {
    console.log('🔍 Current user:', currentUser.value)
    console.log('🔍 Description:', description.value)
    console.log('🔍 Token:', localStorage.getItem('token'))
    
    const profileData = {
      organizerId: parseInt(currentUser.value.id), // ensure it is a number type
      homepageDescription: description.value
    }
    
    console.log('🔍 Sending profile data:', profileData)
    
    const response = await organizerProfileApi.saveProfile(profileData)
    
    if (response.code === 0) {
      // show success message
      alert('Profile updated successfully!')
      
      // return to previous page
      router.back()
    } else {
      alert(response.message || 'Failed to save profile')
    }
  } catch (error) {
    console.error('Error saving profile:', error)
    alert('Failed to save profile. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.profile-edit-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.profile-edit-main {
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.profile-edit-card {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Back Button */
.back-section {
  margin-bottom: 2rem;
}

.back-button {
  background: none;
  border: none;
  color: #4B164C;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #F5F5F5;
  color: #3a1239;
}

/* Title */
.edit-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 2rem;
}

/* Description Edit Section */
.description-edit-section {
  margin-bottom: 2rem;
}

.description-label {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  text-align: center;
}

.description-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 200px;
  transition: border-color 0.2s ease;
}

.description-textarea:focus {
  outline: none;
  border-color: #FAE3C6;
  box-shadow: 0 0 0 3px rgba(250, 227, 198, 0.3);
}

.description-textarea::placeholder {
  color: #9ca3af;
}

.character-count {
  text-align: right;
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.5rem;
}



/* Submit Section */
.submit-section {
  text-align: center;
}

.submit-button {
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 1rem 3rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;
}

.submit-button:hover:not(:disabled) {
  background-color: #f4d4a3;
  transform: translateY(-1px);
}

.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

/* responsive design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .profile-edit-card {
    padding: 1.5rem;
  }
  
  .edit-title {
    font-size: 1.75rem;
  }
  
  .description-textarea {
    min-height: 150px;
  }
  
  .submit-button {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
}
</style> 