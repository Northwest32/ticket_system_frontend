<template>
  <div class="event-detail-page">
    <Header />
    
    <main class="event-detail-main">
      <div class="container">
        <div v-if="event" class="event-detail">
          <!-- top navigation section -->
          <div class="event-header">
            <button class="back-button" @click="goBack">
              ← Back
            </button>
            
            <!-- organizer section -->
            <div class="organizer-section">
              <div class="organizer-info" @click="goToOrganizerProfile">
                <div class="organizer-avatar">
                  <div 
                    v-if="event?.organizerAvatarUrl" 
                    class="avatar-image"
                    :style="{ backgroundImage: `url(${getAvatarUrl(event.organizerAvatarUrl)})` }"
                  ></div>
                  <span v-else class="avatar-placeholder">{{ getOrganizerInitials() }}</span>
                </div>
                <div class="organizer-details">
                  <span class="organizer-name">{{ event.organizerName || event.organizerUsername }}</span>
                  <span class="organizer-type">Organizer</span>
                </div>
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
          
          <div class="event-content">
            <!-- left: Description section -->
            <div class="event-left-section">
              <div class="event-description">
                <h3>Description</h3>
                <div v-html="event.description || '<p>This is a placeholder description for the event.</p>'"></div>

              </div>
            </div>
            
            <!-- right: Event details section -->
            <div class="event-right-section">
              <div class="event-details">
                <div class="detail-item">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">{{ formatDate(event.eventDate) }}</span>
                </div>
                
                <div class="detail-item">
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">{{ event.location }}</span>
                </div>
                
                <div class="detail-item">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">{{ event.categoryName || 'Uncategorized' }}</span>
                </div>
                
                <div class="detail-item">
                  <span class="detail-label">Price:</span>
                  <span class="detail-value price">From ${{ event.price }}</span>
                </div>
                
                <div class="detail-item">
                  <span class="detail-label">Sale Start:</span>
                  <span class="detail-value">{{ formatDate(event.startTime) }}</span>
                </div>
                
                <div class="detail-item">
                  <span class="detail-label">Sale End:</span>
                  <span class="detail-value">{{ formatDate(event.endTime) }}</span>
                </div>
              </div>
              
              <!-- buy and bookmark buttons -->
              <div class="event-actions">
                <div class="buttons-row">
                  <button 
                    v-if="canBuy"
                    class="buy-button" 
                    @click="handleBuyClick"
                    :disabled="isSoldOut"
                    :class="{ 'sold-out': isSoldOut }"
                  >
                    {{ getButtonText() }}
                  </button>
                  <div v-else class="permission-notice">
                    <span class="notice-text">Organizers cannot purchase tickets</span>
                  </div>
                  
                  <button 
                    v-if="canBookmark"
                    class="bookmark-button" 
                    @click="toggleBookmark"
                    :class="{ 'bookmarked': isBookmarked }"
                  >
                    <span class="star-icon">⭐</span>
                    <!-- <span class="bookmark-text">(bookmark)</span> -->
                  </button>
                  <div v-else class="permission-notice">
                    <span class="notice-text">Organizers cannot bookmark events</span>
                  </div>
                </div>
                
                <div v-if="canBuy && !isSoldOut" class="purchase-limit">
                  <span class="limit-text">Maximum 3 tickets per person</span>
                </div>
                <div v-if="canBuy && isSoldOut && event && new Date() > new Date(event.endTime)" class="purchase-limit">
                  <span class="limit-text">Ticket sales have ended</span>
                </div>
              </div>
              
              <!-- comments section -->
              <div class="comments-section">
                <h3>Comments</h3>
                <div class="comments-list">
                  <div v-if="comments.length === 0" class="no-comments">
                    No comments yet. Be the first to comment!
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
                         class="reply-btn"
                         @click.stop.prevent="onReplyClick($event, comment.id)"
                       >
                         Reply
                       </button>
                     </div>
                     
                     <!-- 回复输入框 -->
                     <div v-if="String(replyingTo) === String(comment.id)" class="reply-input-section">
                       <textarea 
                         v-model="replyContent" 
                         placeholder="Write your reply here..."
                         class="reply-input"
                         rows="3"
                       ></textarea>
                       <div class="reply-actions">
                         <button 
                           class="submit-reply-btn" 
                           @click="submitReply(comment.id)"
                           :disabled="isSubmittingReply"
                         >
                           {{ isSubmittingReply ? 'Submitting...' : 'Submit Reply' }}
                         </button>
                         <button 
                           class="cancel-reply-btn" 
                           @click="cancelReply"
                         >
                           Cancel
                         </button>
                       </div>
                     </div>
                     
                     <!-- 显示回复评论 -->
                     <div v-if="comment.replies && comment.replies.length > 0" class="replies-section">
                       <div 
                         v-for="reply in comment.replies" 
                         :key="reply.id" 
                         class="reply-item"
                       >
                         <div class="reply-header">
                           <span class="reply-author">
                             {{ reply.fromUserName || 'Anonymous' }}
                             <span v-if="reply.fromUserType === 'ORGANIZER' || reply.fromUserType === 'organizer'" class="user-badge organizer-badge">Organizer</span>
                             <span v-if="reply.hasPurchased" class="user-badge purchaser-badge">Purchased</span>
                           </span>
                           <span class="reply-date">{{ formatDate(reply.createdAt) }}</span>
                         </div>
                         <p class="reply-text">{{ reply.content }}</p>
                         <div class="reply-actions">
                           <button 
                             v-if="reply.fromUserId === currentUser?.id"
                             class="delete-button"
                             @click="deleteComment(reply.id)"
                           >
                             Delete
                           </button>
                         </div>
                       </div>
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
          </div>
        </div>
        
        <div v-else-if="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>Loading event details...</p>
        </div>
        
        <div v-else-if="error" class="error">
          <p>Failed to load event details: {{ error }}</p>
          <button class="retry-button" @click="retryLoad">Retry</button>
        </div>
        
        <div v-else class="not-found">
          <p>Event not found</p>
          <button class="back-button" @click="goBack">Go Back</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { redirectToLogin } from '../utils/redirectUtils'
