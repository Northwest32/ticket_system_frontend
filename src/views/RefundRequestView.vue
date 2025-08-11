<template>
  <div class="refund-request">
    <div class="header">
      <button class="back-button" @click="goBack">
        ← Back
      </button>
      
    </div>
    <h1 class="page-title">Request Refund</h1>
    <main class="main-content">
      <div class="container">
        <!-- Ticket Information -->
        <div class="ticket-info-section">
          <h2 class="section-title">Ticket Information</h2>
          <div class="ticket-details">
            <div class="ticket-item stacked">
              <span class="label">Event:</span>
              <span class="value">{{ ticketInfo.eventTitle }}</span>
            </div>
            <div class="ticket-item">
              <span class="label">Order ID:</span>
              <span class="value">{{ ticketInfo.orderId }}</span>
            </div>
            <div class="ticket-item">
              <span class="label">Quantity:</span>
              <span class="value">{{ ticketInfo.quantity }}</span>
            </div>
            <div class="ticket-item">
              <span class="label">Total Amount:</span>
              <span class="value">${{ ticketInfo.totalAmount }}</span>
            </div>
            <div class="ticket-item">
              <span class="label">Purchase Date:</span>
              <span class="value">{{ formatDate(ticketInfo.purchaseDate) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Refund Reason -->
        <div class="reason-section">
          <label for="refund-reason" class="reason-label">Reason for refund</label>
          <textarea
            id="refund-reason"
            v-model="refundReason"
            class="reason-input"
            placeholder="Please provide a detailed reason for your refund request..."
            rows="6"
            required
          ></textarea>
        </div>
        
        <!-- Submit Button -->
        <div class="submit-section">
          <button 
            class="submit-button" 
            @click="submitRefundRequest"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { orderApi, refundApi } from '../services/api'

const router = useRouter()
const route = useRoute()
const { currentUser } = useAuth()

const refundReason = ref('')
const isSubmitting = ref(false)

// Mock ticket information - in real app, this would come from route params or API call
const ticketInfo = ref({
  eventTitle: 'Sample Event',
  orderId: 'ORD-123456',
  quantity: 2,
  totalAmount: 150.00,
  purchaseDate: new Date()
})

onMounted(async () => {
  // Get ticket info from route params
  const orderId = route.params.orderId
  console.log('RefundRequestView mounted with orderId:', orderId)
  
  if (orderId) {
    try {
      // extract numeric ID from orderId (remove "ORD" prefix)
      const numericId = orderId.replace('ORD', '')
      console.log('Loading ticket info for order ID:', numericId)
      
      // call real API to get order details
      const response = await orderApi.getOrderById(numericId)
      
      if (response && response.code === 0 && response.data) {
        const order = response.data
        
        // convert backend data format to frontend needed format
        ticketInfo.value = {
          eventTitle: order.eventTitle || `Event ${order.eventId}`,
          orderId: `ORD${order.id.toString().padStart(3, '0')}`,
          quantity: order.quantity,
          totalAmount: order.totalAmount,
          purchaseDate: order.createTime
        }
        
        console.log('🔍 Ticket info loaded:', ticketInfo.value)
      } else {
        console.error('Failed to load order details:', response)
        alert('Failed to load order details. Please try again.')
        router.push('/buyer-home')
        return
      }
    } catch (error) {
      console.error('Error loading order details:', error)
      alert('Error loading order details. Please try again.')
      router.push('/buyer-home')
      return
    }
  }
})

const goBack = () => {
  router.go(-1)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const submitRefundRequest = async () => {
  if (!refundReason.value.trim()) {
    alert('Please enter a reason for the refund request before submitting.')
    return
  }

  if (!currentUser.value) {
    alert('Please login to submit a refund request.')
    router.push('/login')
    return
  }

  isSubmitting.value = true

  try {
    // call real backend API
    const refundRequestData = {
      orderId: parseInt(ticketInfo.value.orderId.replace('ORD', '')),
      reason: refundReason.value
    }

    console.log('🔍 Submitting refund request to backend:', refundRequestData)
    
    const response = await refundApi.createRefundRequest(refundRequestData)
    
    if (response && response.code === 0) {
      console.log('🔍 Backend response:', response)
      
      // update refund status in localStorage
      const orderId = ticketInfo.value.orderId
      console.log('🔍 Updating local refund status for order:', orderId)
      
      const refundRequests = JSON.parse(localStorage.getItem('refundRequests') || '{}')
      refundRequests[orderId] = {
        status: 'REQUESTED',
        reason: refundReason.value,
        submittedAt: new Date().toISOString()
      }
      localStorage.setItem('refundRequests', JSON.stringify(refundRequests))
      
      // show success message and redirect
      console.log('🔍 Refund request submitted successfully, redirecting to order details...')
      alert('Refund request submitted successfully! The organizer will review your request.')
      
      // redirect back to Order Details page
      router.push(`/order-details/${ticketInfo.value.orderId}`)
    } else {
      console.error('Failed to submit refund request:', response)
      alert(response?.message || 'Failed to submit refund request. Please try again.')
    }
    
  } catch (error) {
    console.error('Error submitting refund request:', error)
    
    // show different messages based on error type
    let errorMessage = 'Failed to submit refund request. Please try again.'
    
    if (error.response?.status === 400) {
      errorMessage = error.response.data?.message || 'Invalid request. Please check your input.'
    } else if (error.response?.status === 401) {
      errorMessage = 'Please login to submit a refund request.'
      router.push('/login')
      return
    } else if (error.response?.status === 403) {
      errorMessage = 'You are not authorized to submit a refund request for this order.'
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.'
    }
    
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.refund-request {
  min-height: 100vh;
  background-color: #fafafa;
}

.header {
  background-color: white;
  border-bottom: none;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
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
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 auto 2rem auto;
  text-align: center;
  max-width: 600px;
  padding-top: 2rem;
}

.main-content {
  padding: 1rem 0;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Ticket Information Section */
.ticket-item.stacked {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}


.ticket-info-section {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  text-align: center;
}

.ticket-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ticket-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.ticket-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.9rem;
}

.value {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
}

/* Reason Section */
.reason-section {
  margin-bottom: 2rem;
}

.reason-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.reason-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s ease;
}

.reason-input:focus {
  outline: none;
  border-color: #FAE3C6;
  box-shadow: 0 0 0 3px rgba(250, 227, 198, 0.3);
}

.reason-input:hover {
  border-color: #FAE3C6;
}

.reason-input::placeholder {
  color: #9ca3af;
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




@media (max-width: 768px) {
  .header {
    padding: 1rem;
    gap: 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .submit-button {
    width: 100%;
    max-width: 300px;
  }
}
</style> 