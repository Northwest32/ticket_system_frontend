<template>
  <div class="payment-page">
    <Header />
    
    <main class="payment-main">
      <div class="container">
        <div class="payment-content">
          <!-- back button -->
          <div class="payment-header">
            <button class="back-button" @click="goBack">
              ← Back
            </button>

          </div>
          <h1 class="payment-title">Payment</h1>
          <div class="payment-grid">
            <!-- left: event info and order summary -->
            <div class="order-summary">
              <div class="event-info-card">
                <h3>Event Information</h3>
                <div class="event-details">
                  <div class="event-title">{{ event?.title }}</div>
                  <div class="event-meta">
                    <span class="event-date">{{ formatDate(event?.eventDate) }}</span>
                    <span class="event-location">{{ event?.location }}</span>
                  </div>
                </div>
              </div>
              
              <div class="order-details">
                <h3>Order Summary</h3>
                <div class="ticket-selection">
                  <div class="ticket-row">
                    <span class="ticket-label">Number of Tickets:</span>
                    <div class="quantity-controls">
                      <button 
                        class="quantity-btn" 
                        @click="decreaseQuantity"
                        :disabled="quantity <= 1"
                      >
                        -
                      </button>
                      <span class="quantity">{{ quantity }}</span>
                      <button 
                        class="quantity-btn" 
                        @click="increaseQuantity"
                        :disabled="quantity >= maxQuantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div class="price-breakdown">
                    <div class="price-row">
                      <span>Price per ticket:</span>
                      <span>${{ event?.price }}</span>
                    </div>
 
                    <div class="price-row total">
                      <span>Total:</span>
                      <span>${{ totalPrice }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- right: payment form -->
            <div class="payment-form">
              <h3>Payment Information</h3>
              
              <form @submit.prevent="processPayment" class="payment-form-content">
                <!-- cardholder info -->
                <div class="form-section">
                  <h4>Cardholder Information</h4>
                  <div class="form-row">
                    <div class="form-group">
                      <label for="firstName">First Name</label>
                      <input 
                        type="text" 
                        id="firstName" 
                        v-model="paymentInfo.firstName"
                        required
                        placeholder="Enter first name"
                      />
                    </div>
                    <div class="form-group">
                      <label for="lastName">Last Name</label>
                      <input 
                        type="text" 
                        id="lastName" 
                        v-model="paymentInfo.lastName"
                        required
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      v-model="paymentInfo.email"
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                
                <!-- credit card info -->
                <div class="form-section">
                  <h4>Card Information</h4>
                  <div class="form-group">
                    <label for="cardNumber">Card Number</label>
                    <input 
                      type="text" 
                      id="cardNumber" 
                      v-model="paymentInfo.cardNumber"
                      required
                      placeholder="1234 5678 9012 3456"
                      maxlength="19"
                      @input="formatCardNumber"
                    />
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="expiryDate">Expiry Date</label>
                      <input 
                        type="text" 
                        id="expiryDate" 
                        v-model="paymentInfo.expiryDate"
                        required
                        placeholder="MM/YY"
                        maxlength="5"
                        @input="formatExpiryDate"
                      />
                    </div>
                    <div class="form-group">
                      <label for="cvv">CVV</label>
                      <input 
                        type="text" 
                        id="cvv" 
                        v-model="paymentInfo.cvv"
                        required
                        placeholder="123"
                        maxlength="4"
                        @input="formatCVV"
                      />
                    </div>
                  </div>
                </div>
                
                <!-- billing address -->
                <div class="form-section">
                  <h4>Billing Address</h4>
                  <div class="form-group">
                    <label for="address">Address</label>
                    <input 
                      type="text" 
                      id="address" 
                      v-model="paymentInfo.address"
                      required
                      placeholder="Enter street address"
                    />
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="city">City</label>
                      <input 
                        type="text" 
                        id="city" 
                        v-model="paymentInfo.city"
                        required
                        placeholder="Enter city"
                      />
                    </div>
                    <div class="form-group">
                      <label for="state">State</label>
                      <input 
                        type="text" 
                        id="state" 
                        v-model="paymentInfo.state"
                        required
                        placeholder="Enter state"
                      />
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="zipCode">ZIP Code</label>
                    <input 
                      type="text" 
                      id="zipCode" 
                      v-model="paymentInfo.zipCode"
                      required
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>
                
                <!-- payment button -->
                <div class="payment-actions">
                  <button 
                    type="submit" 
                    class="pay-button"
                    :disabled="isProcessing"
                  >
                    <span v-if="isProcessing">Processing...</span>
                    <span v-else>Pay ${{ totalPrice }}</span>
                  </button>
                </div>
              </form>
            </div>
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
import { seckillApi, eventApi, orderApi } from '../services/api'
import Header from '../components/Header.vue'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, currentUser } = useAuth()

const event = ref(null)
const quantity = ref(1)
const isProcessing = ref(false)

// payment info
const paymentInfo = ref({
  firstName: '',
  lastName: '',
  email: '',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  address: '',
  city: '',
  state: '',
  zipCode: ''
})

