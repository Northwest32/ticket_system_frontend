<template>
  <div class="organizer-profile-page">
    <Header />
    
    <main class="organizer-profile-main">
      <div class="container">
        <div v-if="organizer" class="organizer-profile">
          <!-- top section -->
          <div class="top-section card">
            <!-- Logo/Back button -->
            <div class="logo-back-section">
              <button class="back-button" @click="goBack">
                ← Back
              </button>
            </div>
            
            <!-- organizer info section -->
            <div class="organizer-info-section">
              <div class="organizer-avatar">
                <div 
                  v-if="organizer?.avatarUrl" 
                  class="avatar-image"
                  :style="{ backgroundImage: `url(${getAvatarUrl(organizer.avatarUrl)})` }"
                ></div>
                <span v-else class="avatar-placeholder">{{ getOrganizerInitials() }}</span>
              </div>
              <h1 class="organizer-name">{{ organizer.name }}</h1>
              <div class="organizer-stats">
                <span class="follower-count">{{ organizer.followerCount }} Followers</span>
                <span class="event-count">{{ organizer.eventCount }} Events</span>
              </div>
              <button 
                v-if="canFollow"
                class="follow-button"
                @click="toggleFollow"
                :class="{ 'following': isFollowing }"
              >
                {{ isFollowing ? '✓ Following' : '+ Follow' }}
              </button>
              <div v-else class="permission-notice">
                <span class="notice-text">Organizers cannot follow others</span>
              </div>
            </div>
          </div>
          
          <!-- main content section -->
          <div class="main-content">
            <!-- left: Description section -->
            <div class="description-section card">
              <h2 class="section-title">Description</h2>
              <div class="description-content">
                <div v-if="organizer.description" v-html="organizer.description"></div>
                <p v-else>This organizer has not provided a description yet.</p>
              </div>
            </div>
            
            <!-- right: Comments section -->
            <div class="comments-section card">
              <h2 class="section-title">Comments</h2>
              
              <div class="comments-list">
                <div v-if="comments.length === 0" class="no-comments">
                  <p>No comments yet. Be the first to comment!</p>
                </div>
                <div 
                  v-for="comment in comments" 
                  :key="comment.id" 
                  class="comment-item"
                >
                  <div class="comment-header">
                    <span class="comment-author">
                      {{ comment.fromUserName || 'Anonymous' }}
                      <span v-if="comment.fromUserType === 'ORGANIZER' || comment.fromUserType === 'organizer'" class="user-badge organizer-badge">Organizer</span>
                      <span v-if="comment.hasPurchased" class="user-badge purchaser-badge">Purchased</span>
                    </span>
                    <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <div class="comment-actions">
                    <button 
                      v-if="comment.fromUserId === currentUser?.id"
                      class="delete-button"
                      @click="deleteComment(comment.id)"
                    >
                      Delete
                    </button>
                    <button 
                      class="reply-button"
                      @click="replyToComment(comment.id)"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="add-comment-section">
                <textarea 
                  v-model="newComment" 
                  placeholder="Write your comment here..."
                  class="comment-input"
                  rows="3"
                ></textarea>
                <button 
                  class="add-comment-button" 
                  @click="addComment"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? 'Adding...' : 'Add Comments' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- bottom: Event list section -->
          <div class="events-section card">
            <!-- upcoming events -->
            <div class="upcoming-events">
              <h2 class="section-title">Upcoming Events</h2>
              
              <div v-if="upcomingEvents.length === 0" class="no-events">
                <p>No upcoming events at the moment.</p>
              </div>
              
              <div v-else class="events-scroll">
                <div 
                  v-for="event in upcomingEvents" 
                  :key="event.id" 
                  class="event-card"
                  @click="goToEvent(event.id)"
                >
                  <div class="event-image">
                    <img 
                      v-if="event.imageUrl" 
                      :src="event.imageUrl" 
                      :alt="event.title"
                      class="event-cover-image"
                      @error="handleImageError"
                    />
                    <div v-else class="image-placeholder">
                      <span class="image-text">{{ event.categoryName }}</span>
                    </div>
                  </div>
                  <div class="event-info">
                    <div class="event-category">{{ event.categoryName }}</div>
                    <h3 class="event-title">{{ event.title }}</h3>
                    <div class="event-meta">
                      <span class="event-date">{{ formatDate(event.eventDate) }}</span>
                      <span class="event-location">{{ event.location }}</span>
                    </div>
                    <div class="event-price">
                      From ${{ event.price }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- past events -->
            <div class="past-events">
              <h2 class="section-title">Past Events</h2>
              
              <div v-if="pastEvents.length === 0" class="no-events">
                <p>No past events.</p>
              </div>
              
              <div v-else class="events-scroll">
                <div 
                  v-for="event in pastEvents" 
                  :key="event.id" 
                  class="event-card past-event"
                  @click="goToEvent(event.id)"
                >
                  <div class="event-image">
                    <img 
                      v-if="event.imageUrl" 
                      :src="event.imageUrl" 
                      :alt="event.title"
                      class="event-cover-image"
                      @error="handleImageError"
                    />
                    <div v-else class="image-placeholder past">
                      <span class="image-text">{{ event.categoryName }}</span>
                    </div>
                    <div class="past-badge">Past</div>
                  </div>
                  <div class="event-info">
                    <div class="event-category">{{ event.categoryName }}</div>
                    <h3 class="event-title">{{ event.title }}</h3>
                    <div class="event-meta">
                      <span class="event-date">{{ formatDate(event.eventDate) }}</span>
                      <span class="event-location">{{ event.location }}</span>
                    </div>
                    <div class="event-status">
                      <span class="status-badge completed">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="loading">
          <p>Loading organizer profile...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { canFollowOrganizers } from '../utils/permissions'
import { organizerProfileApi, followApi, commentApi, eventApi, userApi } from '../services/api'
import { getAvatarUrl, getAvatarInitials } from '../utils/avatarUtils'
import Header from '../components/Header.vue'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, currentUser } = useAuth()

