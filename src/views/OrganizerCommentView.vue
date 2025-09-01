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
                  <button 
                    class="reply-comment-btn"
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
                        </span>
                        <span class="reply-date">{{ formatDate(reply.createdAt) }}</span>
                      </div>
                      <p class="reply-text">{{ reply.content }}</p>
                    </div>
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
const replyingTo = ref(null)
const replyContent = ref('')
const isSubmittingReply = ref(false)

// 加载发出的评论
const loadGivenComments = async () => {
  if (!currentUser.value?.id) return
  
  try {
    loading.value = true
    const response = await commentApi.getGivenComments(currentUser.value.id)
    if (response && response.code === 0 && response.data) {
      // 组织评论层级结构
      const topLevelComments = response.data.filter(comment => !comment.parentCommentId)
      const replyComments = response.data.filter(comment => comment.parentCommentId)
      
      // 将回复添加到对应的父评论下
      topLevelComments.forEach(comment => {
        comment.replies = replyComments.filter(reply => reply.parentCommentId === comment.id)
      })
      
      givenComments.value = topLevelComments.map(comment => ({
        id: comment.id,
        date: comment.createdAt,
        text: comment.content,
        target: comment.toEventId ? `Event ID: ${comment.toEventId}` : 
                comment.toOrganizerId ? `Organizer ID: ${comment.toOrganizerId}` : 'Unknown Target',
        replies: comment.replies || []
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

// 回复相关方法
const onReplyClick = (e, commentId) => {
  // 阻断同一元素上的其他监听器（关键）
  if (e && typeof e.stopImmediatePropagation === 'function') {
    e.stopImmediatePropagation();
  }
  
  replyingTo.value = commentId;
  replyContent.value = '';
  console.log('[OrganizerCommentView] onReplyClick -> replyingTo =', replyingTo.value);
}

const submitReply = async (commentId) => {
  if (!replyContent.value.trim()) {
    alert('Please enter a reply message');
    return;
  }
  
  try {
    isSubmittingReply.value = true;
    console.log('[OrganizerCommentView] Submitting reply to comment:', commentId);
    
    // 创建回复评论
    const commentData = {
      content: replyContent.value.trim(),
      fromUserId: currentUser.value.id,
      toEventId: null, // null when replying to organizer comment
      toOrganizerId: null, // null when replying to organizer comment
      rating: null, // not set rating
      parentCommentId: commentId // 设置父评论ID，表示这是回复
    }
    
    console.log('[OrganizerCommentView] Reply comment data:', commentData)
    
    const response = await commentApi.createComment(commentData)
    
    if (response && response.code === 0) {
      console.log('[OrganizerCommentView] Reply submitted successfully');
      // 重新加载评论列表
      if (commentTab.value === 'given') {
        await loadGivenComments();
      } else {
        await loadReceivedComments();
      }
      // 重置回复状态
      replyingTo.value = null;
      replyContent.value = '';
      alert('Reply submitted successfully!');
    } else {
      alert(response?.message || 'Failed to submit reply');
    }
  } catch (error) {
    console.error('[OrganizerCommentView] Error submitting reply:', error);
    alert('Failed to submit reply. Please try again.');
  } finally {
    isSubmittingReply.value = false;
  }
}

const cancelReply = () => {
  replyingTo.value = null;
  replyContent.value = '';
  console.log('[OrganizerCommentView] Reply cancelled');
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
.reply-comment-btn {
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
.reply-comment-btn:hover {
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

/* 回复输入框样式 */
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
  border-color: #f4d4a3;
  box-shadow: 0 0 0 3px rgba(244, 212, 163, 0.3);
}

.reply-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.submit-reply-btn {
  background-color: #f4d4a3;
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
  background-color: #e6c893;
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
</style> 