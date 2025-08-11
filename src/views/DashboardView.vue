<template>
  <div class="dashboard-page">
    <Header />
    
    <main class="dashboard-main">
      <div class="container">
        <!-- Header Section -->
        <div class="dashboard-header">
          <button class="back-button" @click="goBack">
            ← Back
          </button>
          <h1 class="dashboard-title">Dashboard</h1>
        </div>
        
        <!-- Main Content Section -->
        <div class="dashboard-content">
          <!-- Create New Event Button -->
          <div class="create-event-section">
            <button class="create-event-button" @click="createNewEvent">
              + Create New Event
            </button>
          </div>
          
          <!-- Published Events with Manage Orders -->
          <div class="published-events-section">
            <h2 class="section-title">Published Events</h2>
            <div class="events-list">
              <div 
                v-for="event in publishedEvents" 
                :key="event.id" 
                class="event-item"
              >
                <div class="event-info" @click="viewEventDetails(event.id)">
                  <h3 class="event-title">{{ event.title }}</h3>
                  <p class="event-date">{{ formatDate(event.eventDate) }}</p>
                  <p class="event-location">{{ event.location }}</p>
                  <!-- <div class="event-status">
                    <span class="status-badge" :class="getStatusClass(event.status)">
                      {{ event.status }}
                    </span>
                  </div>-->
                </div>
                
                <div class="event-actions">
                  <button 
                    class="manage-orders-button"
                    @click="manageOrders(event.id)"
                  >
                    Manage Orders
                  </button>
                </div>
              </div>
              

              <div v-if="publishedEvents.length === 0" class="empty-events">
                <p>No published events yet.</p>
                <p>Click "Create New Event" to get started!</p>
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
import { useEvent } from '../composables/useEvent'
import { orderApi } from '../services/api'
import Header from '../components/Header.vue'

const router = useRouter()
const { currentUser, logout } = useAuth()
const { myEvents, getMyEvents, isLoading } = useEvent()

// Published events data
const publishedEvents = ref([])

onMounted(async () => {
  await loadPublishedEvents()
})

const loadPublishedEvents = async () => {
  try {
    await getMyEvents()
    
    // for each event, get real order count
    const eventsWithOrderCount = await Promise.all(
      myEvents.value.map(async (event) => {
        try {
          const orderResponse = await orderApi.getOrdersByEventId(event.id)
          const orderCount = orderResponse && orderResponse.code === 0 ? orderResponse.data.length : 0
          return {
            ...event,
            orderCount: orderCount
          }
        } catch (error) {
          console.error(`Failed to load orders for event ${event.id}:`, error)
          return {
            ...event,
            orderCount: 0
          }
        }
      })
    )
    
    publishedEvents.value = eventsWithOrderCount
  } catch (error) {
    console.error('Failed to load published events:', error)
    publishedEvents.value = []
  }
}

const goBack = () => {
  router.back()
}

const handleLogout = () => {
  logout()
  router.push('/login')
}

const createNewEvent = () => {
  router.push('/create-event')
}

const viewEventDetails = (eventId) => {
  router.push(`/event-details/${eventId}`)
}

const manageOrders = (eventId) => {
  router.push(`/manage-orders/${eventId}`)
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
    case 'ACTIVE':
      return 'status-active'
    case 'CANCELLED':
      return 'status-cancelled'
    default:
      return ''
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.dashboard-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header Section */
.dashboard-header {
  display: flex;
  justify-content: center; /* horizontal center title */
  align-items: center;
  margin-bottom: 3rem;

  position: relative;
}

/* if you don't use logout-button, you can completely delete related styles */
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
  position: absolute;
  left: 2rem;
}

.back-button:hover {
  background-color: #F5F5F5;
  color: #3a1239;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* Main Content Section */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.create-event-section {
  background-color: transparent;
  padding: 1rem;
}

.create-event-button {
  width: fit-content; /* adapt to content width */
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 1rem 3rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0;
}


.published-events-section {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
  text-align: center;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.event-item:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.event-info {
  flex: 1;
  cursor: pointer;
}

.event-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.event-date {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.event-location {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
}

.event-status {
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.status-active {
  background-color: #d1fae5;
  color: #065f46;
}



.status-badge.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

.empty-events {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-events p {
  margin: 0.5rem 0;
}

.event-actions {
  flex-shrink: 0;
}

.manage-orders-button {
  background-color: #FAE3C6;
  color: #8B4513;
  border: none;
  padding: 1rem 3rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.manage-orders-button:hover:not(:disabled) {
  background-color: #f4d4a3;
  transform: translateY(-1px);
}

.manage-orders-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}





/* responsive design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .dashboard-title {
    font-size: 1.75rem;
  }
  
  .create-event-button {
    padding: 1.25rem 1.5rem;
    font-size: 1rem;
  }
  
  .event-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .event-actions {
    width: 100%;
  }
  
  .manage-orders-button {
    width: 100%;
    justify-content: center;
  }
}
</style> 