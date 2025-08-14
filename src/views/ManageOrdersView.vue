<template>
  <div class="manage-orders-page">
    <Header />
    
    <main class="manage-orders-main">
      <div class="container">
        <!-- Header Section -->
        <div class="page-header">
          <button class="back-button" @click="goBack">
            ← Back
          </button>
          <h1 class="page-title">Manage Orders</h1>
          <div class="event-info">
            <h2 class="event-title">{{ eventInfo.title }}</h2>
            <p class="event-date">{{ formatDate(eventInfo.eventDate) }}</p>
          </div>
        </div>
        
        <!-- Statistics Summary -->
        <div class="stats-summary">
          <div class="stat-item">
            <div class="stat-number">{{ totalOrders }}</div>
            <div class="stat-label">Total Orders</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${{ totalRevenue }}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ pendingRefunds }}</div>
            <div class="stat-label">Pending Refunds</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ completedOrders }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
        
        <!-- Filters and Search -->
        <div class="filters-section">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by customer name or order ID..."
              class="search-input"
            />
          </div>
          
          <div class="filter-buttons">
            <button 
              class="filter-button"
              :class="{ active: activeFilter === 'all' }"
              @click="setFilter('all')"
            >
              All Orders
            </button>
            <button 
              class="filter-button"
              :class="{ active: activeFilter === 'refund' }"
              @click="setFilter('refund')"
            >
              Refund Requests
            </button>
          </div>
        </div>
        
        <!-- Orders List -->
        <div class="orders-list">
          <div 
            v-for="order in filteredOrders" 
            :key="order.id" 
            class="order-item"
          >
            <div class="order-header">
              <div class="order-info">
                <h3 class="order-id">Order #{{ order.orderId }}</h3>
                <p class="customer-name">{{ order.customerName }}</p>
                <p class="order-date">{{ formatDate(order.orderDate) }}</p>
              </div>
              
              <div class="order-status">
                <span class="status-badge" :class="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </div>
            </div>
            
            <div class="order-details">
              <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">{{ order.quantity }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value price">${{ order.totalAmount }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">{{ order.paymentMethod }}</span>
              </div>
            </div>
            
            <!-- Refund Request Info -->
            <div v-if="order.refundRequest" class="refund-section">
              <div class="refund-header">
                <span class="refund-label">Refund Request</span>
                <span class="refund-status" :class="getRefundStatusClass(order.refundRequest.status)">
                  {{ order.refundRequest.status }}
                </span>
              </div>
              <p class="refund-reason">{{ order.refundRequest.reason }}</p>
              
              <!-- show organizer reply -->
              <div v-if="order.refundRequest.reply" class="refund-reply">
                <span class="reply-label">Organizer Reply:</span>
                <p class="reply-text">{{ order.refundRequest.reply }}</p>
              </div>
              
              <div class="refund-actions">
                <button 
                  v-if="order.refundRequest.status === 'REQUESTED'"
                  class="approve-button"
                  @click="approveRefund(order.id)"
                >
                  Approve Refund
                </button>
                <button 
                  v-if="order.refundRequest.status === 'REQUESTED'"
                  class="reject-button"
                  @click="rejectRefund(order.id)"
                >
                  Reject Refund
                </button>
              </div>
            </div>
            
            <!-- Order Actions 
            <div class="order-actions">
              <button class="action-button" @click="viewOrderDetails(order.id)">
                View Details
              </button>
              <button class="action-button" @click="contactCustomer(order.id)">
                Contact Customer
              </button>
            </div>-->
          </div>
          
          <!-- Empty State -->
          <div v-if="filteredOrders.length === 0" class="empty-orders">
            <p>No orders found matching your criteria.</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { orderApi, eventApi, refundApi } from '../services/api'
import Header from '../components/Header.vue'

const route = useRoute()
const router = useRouter()
const { currentUser } = useAuth()

const searchQuery = ref('')
const activeFilter = ref('all')

const eventInfo = ref({
  title: 'Summer Music Festival 2024',
  eventDate: '2024-07-15T19:00:00'
})

const orders = ref([])

onMounted(async () => {
  const eventId = route.params.id
  if (eventId) {
    await loadEventInfo(eventId)
    await loadOrders(eventId)
  }
})

const loadEventInfo = async (eventId) => {
  try {
    console.log('🔍 Loading event info for ID:', eventId)
    const response = await eventApi.getEventById(eventId)
    
    if (response && response.code === 0 && response.data) {
      eventInfo.value = {
        title: response.data.title,
        eventDate: response.data.eventDate
      }
      console.log('🔍 Event info loaded:', eventInfo.value)
    } else {
      console.error('Failed to load event info:', response)
      eventInfo.value = {
        title: 'Event Not Found',
        eventDate: null
      }
    }
  } catch (error) {
    console.error('Error loading event info:', error)
    eventInfo.value = {
      title: 'Error Loading Event',
      eventDate: null
    }
  }
}

const loadOrders = async (eventId) => {
  try {
    console.log('🔍 Loading orders for event ID:', eventId)
    const response = await orderApi.getOrdersByEventId(eventId)
    
    if (response && response.code === 0 && response.data) {
      // convert backend order data format to frontend needed format
      orders.value = response.data.map(order => ({
        id: order.id,
        orderId: `ORD${order.id.toString().padStart(3, '0')}`,
        customerName: order.customerName || `Customer ${order.id}`, // if no customer name, use default value
        orderDate: order.createTime,
        status: order.status || 'UNKNOWN',
        quantity: order.quantity,
        totalAmount: order.totalAmount || 0, // backend calculated total amount
        paymentMethod: order.paymentMethod || 'Credit Card', // default payment method
        refundRequest: order.refundRequest ? {
          id: order.refundRequest.id,
          status: order.refundRequest.status,
          reason: order.refundRequest.reason,
          reply: order.refundRequest.reply,
          createdAt: order.refundRequest.createdAt,
          processedAt: order.refundRequest.processedAt
        } : null
      }))
      console.log('🔍 Orders with refund requests:', orders.value)
      console.log('🔍 Orders loaded:', orders.value)
    } else {
      console.error('Failed to load orders:', response)
      orders.value = []
    }
  } catch (error) {
    console.error('Error loading orders:', error)
    orders.value = []
  }
}

const filteredOrders = computed(() => {
  let filtered = orders.value
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.customerName.toLowerCase().includes(query) ||
      order.orderId.toLowerCase().includes(query)
    )
  }
  
  // Apply status filter
  if (activeFilter.value !== 'all') {
    switch (activeFilter.value) {
      case 'refund':
        filtered = filtered.filter(order => order.refundRequest)
        break
    }
  }
  
  return filtered
})