const organizer = ref(null)
const upcomingEvents = ref([])
const pastEvents = ref([])
const comments = ref([])
const newComment = ref('')
const isFollowing = ref(false)
const isSubmitting = ref(false)

// permission check
const canFollow = computed(() => {
  return canFollowOrganizers(currentUser.value?.userType)
})



onMounted(async () => {
  // get organizer ID
  const organizerId = parseInt(route.params.id)
  console.log('[OrganizerProfileView] Loading profile for organizer ID:', organizerId)
  
  if (!organizerId) {
    console.error('[OrganizerProfileView] Invalid organizer ID')
    router.push('/events')
    return
  }
  
  // load user info and organizer profile
  try {
    console.log('[OrganizerProfileView] Loading user info and organizer profile...')
    const [userResponse, profileResponse] = await Promise.all([
      userApi.getUserById(organizerId),
      organizerProfileApi.getProfile(organizerId)
    ])
    console.log('[OrganizerProfileView] User response:', userResponse)
    console.log('[OrganizerProfileView] Profile response:', profileResponse)
    
    if (userResponse && userResponse.code === 0 && userResponse.data) {
      // get description from profile API, fallback to default if not available
      let description = 'This organizer has not provided a description yet.'
      if (profileResponse && profileResponse.code === 0 && profileResponse.data && profileResponse.data.homepageDescription) {
        description = profileResponse.data.homepageDescription
      }
      
      organizer.value = {
        id: organizerId,
        name: userResponse.data.username,
        description: description,
        eventCount: 0,
        followerCount: 0,
        avatarUrl: userResponse.data.avatarUrl || null
      }
      console.log('[OrganizerProfileView] Set organizer from user API and profile API:', organizer.value)
    } else {
      console.error('[OrganizerProfileView] Failed to get user info, redirecting')
      router.push('/events')
      return
    }
  } catch (error) {
    console.error('[OrganizerProfileView] Error loading user info or profile:', error)
    router.push('/events')
    return
  }
  
  if (!organizer.value) {
    console.error('[OrganizerProfileView] Failed to load organizer info, redirecting')
    router.push('/events')
    return
  }
  
  // load follower count
  await loadFollowerCount(organizerId)
  
  // load follow status
  if (isAuthenticated.value && canFollow.value) {
    await loadFollowStatus(organizerId)
  }
  
  // load real event data for this organizer
  try {
    const eventsResponse = await eventApi.getEventsByOrganizer(organizerId)
    if (eventsResponse && eventsResponse.code === 0 && eventsResponse.data) {
      const now = new Date()
      upcomingEvents.value = eventsResponse.data.filter(event => 
        new Date(event.eventDate) > now && event.status !== 'finished'
      )
      pastEvents.value = eventsResponse.data.filter(event => 
        new Date(event.eventDate) <= now || event.status === 'finished'
      )
      
      // update organizer's event count
      if (organizer.value) {
        organizer.value.eventCount = eventsResponse.data.length
        console.log('[OrganizerProfileView] Updated event count to:', eventsResponse.data.length)
      }
    }
  } catch (eventError) {
    console.error('Error loading organizer events:', eventError)
  }
  
  // load real comments data for this organizer
  await loadComments(organizerId)
})

