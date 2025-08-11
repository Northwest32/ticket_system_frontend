<template>
  <div class="buyer-home" @activated="onPageActivated">
    <Header />
    
    <main class="buyer-main">
      <!-- 用户信息区域 -->
      <section class="user-profile-section">
        <div class="container">
          <div class="user-profile">
            <div class="user-avatar">
              <div 
                class="avatar-placeholder"
                :style="currentUser?.avatarUrl ? { backgroundImage: `url(${getAvatarUrl(currentUser.avatarUrl)})` } : {}"
              >
                <span v-if="!currentUser?.avatarUrl" class="avatar-text">{{ userInitials }}</span>
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
            <h1 class="user-name">{{ currentUser?.name || 'User Name' }}</h1>
          </div>
        </div>
      </section>

      <!-- 功能按钮区域 -->
      <section class="action-buttons-section">
        <div class="container">
          <div class="action-buttons">
            <button 
              v-if="canFollow"
              class="action-button" 
              :class="{ active: activeTab === 'following' }"
              @click="setActiveTab('following')"
            >
              Following
            </button>
            <button 
              v-if="canBookmark"
              class="action-button" 
              :class="{ active: activeTab === 'bookmark' }"
              @click="setActiveTab('bookmark')"
            >
              Bookmark
            </button>
            <button 
              class="action-button" 
              :class="{ active: activeTab === 'orders' }"
              @click="setActiveTab('orders')"
            >
              Orders
            </button>
            <button 
              class="action-button" 
              :class="{ active: activeTab === 'comments' }"
              @click="setActiveTab('comments')"
            >
              Comments
            </button>
          </div>
        </div>
      </section>

      <!-- 内容区域 -->
      <section class="content-section">
        <div class="container">
          <!-- Events 内容 -->
          <div v-if="activeTab === 'events'" class="events-content">
            <h2 class="content-title">My Events</h2>
            <div class="events-list">
              <div 
                v-for="event in userEvents" 
                :key="event.id" 
                class="event-item"
              >
                <div class="event-info">
                  <h3 class="event-title">{{ event.title }}</h3>
                  <p class="event-date">{{ formatDate(event.date) }}</p>
                  <p class="event-venue">{{ event.venue }}</p>
                </div>
                <div class="event-actions">
                  <button 
                    class="order-details-button"
                    @click="viewOrderDetails(event.orderId)"
                  >
                    Order Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Following 内容 -->
          <div v-if="activeTab === 'following'" class="following-content">
            <h2 class="content-title">Following Organizers</h2>
            <div class="organizers-list">
              <div 
                v-for="organizer in followingOrganizers" 
                :key="organizer.id" 
                class="organizer-item"
              >
                <div class="organizer-info" @click="viewOrganizerProfile(organizer.organizerId)">
                  <div class="organizer-avatar">
                    <span class="organizer-initial">{{ organizer.name.charAt(0) }}</span>
                  </div>
                  <div class="organizer-details">
                    <h3 class="organizer-name">{{ organizer.name }}</h3>
                    <p class="organizer-events">{{ organizer.eventCount }} events</p>
                  </div>
                </div>
                <button 
                  class="unfollow-button"
                  @click.stop="unfollowOrganizer(organizer.organizerId)"
                >
                  Unfollow
                </button>
              </div>
            </div>
          </div>

          <!-- Bookmark 内容 -->
          <div v-if="activeTab === 'bookmark'" class="bookmark-content">
            <h2 class="content-title">Bookmarked Events</h2>
            <div class="bookmarked-events-list">
              <div 
                v-for="event in bookmarkedEvents" 
                :key="event.id" 
                class="bookmarked-event-item"
              >
                <div class="event-info">
                  <h3 class="event-title">{{ event.title }}</h3>
                  <p class="event-date">{{ formatDate(event.date) }}</p>
                  <p class="event-venue">{{ event.venue }}</p>
                </div>
                <div class="event-actions">
                  <button class="view-event-button" @click="viewBookmarkedEvent(event.id)">View Event</button>
                  <button class="remove-bookmark-button" @click="removeBookmark(event.id)">Remove</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Orders 内容 -->
          <div v-if="activeTab === 'orders'" class="orders-content">
            <h2 class="content-title">My Orders</h2>
            <div class="orders-list">
              <div 
                v-for="order in userOrders" 
                :key="order.id" 
                class="order-item"
              >
                <div class="order-info">
                  <div class="order-status-section">
                    <span class="order-status" :class="order.status">{{ order.status }}</span>
                  </div>
                  <div class="order-header">
                    <h3 class="event-title">{{ order.eventTitle }}</h3>
                  </div>
                  <div class="order-details">
                    <p class="order-date">{{ formatDate(order.orderDate) }}</p>
                    <p class="order-venue">{{ order.venue }}</p>
                    <p class="order-organizer">by {{ order.organizer }}</p>
                    <p class="order-quantity">Quantity: {{ order.quantity }} tickets</p>
                    <p class="order-total">Total: ${{ order.totalAmount }}</p>
                  </div>
                </div>
                <div class="order-actions">
                  <button 
                    class="order-details-button"
                    @click="viewOrderDetails(order.orderId)"
                  >
                    Order Details
                  </button>
                  <button 
                    class="view-event-button"
                    @click="viewEvent(order.eventId)"
                  >
                    View Event
                  </button>
                  <button 
                    v-if="(order.status === 'upcoming' || order.status === 'paid') && !order.refundStatus"
                    class="refund-request-button"
                    @click="requestRefund(order.orderId)"
                  >
                    Request Refund
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments 内容 -->
          <div v-if="activeTab === 'comments'" class="comments-content">
            <h2 class="content-title">Comment</h2>
            
            <!-- Given/Received 切换按钮 -->
            <div class="comment-tabs">
              <button 
                class="comment-tab" 
                :class="{ active: commentTab === 'given' }"
                @click="setCommentTab('given')"
              >
                Given
              </button>
              <button 
                class="comment-tab" 
                :class="{ active: commentTab === 'received' }"
                @click="setCommentTab('received')"
              >
                Received
              </button>
            </div>
            
            <!-- Loading State -->
            <div v-if="commentLoading" class="loading-state">
              <p>Loading comments...</p>
            </div>
            
            <!-- Given Comments -->
            <div v-if="commentTab === 'given'" class="given-comments">
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
                    <p class="comment-author">From: {{ comment.author }}</p>
                  </div>
                  <div class="comment-actions">
                    <button class="reply-comment-button">Reply</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { canFollowOrganizers, canBookmarkEvents } from '../utils/permissions'