import { useEvent } from '../composables/useEvent'
import { canBuyTickets, canBookmarkEvents, canFollowOrganizers, getPermissionMessage } from '../utils/permissions'
import { followApi, bookmarkApi, commentApi } from '../services/api'
import { getAvatarUrl, getAvatarInitials } from '../utils/avatarUtils'
import Header from '../components/Header.vue'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, currentUser } = useAuth()
const { getEventById, isLoading, error } = useEvent()

const event = ref(null)
const isFollowing = ref(false)
const isBookmarked = ref(false)
const comments = ref([])
const newComment = ref('')
const replyingTo = ref(null)
const replyContent = ref('')
const isSubmittingReply = ref(false)

// computed properties
const isSoldOut = computed(() => {
  if (!event.value) return false
  
  // check remaining quantity
  if (event.value.remainingQuantity <= 0) {
    return true
  }
  
  // check if sale time has ended
  const currentDate = new Date()
  const saleEndTime = new Date(event.value.endTime)
  
  if (currentDate > saleEndTime) {
    return true
  }
  
  return false
})

// permission check
const canBuy = computed(() => {
  return canBuyTickets(currentUser.value?.userType)
})

const canBookmark = computed(() => {
  return canBookmarkEvents(currentUser.value?.userType)
})

const canFollow = computed(() => {
  return canFollowOrganizers(currentUser.value?.userType)
})

onMounted(async () => {
  try {
    const eventId = parseInt(route.params.id)
    if (eventId) {
      console.log('[EventDetailView] Loading event:', eventId)
      const eventData = await getEventById(eventId)
      event.value = eventData
      console.log('[EventDetailView] Event loaded:', eventData)
      
      // load follow status
      if (event.value?.createdBy && isAuthenticated.value && canFollow.value) {
        await loadFollowStatus(event.value.createdBy)
      }
      
      // load bookmark status
      if (isAuthenticated.value && canBookmark.value) {
        await loadBookmarkStatus(event.value.id)
      }
      
      // load comments data
      await loadComments(eventId)
    }
  } catch (error) {
    console.error('[EventDetailView] Failed to load event:', error)
    // can show error message to user
  }
  
  // 保底：在捕获阶段屏蔽旧监听（可选）
  window.addEventListener(
    'click',
    (e) => {
      const t = e.target;
      if (t && t.classList && t.classList.contains('reply-button')) {
        e.stopImmediatePropagation?.();
        e.preventDefault?.();
      }
    },
    true // 捕获阶段，先于冒泡触发
  );
})

// methods
const goBack = () => {
  router.back()
}



const getButtonText = () => {
  if (!event.value) return 'Get Tickets'
  
  // check remaining quantity
  if (event.value.remainingQuantity <= 0) {
    return 'Sold Out'
  }
  
  // check if sale time has ended
  const currentDate = new Date()
  const saleEndTime = new Date(event.value.endTime)
  
  if (currentDate > saleEndTime) {
    return 'Sale Ended'
  }
  
  return 'Get Tickets'
}