// load comments data
const loadComments = async (organizerId) => {
  try {
    console.log('[OrganizerProfileView] Loading comments for organizer:', organizerId)
    const commentsResponse = await commentApi.getCommentsByOrganizer(organizerId)
    console.log('[OrganizerProfileView] Comments response:', commentsResponse)
    
    if (commentsResponse && commentsResponse.code === 0 && commentsResponse.data) {
      // Remove duplicates by ID
      const uniqueComments = commentsResponse.data.filter((comment, index, self) => 
        index === self.findIndex(c => c.id === comment.id)
      )
      comments.value = uniqueComments
      console.log('[OrganizerProfileView] Loaded comments:', comments.value)
    } else {
      console.log('[OrganizerProfileView] No comments found or error:', commentsResponse)
      comments.value = []
    }
  } catch (commentError) {
    console.error('[OrganizerProfileView] Error loading organizer comments:', commentError)
    comments.value = []
  }
}

// methods
const goBack = () => {
  router.back()
}

const getOrganizerInitials = () => {
  if (!organizer.value?.name) return 'O'
  return organizer.value.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// load follower count
const loadFollowerCount = async (organizerId) => {
  try {
    console.log('[OrganizerProfileView] Loading follower count for organizer:', organizerId)
    const response = await followApi.getFollowerCount(organizerId)
    console.log('[OrganizerProfileView] Follower count response:', response)
    console.log('[OrganizerProfileView] Response type:', typeof response)
    console.log('[OrganizerProfileView] Response code:', response?.code)
    console.log('[OrganizerProfileView] Response data:', response?.data)
    
    // backend return CommonResponse format
    if (organizer.value && response && response.code === 0 && response.data !== undefined) {
      organizer.value.followerCount = response.data
      console.log('[OrganizerProfileView] Updated follower count to:', response.data)
    } else {
      console.log('[OrganizerProfileView] Failed to update follower count, response:', response)
    }
  } catch (error) {
    console.error('[OrganizerProfileView] Failed to load follower count:', error)
  }
}

// load follow status
const loadFollowStatus = async (organizerId) => {
  try {
    console.log('[OrganizerProfileView] Loading follow status for organizer:', organizerId)
    const response = await followApi.checkFollowStatus(organizerId)
    if (response && response.code === 0) {
      isFollowing.value = response.data
    } else {
      isFollowing.value = false
    }
    console.log('[OrganizerProfileView] Follow status loaded:', response.data)
  } catch (error) {
    console.error('[OrganizerProfileView] Failed to load follow status:', error)
    isFollowing.value = false
  }
}

const toggleFollow = async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  if (!canFollow.value) {
    alert('Organizers cannot follow other organizers. Please switch to buyer account.')
    return
  }
  
  try {
    if (isFollowing.value) {
      // unfollow
      const response = await followApi.unfollowOrganizer(organizer.value.id)
      if (response && response.code === 0) {
        isFollowing.value = false
        organizer.value.followerCount--
        alert('Successfully unfollowed organizer')
      } else {
        alert(response?.message || 'Failed to unfollow organizer')
      }
    } else {
      // follow
      const response = await followApi.followOrganizer(organizer.value.id)
      if (response && response.code === 0) {
        isFollowing.value = true
        organizer.value.followerCount++
        alert('Successfully followed organizer')
      } else {
        alert(response?.message || 'Failed to follow organizer')
      }
    }
  } catch (error) {
    console.error('[OrganizerProfileView] Failed to toggle follow:', error)
    alert('Failed to update follow status. Please try again.')
  }
}