const totalOrders = computed(() => orders.value.length)
const totalRevenue = computed(() => 
  orders.value
    .filter(order => order.status === 'PAID' || order.status === 'COMPLETED')
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    .toFixed(2)
)
const pendingRefunds = computed(() => 
  orders.value.filter(order => 
    order.refundRequest && order.refundRequest.status === 'REQUESTED'
  ).length
)
const completedOrders = computed(() => 
  orders.value.filter(order => order.status === 'PAID' || order.status === 'COMPLETED').length
)

const setFilter = (filter) => {
  activeFilter.value = filter
}

const approveRefund = async (orderId) => {
  const order = orders.value.find(o => o.id === orderId)
  if (!order || !order.refundRequest) {
    alert('No refund request found for this order.')
    return
  }

  try {
    console.log('🔍 Approving refund request:', order.refundRequest.id)
    
    const approvalData = {
      reply: 'Refund approved. The refund will be processed within 5-7 business days.'
    }
    
    const response = await refundApi.approveRefundRequest(order.refundRequest.id, approvalData)
    
    if (response && response.code === 0) {
      // update local status
      order.refundRequest.status = 'APPROVED'
      order.refundRequest.reply = approvalData.reply
      order.refundRequest.processedAt = new Date().toISOString()
      
      alert('Refund approved successfully!')
      console.log('🔍 Refund approved:', response)
    } else {
      alert(response?.message || 'Failed to approve refund request.')
    }
  } catch (error) {
    console.error('Error approving refund:', error)
    alert('Failed to approve refund request. Please try again.')
  }
}