const goToOrganizerProfile = () => {
  if (event.value?.createdBy) {
    router.push(`/organizer/${event.value.createdBy}`)
  }
}

// load follow status
const loadFollowStatus = async (organizerId) => {
  try {
    console.log('[EventDetailView] Loading follow status for organizer:', organizerId)
    const response = await followApi.checkFollowStatus(organizerId)
    if (response && response.code === 0) {
      isFollowing.value = response.data
    } else {
      isFollowing.value = false
    }
    console.log('[EventDetailView] Follow status loaded:', response.data)
  } catch (error) {
    console.error('[EventDetailView] Failed to load follow status:', error)
    isFollowing.value = false
  }
}

// load bookmark status
const loadBookmarkStatus = async (eventId) => {
  try {
    console.log('[EventDetailView] Loading bookmark status for event:', eventId)
    const response = await bookmarkApi.checkBookmarkStatus(eventId)
    // backend return boolean value, not CommonResponse format
    isBookmarked.value = response === true
    console.log('[EventDetailView] Bookmark status loaded:', response)
  } catch (error) {
    console.error('[EventDetailView] Failed to load bookmark status:', error)
    isBookmarked.value = false
  }
}

const toggleFollow = async () => {
  if (!isAuthenticated.value) {
    redirectToLogin(router, route.path, route.query)
    return
  }
  
  if (!canFollow.value) {
    alert(getPermissionMessage('follow_organizers', currentUser.value?.userType))
    return
  }
  
  try {
    if (isFollowing.value) {
      // unfollow
      const response = await followApi.unfollowOrganizer(event.value.createdBy)
      if (response && response.code === 0) {
        isFollowing.value = false
        alert('Successfully unfollowed organizer')
      } else {
        alert(response?.message || 'Failed to unfollow organizer')
      }
    } else {
      // follow
      const response = await followApi.followOrganizer(event.value.createdBy)
      if (response && response.code === 0) {
        isFollowing.value = true
        alert('Successfully followed organizer')
      } else {
        alert(response?.message || 'Failed to follow organizer')
      }
    }
  } catch (error) {
    console.error('[EventDetailView] Failed to toggle follow:', error)
    alert('Failed to update follow status. Please try again.')
  }
}

const toggleBookmark = async () => {
  if (!isAuthenticated.value) {
    redirectToLogin(router, route.path, route.query)
    return
  }
  
  if (!canBookmark.value) {
    alert(getPermissionMessage('bookmark_events', currentUser.value?.userType))
    return
  }
  
  try {
    if (isBookmarked.value) {
      // remove bookmark
      const response = await bookmarkApi.removeBookmark(event.value.id)
      // backend return string message, not CommonResponse format
      if (response === 'Bookmark removed successfully') {
        isBookmarked.value = false
        alert('Bookmark removed successfully')
      } else {
        alert(response || 'Failed to remove bookmark')
      }
    } else {
      // add bookmark
      const response = await bookmarkApi.addBookmark(event.value.id)
      // backend return string message, not CommonResponse format
      if (response === 'Event bookmarked successfully') {
        isBookmarked.value = true
        alert('Event bookmarked successfully')
      } else {
        alert(response || 'Failed to bookmark event')
      }
    }
  } catch (error) {
    console.error('[EventDetailView] Failed to toggle bookmark:', error)
    alert('Failed to update bookmark status. Please try again.')
  }
}

const handleBuyClick = () => {
  if (!isAuthenticated.value) {
    redirectToLogin(router, route.path, route.query)
    return
  }
  
  if (!canBuy.value) {
    alert(getPermissionMessage('buy_tickets', currentUser.value?.userType))
    return
  }
  
  if (isSoldOut.value) {
    return
  }
  
  // redirect to payment page
  router.push(`/payment/${event.value.id}`)
}

const isSubmitting = ref(false)