const goToEvent = (eventId) => {
  router.push(`/event/${eventId}`)
}

const addComment = async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  if (!newComment.value.trim()) {
    alert('Please enter a comment before submitting.')
    return
  }
  
  // Prevent duplicate submission
  if (isSubmitting.value) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    console.log('[OrganizerProfileView] Adding comment for organizer:', organizer.value.id)
    
    const commentData = {
      content: newComment.value.trim(),
      fromUserId: currentUser.value.id,
      toOrganizerId: organizer.value.id,
      rating: null, // not set rating for now
      parentCommentId: null // not set parent comment for now
    }
    
    console.log('[OrganizerProfileView] Comment data:', commentData)
    
    const response = await commentApi.createComment(commentData)
    console.log('[OrganizerProfileView] Comment creation response:', response)
    
    if (response && response.code === 0 && response.data) {
      // Clear input first
      newComment.value = ''
      // Then reload comment list
      await loadComments(organizer.value.id)
    } else {
      alert(response?.message || 'Failed to add comment')
    }
  } catch (error) {
    console.error('[OrganizerProfileView] Error adding comment:', error)
    alert('Failed to add comment. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const deleteComment = async (commentId) => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  if (!confirm('Are you sure you want to delete this comment?')) {
    return
  }
  
  try {
    console.log('[OrganizerProfileView] Deleting comment:', commentId)
    
    const response = await commentApi.deleteComment(commentId, currentUser.value.id)
    console.log('[OrganizerProfileView] Delete comment response:', response)
    
    if (response && response.code === 0 && response.data) {
      // reload comment list
      await loadComments(organizer.value.id)
      alert('Comment deleted successfully!')
    } else {
      alert(response?.message || 'Failed to delete comment')
    }
  } catch (error) {
    console.error('[OrganizerProfileView] Error deleting comment:', error)
    alert('Failed to delete comment. Please try again.')
  }
}

const replyToComment = (commentId) => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
    // here can implement reply function
  // can open a reply input box or redirect to reply page
  console.log('Reply to comment:', commentId)
  alert('Reply functionality will be implemented here')
}



const formatDate = (dateString) => {
  if (!dateString) return 'TBD'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleImageError = (event) => {
  console.log('[OrganizerProfileView] Image load error for:', event.target.src)
  // hide image, show placeholder
  event.target.style.display = 'none'
  const placeholder = event.target.nextElementSibling
  if (placeholder && placeholder.classList.contains('image-placeholder')) {
    placeholder.style.display = 'flex'
  }
}


</script>

<style scoped>
.organizer-profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.organizer-profile-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 统一卡片外观，供 top / description / comments / events 共用 */
.card {
  background-color: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
}

/* top section */
.top-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.logo-back-section {
  align-self: flex-start;
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

.organizer-info-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.organizer-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 50%;
}

.avatar-placeholder {
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
}

.organizer-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  text-align: center;
}

.organizer-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
  justify-content: center;
}

.follower-count,
.event-count {
  font-weight: 500;
}

.follow-button {
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}


.follow-button:hover {
  background-color: #f4d4a3;
}

.follow-button.following {
  background-color: #ac8264;
  color: white;
}

.follow-button.following:hover {
  background-color:#775037;
}


/* Permission Notice */
.permission-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  min-height: 40px;
}

.notice-text {
  font-size: 0.8rem;
  color: #6b7280;
  text-align: center;
  font-style: italic;
}