const rejectRefund = async (orderId) => {
  const order = orders.value.find(o => o.id === orderId)
  if (!order || !order.refundRequest) {
    alert('No refund request found for this order.')
    return
  }

  try {
    console.log('🔍 Rejecting refund request:', order.refundRequest.id)
    
    const approvalData = {
      reply: 'Refund request rejected. Please contact customer support for more information.'
    }
    
    const response = await refundApi.rejectRefundRequest(order.refundRequest.id, approvalData)
    
    if (response && response.code === 0) {
      // update local status
      order.refundRequest.status = 'REJECTED'
      order.refundRequest.reply = approvalData.reply
      order.refundRequest.processedAt = new Date().toISOString()
      
      alert('Refund request rejected.')
      console.log('🔍 Refund rejected:', response)
    } else {
      alert(response?.message || 'Failed to reject refund request.')
    }
  } catch (error) {
    console.error('Error rejecting refund:', error)
    alert('Failed to reject refund request. Please try again.')
  }
}

const viewOrderDetails = (orderId) => {
  alert(`Viewing details for order ${orderId}`)
}

const contactCustomer = (orderId) => {
  alert(`Contacting customer for order ${orderId}`)
}

const goBack = () => {
  router.back()
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

const getStatusClass = (status) => {
  switch (status) {
    case 'PAID':
    case 'COMPLETED':
      return 'status-completed'
    case 'PENDING':
      return 'status-pending'
    case 'CANCELLED':
      return 'status-cancelled'
    default:
      return ''
  }
}

const getRefundStatusClass = (status) => {
  switch (status) {
    case 'REQUESTED':
      return 'refund-requested'
    case 'APPROVED':
      return 'refund-approved'
    case 'REJECTED':
      return 'refund-rejected'
    default:
      return ''
  }
}
</script>

<style scoped>
.manage-orders-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.manage-orders-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header Section */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background-color: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.event-info {
  text-align: right;
}

.event-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.event-date {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

/* Statistics Summary */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-item {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #a85a9e;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

/* Filters Section */
.filters-section {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 1.08rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #FAE3C6;
  box-shadow: 0 0 0 3px rgba(250, 227, 198, 0.3);
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background-color: #f9fafb;
  color: #374151;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button:hover {
  background-color: #f3f4f6;
}

.filter-button.active {
  background-color: #FAE3C6;
  color: #8B4513;
  border-color: #FAE3C6;
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.customer-name {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.order-date {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.status-completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

.order-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 6px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 0.9rem;
  color: #1f2937;
  font-weight: 600;
}

.detail-value.price {
  color: #a85a9e;
}

/* Refund Section */
.refund-section {
  margin: 1rem 0;
  padding: 1rem;
  background-color: #fef3c7;
  border-radius: 6px;
  border-left: 4px solid #f59e0b;
}

.refund-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.refund-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #92400e;
}

.refund-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.refund-status.refund-requested {
  background-color: #fef3c7;
  color: #92400e;
}

.refund-status.refund-approved {
  background-color: #d1fae5;
  color: #065f46;
}

.refund-status.refund-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.refund-reason {
  font-size: 0.8rem;
  color: #92400e;
  margin: 0 0 0.5rem 0;
}

.refund-reply {
  margin: 0.5rem 0 1rem 0;
  padding: 0.5rem;
  background-color: #f3f4f6;
  border-radius: 4px;
}

.reply-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 0.25rem;
}

.reply-text {
  font-size: 0.8rem;
  color: #374151;
  margin: 0;
  line-height: 1.4;
}

.refund-actions {
  display: flex;
  gap: 0.5rem;
}

.approve-button,
.reject-button {
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.approve-button:hover,
.reject-button:hover {
  background-color: #f4d4a3;
}

/* Order Actions */
.order-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.action-button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background-color: #f9fafb;
  color: #374151;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.empty-orders {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .event-info {
    text-align: center;
  }
  
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .order-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .order-details {
    grid-template-columns: 1fr;
  }
  
  .refund-actions {
    flex-direction: column;
  }
  
  .order-actions {
    flex-direction: column;
  }
}
</style> 