const addComment = async () => {
  if (!isAuthenticated.value) {
    redirectToLogin(router, route.path, route.query)
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
    console.log('[EventDetailView] Adding comment for event:', event.value.id)
    
    const commentData = {
      content: newComment.value.trim(),
      fromUserId: currentUser.value.id,
      toEventId: event.value.id,
      toOrganizerId: null, // null when commenting on event
      rating: null, // not set rating
      parentCommentId: null // top level comment
    }
    
    console.log('[EventDetailView] Comment data:', commentData)
    
    const response = await commentApi.createComment(commentData)
    console.log('[EventDetailView] Comment creation response:', response)
    
    if (response && response.code === 0 && response.data) {
      // Clear input first
      newComment.value = ''
      // Then reload comment list
      await loadComments(event.value.id)
    } else {
      alert(response?.message || 'Failed to add comment')
    }
  } catch (error) {
    console.error('[EventDetailView] Error adding comment:', error)
    alert('Failed to add comment. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const deleteComment = async (commentId) => {
  if (!isAuthenticated.value) {
    redirectToLogin(router, route.path, route.query)
    return
  }
  
  if (!confirm('Are you sure you want to delete this comment?')) {
    return
  }
  
  try {
    console.log('[EventDetailView] Deleting comment:', commentId)
    
    const response = await commentApi.deleteComment(commentId, currentUser.value.id)
    console.log('[EventDetailView] Delete comment response:', response)
    
    if (response && response.code === 0 && response.data) {
      // reload comment list
      await loadComments(event.value.id)
      alert('Comment deleted successfully!')
    } else {
      alert(response?.message || 'Failed to delete comment')
    }
  } catch (error) {
    console.error('[EventDetailView] Error deleting comment:', error)
    alert('Failed to delete comment. Please try again.')
  }
}

const onReplyClick = (e, commentId) => {
  // 阻断同一元素上的其他监听器（关键）
  if (e && typeof e.stopImmediatePropagation === 'function') {
    e.stopImmediatePropagation();
  }
  
  if (!isAuthenticated.value) {
    redirectToLogin(router, route.path, route.query)
    return
  }
  
  replyingTo.value = commentId;
  replyContent.value = '';
  console.log('[EventDetailView] onReplyClick -> replyingTo =', replyingTo.value);
}

const submitReply = async (commentId) => {
  if (!replyContent.value.trim()) {
    alert('Please enter a reply message');
    return;
  }
  
  try {
    isSubmittingReply.value = true;
    console.log('[EventDetailView] Submitting reply to comment:', commentId);
    
    // 创建回复评论
    const commentData = {
      content: replyContent.value.trim(),
      fromUserId: currentUser.value.id,
      toEventId: event.value.id,
      toOrganizerId: null, // null when replying to event comment
      rating: null, // not set rating
      parentCommentId: commentId // 设置父评论ID，表示这是回复
    }
    
    console.log('[EventDetailView] Reply comment data:', commentData)
    
    const response = await commentApi.createComment(commentData)
    
    if (response && response.code === 0) {
      console.log('[EventDetailView] Reply submitted successfully');
      // 重新加载评论列表
      await loadComments(event.value.id);
      // 重置回复状态
      replyingTo.value = null;
      replyContent.value = '';
      alert('Reply submitted successfully!');
    } else {
      alert(response?.message || 'Failed to submit reply');
    }
  } catch (error) {
    console.error('[EventDetailView] Error submitting reply:', error);
    alert('Failed to submit reply. Please try again.');
  } finally {
    isSubmittingReply.value = false;
  }
}

const cancelReply = () => {
  replyingTo.value = null;
  replyContent.value = '';
  console.log('[EventDetailView] Reply cancelled');
}

const loadComments = async (eventId) => {
  try {
    console.log('[EventDetailView] Loading comments for event:', eventId)
    const commentsResponse = await commentApi.getCommentsByEvent(eventId)
    console.log('[EventDetailView] Comments response:', commentsResponse)
    
    if (commentsResponse && commentsResponse.code === 0 && commentsResponse.data) {
      // Remove duplicates by ID
      const uniqueComments = commentsResponse.data.filter((comment, index, self) => 
        index === self.findIndex(c => c.id === comment.id)
      )
      
      // 组织评论层级结构
      const topLevelComments = uniqueComments.filter(comment => !comment.parentCommentId)
      const replyComments = uniqueComments.filter(comment => comment.parentCommentId)
      
      // 将回复添加到对应的父评论下
      topLevelComments.forEach(comment => {
        comment.replies = replyComments.filter(reply => reply.parentCommentId === comment.id)
      })
      
      comments.value = topLevelComments
      console.log('[EventDetailView] Loaded comments with replies:', comments.value)
      // Debug: Check each comment's fromUserType and replies
      comments.value.forEach((comment, index) => {
        console.log(`[EventDetailView] Comment ${index}: fromUserName=${comment.fromUserName}, fromUserType=${comment.fromUserType}, replies=${comment.replies?.length || 0}`)
      })
    } else {
      console.log('[EventDetailView] No comments found or error:', commentsResponse)
      comments.value = []
    }
  } catch (commentError) {
    console.error('[EventDetailView] Error loading event comments:', commentError)
    comments.value = []
  }
}

const retryLoad = async () => {
  try {
    const eventId = parseInt(route.params.id)
    if (eventId) {
      console.log('[EventDetailView] Retrying to load event:', eventId)
      const eventData = await getEventById(eventId)
      event.value = eventData
      console.log('[EventDetailView] Event loaded on retry:', eventData)
    }
  } catch (error) {
    console.error('[EventDetailView] Failed to load event on retry:', error)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'TBD'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// get organizer initials for avatar placeholder
const getOrganizerInitials = () => {
  const name = event.value?.organizerName || event.value?.organizerUsername || 'Organizer'
  return getAvatarInitials(name)
}
</script>

<style scoped>
.event-description ::v-deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem auto;
}


.event-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.event-detail-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* top navigation and organizer info */
.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem 0;
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

.organizer-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.organizer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.organizer-info:hover {
  background-color: #F5F5F5;
}

.organizer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-size: 0.9rem;
}

.organizer-details {
  display: flex;
  flex-direction: column;
}

.organizer-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
}

.organizer-type {
  font-size: 0.75rem;
  color: #6b7280;
}

.follow-button {
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
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
  background-color: #F5F5F5;
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
.event-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

/* left: Description section */
.event-left-section {
  display: flex;
  flex-direction: column;
}

.event-description {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  height: fit-content;
}

.event-description h3 {
  font-size: 1.25rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  text-align: center;
}

.event-description p {
  color: #6b7280;
  line-height: 1.6;
  text-align: center;
}

/* right: Event details section */
.event-right-section {
  display: flex;
  flex-direction: column; 
  gap: 1.5rem;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background-color: #fbf6f3;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.detail-value {
  color: #6b7280;
  font-size: 0.9rem;
}

.detail-value.price {
  color: #059669;
  font-weight: 600;
  font-size: 1rem;
}

/* buy and bookmark buttons */
.event-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.buttons-row {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

.purchase-limit {
  text-align: center;
}

.limit-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

.buy-button {
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 1rem 3rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 200px;
}

.buy-button:hover:not(:disabled) {
  background-color: #f4d4a3;
}

.buy-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.buy-button.sold-out {
  background-color: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  cursor: not-allowed;
}

.buy-button.sold-out:hover {
  background-color: #f3f4f6;
  color: #6b7280;
}

.bookmark-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.bookmark-button:hover {
  background-color: #F5F5F5;
}

.bookmark-button.bookmarked {
  background-color: #fef3c7;
  border-color: #f59e0b;
}

.star-icon {
  font-size: 1rem;
}

.bookmark-text {
  color: #6b7280;
}

/* comments section */
.comments-section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
}

.comments-section h3 {
  font-size: 1.1rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  text-align: center;
}

.comments-list {
  margin-bottom: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem 0;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.comments-list::-webkit-scrollbar {
  width: 6px;
}

.comments-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.comments-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.comments-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.no-comments {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 1rem;
}

.comment-item {
  background-color: white;
  border-radius: 6px;
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
  margin-bottom: 0.75rem;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
}

.delete-button {
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.delete-button:hover {
  background-color: #b91c1c;
}

.reply-btn {
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.reply-btn:hover {
  background-color: #f4d4a3;
}

.reply-input-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.reply-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.9rem;
}

.reply-input:focus {
  outline: none;
  border-color: #FAE3C6;
  box-shadow: 0 0 0 3px rgba(250, 227, 198, 0.3);
}

.reply-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.submit-reply-btn {
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.submit-reply-btn:hover:not(:disabled) {
  background-color: #f4d4a3;
}

.submit-reply-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.cancel-reply-btn {
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.cancel-reply-btn:hover {
  background-color: #b91c1c;
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

.loading {
  text-align: center;
  padding: 3rem 0;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #FAE3C6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 3rem 0;
  color: #ef4444;
}

.retry-button {
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 1rem;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background-color: #f4d4a3;
}

.not-found {
  text-align: center;
  padding: 3rem 0;
  color: #6b7280;
}

/* responsive design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .event-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .event-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .organizer-section {
    width: 100%;
    justify-content: space-between;
  }
  
  .event-actions {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .buy-button {
    max-width: none;
    flex: 1;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

/* 回复评论显示样式 */
.replies-section {
  margin-top: 1rem;
  padding-left: 2rem;
  border-left: 2px solid #e5e7eb;
}

.reply-item {
  background-color: #f9fafb;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  border: 1px solid #e5e7eb;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.reply-author {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reply-date {
  font-size: 0.7rem;
  color: #6b7280;
}

.reply-text {
  color: #4b5563;
  line-height: 1.4;
  font-size: 0.85rem;
  margin: 0 0 0.5rem 0;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.reply-actions {
  display: flex;
  gap: 0.5rem;
}
</style> 