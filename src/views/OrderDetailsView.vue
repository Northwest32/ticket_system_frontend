<template>
  <div class="order-details-page">
    <Header />
    
    <main class="order-details-main">
      <div class="container">
        <!-- 返回按钮和标题 -->
        <div class="page-header">
          <button class="back-button" @click="goBack">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back
          </button>

        </div>
        <h1 class="page-title">Order Details</h1>
        <!-- 订单详情卡片 -->
        <div class="order-details-card">
          <div class="order-info">
            <div class="info-row">
              <span class="info-label">Order ID:</span>
              <span class="info-value">{{ orderDetails.orderId }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">{{ formatDate(orderDetails.date) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Qty:</span>
              <span class="info-value">{{ orderDetails.quantity }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Price:</span>
              <span class="info-value price">${{ orderDetails.totalPrice }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment:</span>
              <span class="info-value">{{ orderDetails.paymentMethod }}</span>
            </div>
          </div>

          <!-- 退款信息 -->
          <div class="refund-section">
            <div class="info-row">
              <span class="info-label">Refund:</span>
              <span class="info-value" :class="{ 'refunded': orderDetails.refundAmount > 0 }">
                {{ orderDetails.refundAmount > 0 ? `$${orderDetails.refundAmount}` : 'Not requested' }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Refund Status:</span>
              <span class="info-value status" :class="getStatusClass(orderDetails.refundStatus)">
                {{ orderDetails.refundStatus }}
              </span>
            </div>
          </div>

          <!-- 申请退款按钮 -->
          <div class="refund-action">
            <button 
              v-if="orderDetails.refundStatus === 'Not requested'"
              class="request-refund-button"
              @click="requestRefund"
            >
              Request Refund
            </button>
            <div v-else class="refund-info">
              <p class="refund-message">
                {{ getRefundMessage(orderDetails.refundStatus) }}
              </p>
            </div>
          </div>
        </div>

        <!-- 事件信息 -->
        <div class="event-info-card">
          <h2 class="card-title">Event Information</h2>
          <div class="event-details">
            <div class="event-image">
              <img :src="orderDetails.event.image" :alt="orderDetails.event.title" />
            </div>
            <div class="event-content">
              <h3 class="event-title">{{ orderDetails.event.title }}</h3>
              <p class="event-date">{{ orderDetails.event.date ? formatDate(orderDetails.event.date) : 'Date TBD' }}</p>
              <p class="event-venue">{{ orderDetails.event.venue }}</p>
              <p class="event-organizer">by {{ orderDetails.event.organizer }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderApi, eventApi } from '../services/api'
import Header from '../components/Header.vue'

const route = useRoute()
const router = useRouter()


// 模拟订单详情数据
const orderDetails = ref({
  orderId: 'ORD001',
  date: '2025-07-20T10:30:00',
  quantity: 2,
  totalPrice: 178.00,
  paymentMethod: 'Credit Card',
  refundAmount: 0,
  refundStatus: 'Not requested',
  event: {
    title: 'ABBA Voyage - Wednesday 23rd July 2025',
    date: '2025-07-23T19:45:00',
    venue: 'ABBA Arena, London, United Kingdom',
    organizer: 'ABBA Productions',
    image: 'https://via.placeholder.com/300x200/1f2937/ffffff?text=ABBA+Voyage'
  }
})

onMounted(async () => {
  // 根据路由参数获取订单ID
  const orderId = route.params.orderId
  if (orderId) {
    // 从API获取订单详情
    await loadOrderDetails(orderId)
  }
})

const loadOrderDetails = async (orderId) => {
  try {
    console.log('🔍 Loading order details for orderId:', orderId)
    
    // 从orderId中提取数字ID（去掉"ORD"前缀）
    const numericId = orderId.replace('ORD', '')
    
    const response = await orderApi.getOrderById(numericId)
    
    if (response && response.code === 0 && response.data) {
      const order = response.data
      
      // 转换后端数据格式为前端需要的格式
      orderDetails.value = {
        orderId: `ORD${order.id.toString().padStart(3, '0')}`,
        date: order.createTime,
        quantity: order.quantity,
        totalPrice: order.totalAmount,
        paymentMethod: 'Credit Card', // 默认支付方式
        refundAmount: 0, // 暂时设为0，后续可以从退款接口获取
        refundStatus: 'Not requested', // 暂时设为默认值，后续可以从退款接口获取
        event: {
          title: order.eventTitle || `Event ${order.eventId}`,
          date: null, // 暂时设为null，后续可以从事件接口获取
          venue: order.venue || 'TBD',
          organizer: 'Event Organizer', // 默认值，后续通过事件ID获取
          image: 'https://via.placeholder.com/300x200/1f2937/ffffff?text=Event' // 暂时使用占位图
        }
      }
      
      // 通过事件ID获取组织者信息
      if (order.eventId) {
        try {
          const eventResponse = await eventApi.getEventById(order.eventId)
          if (eventResponse && eventResponse.code === 0 && eventResponse.data) {
            const event = eventResponse.data
            orderDetails.value.event.organizer = event.organizerName || event.organizerUsername || 'Event Organizer'
            orderDetails.value.event.date = event.eventDate
            orderDetails.value.event.image = event.imageUrl || orderDetails.value.event.image
          }
        } catch (error) {
          console.error('Failed to load event details:', error)
          // 如果获取事件详情失败，保持默认值
        }
      }
      
      console.log('🔍 Order details loaded:', orderDetails.value)
      
      // 检查localStorage中是否有退款请求状态
      const refundRequests = JSON.parse(localStorage.getItem('refundRequests') || '{}')
      if (refundRequests[orderId]) {
        orderDetails.value.refundStatus = refundRequests[orderId].status
        console.log('Updated refund status from localStorage:', refundRequests[orderId].status)
      }
    } else {
      console.error('Failed to load order details:', response)
      alert('Failed to load order details. Please try again.')
    }
  } catch (error) {
    console.error('Error loading order details:', error)
    alert('Error loading order details. Please try again.')
  }
}

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

const getStatusClass = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'status-approved'
    case 'REQUESTED':
      return 'status-pending'
    case 'REJECTED':
      return 'status-rejected'
    default:
      return ''
  }
}

const getRefundMessage = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'Your refund has been approved and will be processed within 5-7 business days.'
    case 'REQUESTED':
      return 'Your refund request is being reviewed. You will receive an update within 3-5 business days.'
    case 'REJECTED':
      return 'Your refund request has been rejected. Please contact customer support for more information.'
    default:
      return ''
  }
}

