<template>
  <div class="buyer-home" @activated="onPageActivated">
    <Header />
    
    <main class="buyer-main">
      <!-- user info section -->
      <section class="user-profile-section">
        <div class="container">
          <div class="user-profile">
            <div class="user-avatar">
              <div 
                class="avatar-placeholder"
                :style="currentUser?.avatarUrl ? { backgroundImage: `url(${getAvatarUrl(currentUser.avatarUrl)})` } : {}"
              >
                <span v-if="!currentUser?.avatarUrl" class="avatar-text">{{ getUserInitials() }}</span>
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

      <!-- action buttons section -->
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

      <!-- content section -->
      <section class="content-section">
        <div class="container">
          <!-- Events content -->
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

          <!-- Following content -->
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

          <!-- Bookmark content -->
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

          <!-- Orders content -->
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

          <!-- Comments content -->
          <div v-if="activeTab === 'comments'" class="comments-content">
            <h2 class="content-title">Comment</h2>
            
            <!-- Given/Received switch buttons -->
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
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { canFollowOrganizers, canBookmarkEvents } from '../utils/permissions'
import { userApi, orderApi, refundApi, followApi, eventApi, bookmarkApi, commentApi } from '../services/api'
import { getAvatarUrl, getAvatarInitials } from '../utils/avatarUtils'
import Header from '../components/Header.vue'

const router = useRouter()
const { currentUser } = useAuth()

// 把各种可能的 id / parentId 统一成 number，避免 number/object 不匹配
const normalizeId = (v) => {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);

  // 常见后端返回：{id: 29} / {value: 29} / Long {low, high} / 带 toNumber()
  if (typeof v === 'object') {
    if (v.id != null) return Number(v.id);
    if (v.value != null) return Number(v.value);
    if (typeof v.low === 'number') return Number(v.low);           // long.js/protobuf
    if (typeof v.toNumber === 'function') return Number(v.toNumber());
    if (typeof v.toString === 'function' && v.toString !== Object.prototype.toString) {
      const n = Number(v.toString());
      if (!Number.isNaN(n)) return n;
    }
  }
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const activeTab = ref('orders')
const commentTab = ref('given')
const avatarInput = ref(null)

// permission check
const canFollow = computed(() => {
  return canFollowOrganizers(currentUser.value?.userType)
})

const canBookmark = computed(() => {
  return canBookmarkEvents(currentUser.value?.userType)
})



// user avatar initials
const userInitials = computed(() => {
  if (!currentUser.value?.name) return 'U'
  return currentUser.value.name.split(' ').map(n => n[0]).join('').toUpperCase()
})

// mock user events data
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

// following organizers data
const followingOrganizers = ref([])

// bookmarked events data
const bookmarkedEvents = ref([])

// user orders data
const userOrders = ref([])

// comments data
const givenComments = ref([])
const receivedComments = ref([])
const commentLoading = ref(false)
const replyingTo = ref(null)
const replyContent = ref('')
const isSubmittingReply = ref(false)

// set active tab
const setActiveTab = async (tab) => {
  // check permission
  if (tab === 'following' && !canFollow.value) {
    alert('Organizers cannot follow other organizers. Please switch to buyer account.')
    return
  }
  
  if (tab === 'bookmark' && !canBookmark.value) {
    alert('Organizers cannot bookmark events. Please switch to buyer account.')
    return
  }
  
  activeTab.value = tab
  
  // if switch to comments tab, automatically load given comments
  if (tab === 'comments') {
    commentTab.value = 'given'
    await loadGivenComments()
  }
}

// set comment tab
const setCommentTab = async (tab) => {
  commentTab.value = tab
  // only load when switch to received, given is loaded when entering comments tab
  if (tab === 'received') {
    await loadReceivedComments()
  }
}

// format date
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
  
  return `${day} ${dayNum} ${month} ${year}`
}

// view order details
const viewOrderDetails = (orderId) => {
  console.log('🔍 Viewing order details for:', orderId)
  router.push(`/order-details/${orderId}`)
}

// view event details
const viewEvent = (eventId) => {
  console.log('🔍 Viewing event details for eventId:', eventId)
  router.push(`/event/${eventId}`)
}