import { userAvatarApi, orderApi, refundApi, followApi, eventApi, bookmarkApi, commentApi } from '../services/api'
import Header from '../components/Header.vue'

const router = useRouter()
const { currentUser } = useAuth()

const activeTab = ref('orders')
const commentTab = ref('given')
const avatarInput = ref(null)

// 权限检查
const canFollow = computed(() => {
  return canFollowOrganizers(currentUser.value?.userType)
})

const canBookmark = computed(() => {
  return canBookmarkEvents(currentUser.value?.userType)
})



// 用户头像首字母
const userInitials = computed(() => {
  if (!currentUser.value?.name) return 'U'
  return currentUser.value.name.split(' ').map(n => n[0]).join('').toUpperCase()
})

// 模拟用户事件数据
const userEvents = ref([
  {
    id: 1,
    title: 'ABBA Voyage - Wednesday 23rd July 2025',
    date: '2025-07-23T19:45:00',
    venue: 'ABBA Arena, London',
    orderId: 'ORD001'
  },
  {
    id: 2,
    title: 'Tech Conference 2025',
    date: '2025-07-25T09:00:00',
    venue: 'Convention Center, London',
    orderId: 'ORD002'
  },
  {
    id: 3,
    title: 'Comedy Night with Top Comedians',
    date: '2025-07-24T20:30:00',
    venue: 'Comedy Club, London',
    orderId: 'ORD003'
  }
])

// 关注的组织者数据
const followingOrganizers = ref([])

// 收藏的事件数据
const bookmarkedEvents = ref([])

// 用户订单数据
const userOrders = ref([])

// 评论数据
const givenComments = ref([])
const receivedComments = ref([])
const commentLoading = ref(false)

// 设置活动标签
const setActiveTab = async (tab) => {
  // 检查权限
  if (tab === 'following' && !canFollow.value) {
    alert('Organizers cannot follow other organizers. Please switch to buyer account.')
    return
  }
  
  if (tab === 'bookmark' && !canBookmark.value) {
    alert('Organizers cannot bookmark events. Please switch to buyer account.')
    return
  }
  
  activeTab.value = tab
  
  // 如果切换到comments标签，自动加载given评论
  if (tab === 'comments') {
    commentTab.value = 'given'
    await loadGivenComments()
  }
}