// computed properties
const totalPrice = computed(() => {
  if (!event.value) return 0
  return Math.round(event.value.price * quantity.value * 100) / 100
})

const maxQuantity = computed(() => {
  return event.value?.remainingQuantity || 10
})

onMounted(async () => {
  // check if user is logged in
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  // get event ID
  const eventId = parseInt(route.params.id)
  if (!eventId) {
    router.push('/events')
    return
  }
  
  try {
    // get event data from API
    console.log('🔍 Loading event data for ID:', eventId)
    const response = await eventApi.getEventById(eventId)
    
    if (response && response.code === 0 && response.data) {
      event.value = response.data
      console.log('🔍 Event loaded:', event.value)
    } else {
      console.error('Failed to load event data:', response)
      alert('Failed to load event information. Please try again.')
      router.push('/events')
      return
    }
  } catch (error) {
    console.error('Error loading event:', error)
    alert('Failed to load event information. Please try again.')
    router.push('/events')
    return
  }
  
  // pre-fill user info
  if (currentUser.value) {
    paymentInfo.value.email = currentUser.value.email || ''
    paymentInfo.value.firstName = currentUser.value.name?.split(' ')[0] || ''
    paymentInfo.value.lastName = currentUser.value.name?.split(' ').slice(1).join(' ') || ''
  }
})

// methods
const goBack = () => {
  router.back()
}

const increaseQuantity = () => {
  if (quantity.value < maxQuantity.value) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  value = value.replace(/(\d{4})(?=\d)/g, '$1 ')
  paymentInfo.value.cardNumber = value
}

const formatExpiryDate = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4)
  }
  paymentInfo.value.expiryDate = value
}

const formatCVV = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  paymentInfo.value.cvv = value
}

const processPayment = async () => {
  if (isProcessing.value) return
  
  isProcessing.value = true
  
  try {
    // 1. call seckill API
    console.log('🔍 Starting seckill for event:', event.value?.id, 'quantity:', quantity.value)
    
    const seckillResponse = await seckillApi.seckill(event.value.id, quantity.value)
    console.log('🔍 Seckill response:', seckillResponse)
    
          if (seckillResponse && seckillResponse.code === 0) {
        // 2. seckill success, use returned order ID
        const orderId = seckillResponse.data || Math.floor(Math.random() * 1000000)
        
        // save payment info to localStorage
        const paymentInfo = {
          eventTitle: event.value?.title || 'Event Title',
          quantity: quantity.value,
          totalAmount: totalPrice.value,
          orderId: orderId
        }
        localStorage.setItem('lastPaymentInfo', JSON.stringify(paymentInfo))
        
        // redirect to payment success page
        router.push(`/payment-success/${orderId}`)
      } else {
        // seckill failed
        const errorMessage = seckillResponse?.message || 'Seckill failed. Please try again.'
        alert(errorMessage)
      }
  } catch (error) {
    console.error('Payment process failed:', error)
    
    // show different messages based on error type
    let errorMessage = 'Payment process failed. Please try again.'
    
    if (error.response?.status === 400) {
      if (error.response.data === 'Sold out') {
        errorMessage = 'Sorry, tickets are sold out!'
      } else if (error.response.data === 'Purchase limit exceeded (max 3)') {
        errorMessage = 'You have reached the maximum purchase limit of 3 tickets per event.'
      } else {
        errorMessage = error.response.data || 'Invalid request. Please check your selection.'
      }
    } else if (error.response?.status === 401) {
      errorMessage = 'Please login to purchase tickets.'
      router.push('/login')
      return
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.'
    }
    
    alert(errorMessage)
  } finally {
    isProcessing.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'TBD'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.payment-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.payment-content {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  /* border-bottom: 1px solid #e5e7eb; */
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

.payment-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 auto 2rem auto;
  text-align: center;
  max-width: 600px;
}

.payment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

/* left: order summary */
.order-summary {
  background-color: #f9fafb;
  padding: 2rem;
  border-right: 1px solid #e5e7eb;
}

.event-info-card,
.order-details {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.event-info-card h3,
.order-details h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.event-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.ticket-selection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ticket-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-label {
  font-weight: 500;
  color: #374151;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  font-weight: 600;
  color: #1f2937;
  min-width: 20px;
  text-align: center;
}

.price-breakdown {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  margin-top: 1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.price-row.total {
  font-weight: 600;
  color: #1f2937;
  font-size: 1.1rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

/* right: payment form */
.payment-form {
  padding: 2rem;
}

.payment-form h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.payment-form-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group input::placeholder {
  color: #9ca3af;
}

.payment-actions {
  margin-top: 1rem;
}

.pay-button {
  width: 100%;
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 1rem 3rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 150px;
}

.pay-button:hover:not(:disabled) {
  background-color: #f4d4a3;
  transform: translateY(-1px);
}

.pay-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

/* responsive design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .payment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .payment-grid {
    grid-template-columns: 1fr;
  }
  
  .order-summary {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding: 1.5rem;
  }
  
  .payment-form {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .ticket-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style> 