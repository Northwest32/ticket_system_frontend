<template>
  <div class="payment-success-page">
    <Header />
    
    <main class="payment-success-main">
      <div class="container">
        <div class="success-content">
          <!-- retrun button -->
          <div class="success-header">
            <button class="back-button" @click="goBack">
              ← Back
            </button>
          </div>
          
          <!-- success message -->
          <div class="success-message">
            <h1 class="success-title">
              Payment Successful
              <span class="success-icon">✓</span>
            </h1>
          </div>
          
          <!-- information section -->
          <div class="information-section">
            <h2 class="information-title">Information</h2>
            <div class="order-details">
              <div class="detail-item">
                <span class="detail-label">Order Number:</span>
                <span class="detail-value">{{ orderNumber }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Event:</span>
                <span class="detail-value">{{ eventTitle }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">{{ quantity }} tickets</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value price">${{ totalAmount }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">{{ paymentDate }}</span>
              </div>
            </div>
          </div>
          
          <!-- view orders button -->
          <div class="action-section">
            <button class="view-orders-button" @click="viewOrders">
              View Orders
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../components/Header.vue'

const route = useRoute()
const router = useRouter()

const orderNumber = ref('')
const eventTitle = ref('')
const quantity = ref(1)
const totalAmount = ref(0)
const paymentDate = ref('')

onMounted(() => {
  // get order information from route parameter or localStorage
  const orderId = route.params.orderId || Math.floor(Math.random() * 1000000)
  orderNumber.value = `ORD-${orderId.toString().padStart(6, '0')}`
  
  // simulate getting payment information from localStorage
  const paymentInfo = JSON.parse(localStorage.getItem('lastPaymentInfo') || '{}')
  
  eventTitle.value = paymentInfo.eventTitle || 'Event Title'
  quantity.value = paymentInfo.quantity || 1
  totalAmount.value = paymentInfo.totalAmount || 0
  paymentDate.value = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const goBack = () => {
  router.push('/events')
}

const viewOrders = () => {
  router.push('/buyer-home')
}
</script>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.payment-success-main {
  padding: 2rem 0;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 2rem;
}

.success-content {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* return button */
.success-header {
  text-align: left;
  margin-bottom: 2rem;
}

/* .back-button {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
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
}

.back-button:hover {
  background-color: #F5F5F5;
  color: #3a1239;
}

/* success message */
.success-message {
  margin-bottom: 2rem;
}

.success-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.success-icon {
  color: #059669;
  font-size: 2rem;
  font-weight: bold;
}

/* information section */
.information-section {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.information-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
  text-align: center;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.detail-value {
  color: #6b7280;
  font-size: 0.95rem;
}

.detail-value.price {
  color: #059669;
  font-weight: 600;
  font-size: 1.1rem;
}

/* action button */
.action-section {
  margin-top: 2rem;
}

.view-orders-button {
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 1rem 3rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 200px;
}

.view-orders-button:hover {
  background-color: #f4d4a3;
  transform: translateY(-1px);
}

/* responsive design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .success-content {
    padding: 1.5rem;
  }
  
  .success-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .information-section {
    padding: 1.5rem;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style> 