/* main content section */
.main-content {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(320px, 3fr);
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: start;
}

/* 确保右侧列能占满自己的格子 */
.comments-section, .description-section {
  width: 100%;
}

/* Description 里的图文不要把布局撑爆 */
.description-content img {
  max-width: 100%;
  height: auto;
  display: block;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
  text-align: center;
}

.description-content {
  color: #6b7280;
  line-height: 1.7;
  font-size: 0.95rem;
}

.description-content p {
  margin: 0 0 1rem 0;
}

.description-content h1,
.description-content h2 {
  color: #1f2937;
  margin: 1rem 0 0.5rem 0;
}

.description-content h1 {
  font-size: 1.3rem;
  font-weight: 700;
}

.description-content h2 {
  font-size: 1.1rem;
  font-weight: 600;
}

.description-content ul,
.description-content ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.description-content li {
  margin: 0.25rem 0;
}

.description-content strong {
  font-weight: 600;
  color: #374151;
}

.description-content em {
  font-style: italic;
}

.description-content u {
  text-decoration: underline;
}

.description-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Comments section */
.comments-list {
  margin-bottom: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.no-comments {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 1rem;
}

.comment-item {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.organizer-badge {
  background-color: #FAE3C6;
  color: #8B4513;
}

.purchaser-badge {
  background-color: #10b981;
  color: white;
}

.comment-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.comment-text {
  color: #4b5563;
  line-height: 1.5;
  font-size: 0.9rem;
  margin: 0 0 0.75rem 0;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
}

.reply-button, .delete-button {
  background: none;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.reply-button {
  background-color: #FAE3C6;
  color: #8B4513;
}

.reply-button:hover {
  background-color: #f4d4a3;
  color: #8B4513;
}

.delete-button {
  color: #dc2626;
}

.delete-button:hover {
  background-color: #fef2f2;
  color: #b91c1c;
}

.add-comment-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.9rem;
}

.comment-input:focus {
  outline: none;
  border-color: #FAE3C6;
  box-shadow: 0 0 0 3px rgba(250, 227, 198, 0.3);
}

.add-comment-button {
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  align-self: flex-end;
}

.add-comment-button:hover:not(:disabled) {
  background-color: #f4d4a3;
}

.add-comment-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.add-comment-button:hover:not(:disabled) {
  background-color: #f4d4a3;
}

/* Events section - 移除重复的卡片样式，使用统一的.card类 */

.upcoming-events,
.past-events {
  margin-bottom: 2rem;
}

.upcoming-events:last-child,
.past-events:last-child {
  margin-bottom: 0;
}

.no-events {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.events-scroll {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.events-scroll::-webkit-scrollbar {
  height: 6px;
}

.events-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.events-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.events-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.event-card {
  width: 260px;
  background-color: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
  /* min-width: 280px; */
  flex-shrink: 0;
}

.event-title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
   /* -webkit-line-clamp: 2;     最多显示两行 */
  -webkit-box-orient: vertical;
  word-break: break-word;     /* 防止长单词撑开 */
}


.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-card.past-event {
  opacity: 0.8;
}

.event-image {
  height: 120px;
  position: relative;
}

.event-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.image-placeholder.past {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

.image-text {
  color: white;
  font-weight: bold;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.past-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: #6b7280;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.event-info {
  padding: 1rem;
}

.event-category {
  color: #8B4513;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.event-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.event-date,
.event-location {
  font-size: 0.8rem;
  color: #6b7280;
}

.event-price {
  color: #059669;
  font-weight: 600;
  font-size: 0.9rem;
}

.event-status {
  margin-top: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-badge.completed {
  background-color: #d1fae5;
  color: #065f46;
}

.loading {
  text-align: center;
  padding: 3rem 0;
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .card {
    padding: 1.5rem;
  }
  
  .main-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .organizer-name {
    font-size: 1.5rem;
  }
  
  .organizer-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .events-scroll {
    gap: 1rem;
  }
  
  .event-card {
    width: 240px;
  }
}
</style> 