const requestRefund = async () => {
  // 跳转到退款请求页面
  const orderId = route.params.orderId
  console.log('Redirecting to refund request page for order:', orderId)
  router.push(`/refund-request/${orderId}`)
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.order-details-page {
  min-height: 100vh;
  background-color: #fafafa;
}

.order-details-main {
  flex: 1;
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 页面头部 */
.page-header {
  /*display: flex;
  align-items: center;
  gap: 1rem;*/
  margin-bottom: 1rem;
}

/* .back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #f3f4f6;
  color: #374151;
} */

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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-button:hover {
  background-color: #F5F5F5;
  color: #3a1239;
}


.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 auto 2rem auto;
  text-align: center;
  max-width: 600px;
}




/* 订单详情卡片 */
.order-details-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
}

.order-info {
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

.info-value {
  font-size: 1rem;
  color: #1f2937;
}

.info-value.price {
  font-weight: 700;
  color: #059669;
  font-size: 1.125rem;
}

.info-value.refunded {
  color: #059669;
  font-weight: 600;
}

/* 退款信息 */
.refund-section {
  border-top: 2px solid #e5e7eb;
  padding-top: 1.5rem;
  margin-bottom: 2rem;
}

.status {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.status-approved {
  background-color: #d1fae5;
  color: #065f46;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

/* 退款操作 */
.refund-action {
  border-top: 2px solid #e5e7eb;
  padding-top: 1.5rem;
  text-align: center;
}

.request-refund-button {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.request-refund-button:hover:not(:disabled) {
  background-color: #dc2626;
}

.request-refund-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.refund-info {
  text-align: left;
}

.refund-message {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

/* 事件信息卡片 */
.event-info-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  border: 1px solid #e5e7eb;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.event-details {
  display: flex;
  gap: 1.5rem;
}

.event-image {
  flex-shrink: 0;
  width: 200px;
  height: 150px;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.event-content {
  flex: 1;
}

.event-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.event-date {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.event-venue {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.event-organizer {
  font-size: 0.875rem;
  color:#C26CB5;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .order-details-card,
  .event-info-card {
    padding: 1.5rem;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .event-details {
    flex-direction: column;
  }
  
  .event-image {
    width: 100%;
    height: 200px;
  }
}
</style> 