// 设置评论标签
const setCommentTab = async (tab) => {
  commentTab.value = tab
  // 只在切换到received时加载，given在进入comments标签时已经加载过了
  if (tab === 'received') {
    await loadReceivedComments()
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return 'Date TBD'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid Date'
  
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const day = days[date.getDay()]
  const dayNum = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${day} ${dayNum} ${month} ${year} - ${hours}:${minutes}`
}

// 查看订单详情
const viewOrderDetails = (orderId) => {
  console.log('🔍 Viewing order details for:', orderId)
  router.push(`/order-details/${orderId}`)
}

// 查看活动详情
const viewEvent = (eventId) => {
  console.log('🔍 Viewing event details for eventId:', eventId)
  router.push(`/event/${eventId}`)
}

// 请求退款
const requestRefund = (orderId) => {
  console.log('Requesting refund for order:', orderId)
  router.push(`/refund-request/${orderId}`)
}

// 页面激活时重新加载数据
const onPageActivated = () => {
  loadRefundStatus()
  loadBookmarkedEvents()
}

onMounted(async () => {
  // 检查用户是否已登录
  if (!currentUser.value) {
    router.push('/login')
  }
  
  // 如果是组织者，默认显示orders tab（因为不能follow或bookmark）
  if (!canFollow.value && !canBookmark.value) {
    activeTab.value = 'orders'
  }
  
  // 加载用户订单数据
  await loadUserOrders()
  
  // 加载关注列表
  await loadFollowingOrganizers()
  
  // 加载收藏列表
  await loadBookmarkedEvents()
  
  // 加载退款状态
  await loadRefundStatus()
})

// 加载用户订单数据
const loadUserOrders = async () => {
  try {
    console.log('🔍 Loading user orders...')
    const response = await orderApi.getMyOrders()
    
    if (response && response.code === 0 && response.data) {
      // 转换后端订单数据格式为前端需要的格式
      const ordersWithOrganizers = await Promise.all(
        response.data.map(async (order) => {
          let organizer = 'Event Organizer' // 默认值
          
          // 通过事件ID获取组织者信息
          if (order.eventId) {
            try {
              const eventResponse = await eventApi.getEventById(order.eventId)
              if (eventResponse && eventResponse.code === 0 && eventResponse.data) {
                const event = eventResponse.data
                organizer = event.organizerName || event.organizerUsername || 'Event Organizer'
              }
            } catch (error) {
              console.error(`Failed to load event details for event ${order.eventId}:`, error)
              // 如果获取事件详情失败，保持默认值
            }
          }
          
          return {
            id: order.id,
            eventId: order.eventId,
            eventTitle: order.eventTitle, // 后端直接返回真实事件标题
            orderDate: order.createTime,
            venue: order.venue, // 后端直接返回真实场地信息
            organizer: organizer, // 通过事件ID获取的组织者信息
            quantity: order.quantity,
            totalAmount: order.totalAmount, // 后端直接返回计算好的总金额
            orderId: `ORD${order.id.toString().padStart(3, '0')}`, // 生成订单ID格式
            status: order.status?.toLowerCase() || 'unknown',
            refundStatus: order.refundStatus || null
          }
        })
      )
      
      userOrders.value = ordersWithOrganizers
      console.log('🔍 User orders loaded:', userOrders.value)
    } else {
      console.error('Failed to load user orders:', response)
      userOrders.value = []
    }
  } catch (error) {
    console.error('Error loading user orders:', error)
    userOrders.value = []
  }
}

// 头像编辑功能
const editAvatar = () => {
  avatarInput.value.click()
}

const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }
  
  // 验证文件大小（限制为5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should be less than 5MB')
    return
  }
  
  try {
    // 直接调用API上传文件
    const response = await userAvatarApi.updateAvatar(file)
    
    if (response.code === 0) {
      // 使用后端返回的URL
      const avatarUrl = response.data
      
      // 更新本地用户信息
      if (currentUser.value) {
        currentUser.value.avatarUrl = avatarUrl
        
        // 更新localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        userInfo.avatarUrl = avatarUrl
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      }
      
      // 刷新用户信息，确保所有页面同步
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
  
  // 清空input
  event.target.value = ''
}

// 获取头像URL
const getAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return ''
  
  // 如果是base64格式，直接返回
  if (avatarUrl.startsWith('data:')) {
    return avatarUrl
  }
  
  // 如果是相对路径，添加后端基础URL
  if (avatarUrl.startsWith('/')) {
    return 'http://localhost:8080' + avatarUrl
  }
  
  return avatarUrl
}

// 加载关注列表
const loadFollowingOrganizers = async () => {
  try {
    console.log('🔍 Loading following organizers...')
    const response = await followApi.getMyFollows()
    
    if (response && response.code === 0 && response.data) {
      followingOrganizers.value = response.data.map(follow => ({
        id: follow.id,
        organizerId: follow.organizerId,
        name: follow.organizerName || `Organizer ${follow.organizerId}`,
        eventCount: follow.organizerEventCount || 0
      }))
      console.log('🔍 Following organizers loaded:', followingOrganizers.value)
    } else {
      console.error('Failed to load following organizers:', response)
      followingOrganizers.value = []
    }
  } catch (error) {
    console.error('Error loading following organizers:', error)
    followingOrganizers.value = []
  }
}

// 取消关注组织者
const unfollowOrganizer = async (organizerId) => {
  try {
    console.log('🔍 Unfollowing organizer:', organizerId)
    const response = await followApi.unfollowOrganizer(organizerId)
    
    if (response && response.code === 0) {
      // 从列表中移除
      followingOrganizers.value = followingOrganizers.value.filter(
        organizer => organizer.organizerId !== organizerId
      )
      alert('Successfully unfollowed organizer')
    } else {
      alert(response?.message || 'Failed to unfollow organizer')
    }
  } catch (error) {
    console.error('Error unfollowing organizer:', error)
    alert('Failed to unfollow organizer. Please try again.')
  }
}

// 加载收藏列表
const loadBookmarkedEvents = async () => {
  try {
    console.log('🔍 Loading bookmarked events...')
    const response = await bookmarkApi.getMyBookmarks()
    
    if (response && response.code === 0 && response.data) {
      // 直接使用后端返回的事件详情
      bookmarkedEvents.value = response.data.map(bookmark => ({
        id: bookmark.eventId,
        title: bookmark.eventTitle || `Event ${bookmark.eventId}`,
        date: bookmark.eventDate,
        venue: bookmark.eventLocation || 'TBD',
        organizer: bookmark.organizerName || bookmark.organizerUsername || 'Event Organizer'
      }))
      
      console.log('🔍 Bookmarked events loaded:', bookmarkedEvents.value)
    } else {
      console.error('Failed to load bookmarked events:', response)
      bookmarkedEvents.value = []
    }
  } catch (error) {
    console.error('Error loading bookmarked events:', error)
    bookmarkedEvents.value = []
  }
}

// 移除收藏
const removeBookmark = async (eventId) => {
  try {
    console.log('🔍 Removing bookmark for event:', eventId)
    const response = await bookmarkApi.removeBookmark(eventId)
    
    if (response && response.code === 0) {
      // 从列表中移除
      bookmarkedEvents.value = bookmarkedEvents.value.filter(
        event => event.id !== eventId
      )
      alert('Bookmark removed successfully')
    } else {
      alert(response?.message || 'Failed to remove bookmark')
    }
  } catch (error) {
    console.error('Error removing bookmark:', error)
    alert('Failed to remove bookmark. Please try again.')
  }
}

// 查看事件详情
const viewBookmarkedEvent = (eventId) => {
  console.log('🔍 Viewing bookmarked event details for eventId:', eventId)
  router.push(`/event-details/${eventId}`)
}

// 查看组织者主页
const viewOrganizerProfile = (organizerId) => {
  console.log('🔍 Viewing organizer profile for organizerId:', organizerId)
  router.push(`/organizer/${organizerId}`)
}

// 加载发出的评论
const loadGivenComments = async () => {
  if (!currentUser.value?.id) return
  
  try {
    commentLoading.value = true
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
    commentLoading.value = false
  }
}

// 加载收到的评论
const loadReceivedComments = async () => {
  if (!currentUser.value?.id) return
  
  try {
    commentLoading.value = true
    const response = await commentApi.getReceivedComments(currentUser.value.id)
    if (response && response.code === 0 && response.data) {
      receivedComments.value = response.data.map(comment => ({
        id: comment.id,
        date: comment.createdAt,
        text: comment.content,
        author: comment.fromUserName || `User ID: ${comment.fromUserId}`
      }))
    } else {
      receivedComments.value = []
    }
  } catch (error) {
    console.error('Failed to load received comments:', error)
    receivedComments.value = []
  } finally {
    commentLoading.value = false
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

// 加载退款状态
const loadRefundStatus = async () => {
  try {
    console.log('🔍 Loading refund status from API...')
    
    // 从API获取退款申请列表
    const response = await refundApi.getMyRefundRequests()
    
    if (response && response.code === 0 && response.data) {
      const refundRequests = response.data
      console.log('🔍 Refund requests loaded from API:', refundRequests)
      
      // 更新订单的退款状态
      userOrders.value.forEach(order => {
        // 从orderId中提取数字ID
        const numericOrderId = parseInt(order.orderId.replace('ORD', ''))
        
        // 查找对应的退款申请
        const refundRequest = refundRequests.find(refund => refund.orderId === numericOrderId)
        if (refundRequest) {
          order.refundStatus = refundRequest.status
          console.log(`🔍 Updated refund status for order ${order.orderId}: ${refundRequest.status}`)
        }
      })
    } else {
      console.error('Failed to load refund status from API:', response)
      
      // 如果API调用失败，回退到localStorage
      const localRefundRequests = JSON.parse(localStorage.getItem('refundRequests') || '{}')
      userOrders.value.forEach(order => {
        if (localRefundRequests[order.orderId]) {
          order.refundStatus = localRefundRequests[order.orderId].status
        }
      })
      console.log('🔍 Fallback to localStorage refund status:', localRefundRequests)
    }
  } catch (error) {
    console.error('Error loading refund status from API:', error)
    
    // 如果API调用失败，回退到localStorage
    try {
      const localRefundRequests = JSON.parse(localStorage.getItem('refundRequests') || '{}')
      userOrders.value.forEach(order => {
        if (localRefundRequests[order.orderId]) {
          order.refundStatus = localRefundRequests[order.orderId].status
        }
      })
      console.log('🔍 Fallback to localStorage refund status:', localRefundRequests)
    } catch (localError) {
      console.error('Error loading refund status from localStorage:', localError)
    }
  }
}
</script>

<style scoped>
.buyer-home {
  min-height: 100vh;
  background-color: #fafafa;
}

.buyer-main {
  flex: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 用户信息区域 */
.user-profile-section {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 2rem 0;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.user-avatar {
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.edit-avatar-button {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #f4d4a3;
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
  background-color: #e6c893;
  transform: scale(1.1);
}

.avatar-input {
  display: none;
}

.user-name {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* 功能按钮区域 */
.action-buttons-section {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.action-button {
  background-color: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  border-color: #f4d4a3;
  color: #8B4513;
}

.action-button.active {
  background-color: #f4d4a3;
  color: #8B4513;
  border-color: #f4d4a3;
}

/* 内容区域 */
.content-section {
  padding: 2rem 0;
}

.content-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

/* Events 内容 */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.event-info {
  flex: 1;
}

.event-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.event-date {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.event-venue {
  font-size: 0.875rem;
  color: #6b7280;
}

.order-details-button {
  background-color: #f4d4a3;
  color: #8B4513;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.order-details-button:hover {
  background-color: #e6c893;
}

/* Following 内容 */
.organizers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.organizer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.organizer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 8px;
}

.organizer-info:hover {
  background-color: #f3f4f6;
  transform: translateY(-1px);
}

.organizer-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.organizer-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.organizer-events {
  font-size: 0.875rem;
  color: #6b7280;
}

.unfollow-button {
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

.unfollow-button:hover {
  background-color: #e6c893;
}

/* Bookmark 内容 */
.bookmarked-events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bookmarked-event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
}

.view-event-button {
  background-color: #f4d4a3;
  color: #8B4513;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-event-button:hover {
  background-color: #e6c893;
}

.remove-bookmark-button {
  background-color: #f4d4a3;
  color: #8B4513;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-bookmark-button:hover {
  background-color: #e6c893;
}

/* Comments 内容 */
.comment-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.comment-tab {
  background-color: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.comment-tab:hover {
  border-color: #f4d4a3;
  color: #8B4513;
}

.comment-tab.active {
  background-color: #f4d4a3;
  color: #8B4513;
  border-color: #f4d4a3;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.comment-header {
  margin-bottom: 0.75rem;
}

.comment-info {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.comment-id,
.comment-date {
  font-weight: 500;
}

.comment-content {
  margin-bottom: 1rem;
}

.comment-text {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.comment-target,
.comment-author {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
}

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

.reply-comment-button:hover {
  background-color: #e6c893;
}

.delete-comment-button {
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

.delete-comment-button:hover {
  background-color: #e6c893;
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

/* Orders 内容 */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.order-info {
  flex: 1;
}

.order-status-section {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: flex-start;
}

.order-header {
  margin-bottom: 0.75rem;
}

.event-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.order-status.upcoming {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.order-status.paid {
  background-color: #d1fae5;
  color: #065f46;
}

.order-status.completed {
  background-color: #d1fae5;
  color: #065f46;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-date,
.order-venue,
.order-organizer,
.order-quantity,
.order-total {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.order-organizer {
  color:#C26CB5;
  font-weight: 500;
}

.order-total {
  font-weight: 600;
  color: #059669;
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 120px;
}

.refund-request-button {
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

.refund-request-button:hover {
  background-color: #e6c893;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .event-item,
  .organizer-item,
  .bookmarked-event-item,
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .event-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style> 