// request refund
const requestRefund = (orderId) => {
  console.log('Requesting refund for order:', orderId)
  router.push(`/refund-request/${orderId}`)
}

// reload data when page is activated
const onPageActivated = () => {
  loadRefundStatus()
  loadBookmarkedEvents()
}

onMounted(async () => {
  // check if user is logged in - 给一点时间让状态加载
  if (!currentUser.value) {
    // 等待一小段时间，让登录状态有机会加载
    await new Promise(resolve => setTimeout(resolve, 100))
    if (!currentUser.value) {
      router.push('/login')
      return
    }
  }
  
// if organizer, default to orders tab (because cannot follow or bookmark)
  if (!canFollow.value && !canBookmark.value) {
    activeTab.value = 'orders'
  }
  
  // load user orders data
  await loadUserOrders()
  
  // load following organizers data
  await loadFollowingOrganizers()
  
  // load bookmarked events data
  await loadBookmarkedEvents()
  
  // load refund status
  await loadRefundStatus()
  
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

// load user orders data
const loadUserOrders = async () => {
  try {
    console.log('🔍 Loading user orders...')
    const response = await orderApi.getMyOrders()
    
    if (response && response.code === 0 && response.data) {
      // convert backend order data format to frontend needed format
      const ordersWithOrganizers = await Promise.all(
        response.data.map(async (order) => {
          let organizer = 'Event Organizer' // default value
          
          // get organizer info from event ID
          if (order.eventId) {
            try {
              const eventResponse = await eventApi.getEventById(order.eventId)
              if (eventResponse && eventResponse.code === 0 && eventResponse.data) {
                const event = eventResponse.data
                organizer = event.organizerName || event.organizerUsername || 'Event Organizer'
              }
            } catch (error) {
              console.error(`Failed to load event details for event ${order.eventId}:`, error)
              // if failed to load event details, keep default value
            }
          }
          
          return {
            id: order.id,
            eventId: order.eventId,
            eventTitle: order.eventTitle, // backend directly returns real event title
            orderDate: order.createTime,
            venue: order.venue, // backend directly returns real venue info
            organizer: organizer, // get organizer info from event ID
            quantity: order.quantity,
            totalAmount: order.totalAmount, // backend directly returns calculated total amount
            orderId: `ORD${order.id.toString().padStart(3, '0')}`, // generate order ID format
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

// get user initials
const getUserInitials = () => {
  const name = currentUser.value?.name || currentUser.value?.username || 'User'
  return getAvatarInitials(name)
}

// load following organizers data
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

// unfollow organizer
const unfollowOrganizer = async (organizerId) => {
  try {
    console.log('🔍 Unfollowing organizer:', organizerId)
    const response = await followApi.unfollowOrganizer(organizerId)
    
    if (response && response.code === 0) {
      // remove from list
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

// load bookmarked events
const loadBookmarkedEvents = async () => {
  try {
    console.log('🔍 Loading bookmarked events...')
    const response = await bookmarkApi.getMyBookmarks()
    
    if (response && response.code === 0 && response.data) {
      // directly use event details returned from backend
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

// remove bookmark
const removeBookmark = async (eventId) => {
  try {
    console.log('🔍 Removing bookmark for event:', eventId)
    const response = await bookmarkApi.removeBookmark(eventId)
    
    if (response && response.code === 0) {
      // remove from list
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

// view event details
const viewBookmarkedEvent = (eventId) => {
  console.log('🔍 Viewing bookmarked event details for eventId:', eventId)
  router.push(`/event-details/${eventId}`)
}

// view organizer profile
const viewOrganizerProfile = (organizerId) => {
  console.log('🔍 Viewing organizer profile for organizerId:', organizerId)
  router.push(`/organizer/${organizerId}`)
}

// load given comments
const loadGivenComments = async () => {
  if (!currentUser.value?.id) return
  
  try {
    commentLoading.value = true
    const response = await commentApi.getGivenComments(currentUser.value.id)
    if (response && response.code === 0 && response.data) {
      const list = response.data

      // 去重（保留首个）
      const unique = list.filter((c, i, self) => i === self.findIndex(x => String(x.id) === String(c.id)))

      // 统一 id / parentId
      const rows = unique.map(c => ({
        ...c,
        _id: normalizeId(c.id),
        _pid: normalizeId(c.parentCommentId),
      }));

      // 顶层 / 回复映射
      const top = rows.filter(c => c._pid == null);
      const byParent = new Map();
      rows.forEach(c => {
        if (c._pid != null) {
          if (!byParent.has(c._pid)) byParent.set(c._pid, []);
          byParent.get(c._pid).push(c);
        }
      });

      // 组装（注意返回新对象，保持响应式）
      givenComments.value = top
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map(c => ({
          id: c._id,
          date: c.createdAt,
          text: c.content,
          target: c.toEventId ? `Event ID: ${c.toEventId}` : 
                  c.toOrganizerId ? `Organizer ID: ${c.toOrganizerId}` : 'Unknown Target',
          replies: (byParent.get(c._id) || [])
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map(reply => ({
              id: reply._id,
              date: reply.createdAt,
              text: reply.content,
              fromUserName: reply.fromUserName
            }))
        }))

      // 调试：确认规范化是否成功
      console.table(unique.map(c => ({
        id: c.id, _id: c._id, pid: c.parentCommentId, _pid: c._pid
      })))
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

// load received comments
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

// delete comment
const deleteComment = async (commentId) => {
  if (!currentUser.value?.id) return
  
  if (!confirm('Are you sure you want to delete this comment?')) {
    return
  }
  
  try {
    const response = await commentApi.deleteComment(commentId, currentUser.value.id)
    if (response && response.code === 0) {
      // reload comment list
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
  
  if (!isAuthenticated.value) {
    alert('Please login to reply to comments');
    return
  }
  
  replyingTo.value = commentId;
  replyContent.value = '';
  console.log('[BuyerHomeView] onReplyClick -> replyingTo =', replyingTo.value);
}

const submitReply = async (commentId) => {
  if (!replyContent.value.trim()) {
    alert('Please enter a reply message');
    return;
  }
  
  try {
    isSubmittingReply.value = true;
    console.log('[BuyerHomeView] Submitting reply to comment:', commentId);
    
    // 创建回复评论
    const commentData = {
      content: replyContent.value.trim(),
      fromUserId: Number(currentUser.value.id),
      toEventId: null, // null when replying to user comment
      toOrganizerId: null, // null when replying to user comment
      rating: null, // not set rating
      parentCommentId: Number(normalizeId(commentId)) // 关键：用规范化后的 ID
    }
    
    console.log('[BuyerHomeView] Reply comment data:', commentData)
    
    const response = await commentApi.createComment(commentData)
    
    if (response && response.code === 0) {
      console.log('[BuyerHomeView] Reply submitted successfully');
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
    console.error('[BuyerHomeView] Error submitting reply:', error);
    alert('Failed to submit reply. Please try again.');
  } finally {
    isSubmittingReply.value = false;
  }
}

const cancelReply = () => {
  replyingTo.value = null;
  replyContent.value = '';
  console.log('[BuyerHomeView] Reply cancelled');
}

// load refund status
const loadRefundStatus = async () => {
  try {
    console.log('🔍 Loading refund status from API...')
    
    // get refund request list from API
    const response = await refundApi.getMyRefundRequests()
    
    if (response && response.code === 0 && response.data) {
      const refundRequests = response.data
      console.log('🔍 Refund requests loaded from API:', refundRequests)
      
      // update order refund status
      userOrders.value.forEach(order => {
        // extract numeric ID from orderId
        const numericOrderId = parseInt(order.orderId.replace('ORD', ''))
        
        // find corresponding refund request
        const refundRequest = refundRequests.find(refund => refund.orderId === numericOrderId)
        if (refundRequest) {
          order.refundStatus = refundRequest.status
          console.log(`🔍 Updated refund status for order ${order.orderId}: ${refundRequest.status}`)
        }
      })
    } else {
      console.error('Failed to load refund status from API:', response)
      
      // if API call fails, fallback to localStorage
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
    
    // if API call fails, fallback to localStorage
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

/* User Profile Section */
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

/* Action Buttons Section */
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

/* Content Section */
.content-section {
  padding: 2rem 0;
}

.content-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

/* Events Content */
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

/* Following Content */
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

/* Bookmark Content */
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

/* Comments Content */
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
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
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

.reply-comment-btn:hover {
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

/* Orders Content */
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



/* Responsive Design */
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