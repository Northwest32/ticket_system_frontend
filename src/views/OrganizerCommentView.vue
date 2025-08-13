<template>
  <div class="organizer-comment-page">
    <Header />
    <main class="organizer-comment-main">
      <div class="container">
        <div class="page-header">
          <button class="back-button" @click="goBack">← Back</button>
          <h1 class="page-title">My Comments</h1>
        </div>
        
        <div class="comment-tabs">
          <button 
            class="tab-button" 
            :class="{ active: commentTab === 'given' }"
            @click="setCommentTab('given')"
          >
            Given Comments
          </button>
          <button 
            class="tab-button" 
            :class="{ active: commentTab === 'received' }"
            @click="setCommentTab('received')"
          >
            Received Comments
          </button>
        </div>

        <div class="comments-section">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <p>Loading comments...</p>
          </div>
          
          <!-- Given Comments -->
          <div v-else-if="commentTab === 'given'" class="given-comments">
            <div v-if="givenComments.length === 0" class="empty-state">
              <p>No comments given yet.</p>
            </div>
            <div v-else class="comments-list">
              <div 
                v-for="comment in givenComments" 
                :key="comment.id" 
                class="comment-item"
              >
                <div class="comment-header">
                  <div class="comment-info">
                    <span class="comment-id">ID: {{ comment.id }}</span>
                    <span class="comment-date">Date: {{ formatDate(comment.date) }}</span>
                  </div>
                </div>
                <div class="comment-content">
                  <p class="comment-text">Content: {{ comment.text }}</p>
                  <p class="comment-target">To: {{ comment.target }}</p>
                </div>
                <div class="comment-actions">
                  <button 
                    class="delete-comment-button"
                    @click="deleteComment(comment.id)"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Received Comments -->
          <div v-else-if="commentTab === 'received'" class="received-comments">
            <div v-if="receivedComments.length === 0" class="empty-state">
              <p>No comments received yet.</p>
            </div>
            <div v-else class="comments-list">
              <div 
                v-for="comment in receivedComments" 
                :key="comment.id" 
                class="comment-item"
              >
                <div class="comment-header">
                  <div class="comment-info">
                    <span class="comment-id">ID: {{ comment.id }}</span>
                    <span class="comment-date">Date: {{ formatDate(comment.date) }}</span>
                  </div>
                </div>
                <div class="comment-content">
                  <p class="comment-text">Content: {{ comment.text }}</p>
                                     <p class="comment-author">
                     From: {{ comment.author }}
                     <span v-if="comment.authorType === 'ORGANIZER' || comment.authorType === 'organizer'" class="user-badge organizer-badge">Organizer</span>
                     <span v-if="comment.hasPurchased" class="user-badge purchaser-badge">Purchased</span>
                   </p>
                </div>
                <div class="comment-actions">
                  <button class="reply-comment-button">Reply</button>
                </div>
              </div>
            </div>
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
import { commentApi } from '../services/api'
import Header from '../components/Header.vue'

const router = useRouter()
const { currentUser } = useAuth()

const commentTab = ref('given')

// 评论数据
const givenComments = ref([])
const receivedComments = ref([])
const loading = ref(false)

// 加载发出的评论
const loadGivenComments = async () => {
  if (!currentUser.value?.id) return
  
  try {
    loading.value = true
    const response = await commentApi.getGivenComments(currentUser.value.id)
    if (response && response.code === 0 && response.data) {
      givenComments.value = response.data.map(comment => ({
        id: comment.id,
        date: comment.createdAt,
        text: comment.content,
        target: comment.toEventId ? `Event ID: ${comment.toEventId}` : 
                comment.toOrganizerId ? `Organizer ID: ${comment.toOrganizerId}` : 'Unknown Target'
      }))
    } else {
      givenComments.value = []
    }
  } catch (error) {
    console.error('Failed to load given comments:', error)
    givenComments.value = []
  } finally {
    loading.value = false
  }
}

// 加载收到的评论
const loadReceivedComments = async () => {
  if (!currentUser.value?.id) return
  
  try {
    loading.value = true
    const response = await commentApi.getReceivedComments(currentUser.value.id)
    if (response && response.code === 0 && response.data) {
             receivedComments.value = response.data.map(comment => ({
         id: comment.id,
         date: comment.createdAt,
         text: comment.content,
         author: comment.fromUserName || `User ID: ${comment.fromUserId}`,
         authorType: comment.fromUserType,
         hasPurchased: comment.hasPurchased
       }))
    } else {
      receivedComments.value = []
    }
  } catch (error) {
    console.error('Failed to load received comments:', error)
    receivedComments.value = []
  } finally {
    loading.value = false
  }
}

// 删除评论
const deleteComment = async (commentId) => {
  if (!currentUser.value?.id) return
  
  if (!confirm('Are you sure you want to delete this comment?')) {
    return
  }
  
  try {
    const response = await commentApi.deleteComment(commentId, currentUser.value.id)
    if (response && response.code === 0) {
      // 重新加载评论列表
      await loadGivenComments()
      alert('Comment deleted successfully!')
    } else {
      alert(response?.message || 'Failed to delete comment')
    }
  } catch (error) {
    console.error('Failed to delete comment:', error)
    alert('Failed to delete comment. Please try again.')
  }
}

// 设置评论标签
const setCommentTab = async (tab) => {
  commentTab.value = tab
  if (tab === 'given') {
    await loadGivenComments()
  } else if (tab === 'received') {
    await loadReceivedComments()
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown Date'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid Date'
  
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const day = days[date.getDay()]
  const dayNum = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  
  return `${day} ${dayNum} ${month} ${year}`
}

const goBack = () => {
  router.back()
}

// 页面加载时获取发出的评论
onMounted(async () => {
  await loadGivenComments()
})
</script>

<style scoped>
.organizer-comment-page {
  min-height: 100vh;
  background-color: #fafafa;
}

.organizer-comment-main {
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-header {
  position: relative;
  height: 3rem;
  margin-bottom: 2rem;
}

.back-button {
  position: absolute;
  left: 0;
  top: 0;
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

.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Comment Tabs */
.comment-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  background: none;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #374151;
}

.tab-button.active {
  color: #a85a9e;
  border-bottom-color: #a85a9e;
}

/* Comments Section */
.comments-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading-state,
.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 1rem;
}

.loading-state p,
.empty-state p {
  margin: 0;
}

.comments-list {
  padding: 1rem;
}

.comment-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background-color: #f9fafb;
}

.comment-item:last-child {
  margin-bottom: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.comment-info {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.comment-id {
  font-weight: 500;
}

.comment-content {
  margin-bottom: 1rem;
}

.comment-text {
  font-size: 1rem;
  color: #374151;
  margin-bottom: 0.5rem;
  line-height: 1.5;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.comment-target,
.comment-author {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
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

.comment-actions {
  display: flex;
  gap: 0.5rem;
}

.delete-comment-button,
.reply-comment-button {
  background-color: #f4d4a3;
  color: #8B4513;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-comment-button:hover,
.reply-comment-button:hover {
  background-color: #e6c893;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .comment-tabs {
    flex-direction: column;
    gap: 0;
  }
  
  .tab-button {
    border-bottom: 1px solid #e5e7eb;
    border-radius: 0;
  }
  
  .tab-button.active {
    border-bottom-color: #2563eb;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .comment-info {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .comment-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 