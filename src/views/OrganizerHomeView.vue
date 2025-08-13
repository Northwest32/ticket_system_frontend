<template>
  <div class="organizer-home">
    <Header />
    
    <main class="organizer-main">
      <div class="container">
        <!-- Profile Section -->
        <div class="profile-section">
          <div class="avatar">
            <div 
              class="avatar-placeholder"
              :style="currentUser?.avatarUrl ? { backgroundImage: `url(${getAvatarUrl(currentUser.avatarUrl)})` } : {}"
            >
              <span v-if="!currentUser?.avatarUrl">{{ getOrganizerInitials() }}</span>
            </div>
            <button class="edit-avatar-button" @click="editAvatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
              </svg>
            </button>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              @change="handleAvatarChange"
              class="avatar-input"
              style="display: none;"
            />
          </div>
          <h1 class="organizer-name">{{ organizer.name }}</h1>
          <p class="follower-count">{{ organizer.followerCount }} Followers</p>
        </div>
        
        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="action-button" @click="editPublicProfile">
            Edit Public Profile
          </button>
          <button class="action-button" @click="viewMyProfile">
            View My Profile
          </button>
          <button class="action-button" @click="accessDashboard">
            Access Dashboard
          </button>
          <button class="action-button" @click="viewComments">
            View Comments
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { userApi, followApi } from '../services/api'
import { getAvatarUrl, getAvatarInitials } from '../utils/avatarUtils'
import Header from '../components/Header.vue'

const router = useRouter()
const { currentUser } = useAuth()

// Organizer data
const organizer = ref({
  name: currentUser.value?.name || 'Organizer Name',
  followerCount: 0
})

const avatarInput = ref(null)

// load follower count
const loadFollowerCount = async () => {
  try {
    if (currentUser.value?.id) {
      console.log('Loading follower count for user ID:', currentUser.value.id)
      const response = await followApi.getFollowerCount(currentUser.value.id)
      console.log('Follower count response:', response)
      console.log('Response type:', typeof response)
      console.log('Response code:', response?.code)
      console.log('Response data:', response?.data)
      
      // 后端返回CommonResponse格式
      if (response && response.code === 0 && response.data !== undefined) {
        organizer.value.followerCount = response.data
        console.log('Set follower count to:', response.data)
      } else {
        organizer.value.followerCount = 0
        console.log('Failed to get follower count, set to 0')
      }
    }
  } catch (error) {
    console.error('Failed to load follower count:', error)
    organizer.value.followerCount = 0
  }
}



// load follower count when page is mounted
onMounted(async () => {
  await loadFollowerCount()
})

const editPublicProfile = () => {
  router.push('/profile-edit')
}

const viewMyProfile = () => {
  if (currentUser.value?.id) {
    router.push(`/organizer/${currentUser.value.id}`)
  }
}

const accessDashboard = () => {
  router.push('/dashboard')
}

const viewComments = () => {
  router.push('/organizer-comments')
}

// avatar edit function
const editAvatar = () => {
  avatarInput.value.click()
}

const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }
  
  // validate file size (limit to 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should be less than 5MB')
    return
  }
  
  try {
    // use new Cloudinary upload function
    const response = await userApi.updateAvatar(file)
    
    if (response.code === 0) {
      // use backend returned URL (response.data is the Cloudinary URL string)
      const avatarUrl = response.data
      
      // update local user info
      if (currentUser.value) {
        currentUser.value.avatarUrl = avatarUrl
        
        // update localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        userInfo.avatarUrl = avatarUrl
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      }
      
      // refresh user info, ensure all pages are synchronized
      const { refreshUserInfo } = useAuth()
      await refreshUserInfo()
      
      alert('Avatar updated successfully!')
    } else {
      alert(response.message || 'Failed to update avatar')
    }
  } catch (error) {
    console.error('Error uploading avatar:', error)
    alert('Failed to upload avatar. Please try again.')
  }
  
  // clear input
  event.target.value = ''
}

// get organizer initials
const getOrganizerInitials = () => {
  const name = organizer.value?.name || organizer.value?.username || 'Organizer'
  return getAvatarInitials(name)
}
</script>

<style scoped>
.organizer-home {
  min-height: 100vh;
  background-color: #fafafa;
}

.organizer-main {
  padding: 3rem 0;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

/* profile section */
.profile-section {
  margin-bottom: 3rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  position: relative;
}

.avatar-placeholder {
  font-size: 3rem;
  font-weight: 600;
  color: #6b7280;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-avatar-button {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #FAE3C6;
  color: #8B4513;
  border: 2px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-avatar-button:hover {
  background-color: #f4d4a3;
  transform: scale(1.1);
}

.avatar-input {
  display: none;
}

.organizer-name {
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.follower-count {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 300px;
  margin: 0 auto;
}

.action-button {
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
}

.action-button:hover {
  background-color: #f4d4a3;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .avatar {
    width: 100px;
    height: 100px;
  }
  
  .avatar-placeholder {
    font-size: 2.5rem;
  }
  
  .organizer-name {
    font-size: 1.75rem;
  }
  
  .action-buttons {
    max-width: 280px;
  }
}
</style> 