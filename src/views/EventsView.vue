<template>
  <div class="events-page">
    <Header />
    
    <main class="events-main">
      <div class="container">
        <h1 class="page-title">All Events</h1>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
        
        <!-- Events Grid -->
        <div v-else class="events-grid">
          <EventCard 
            v-for="event in allEvents" 
            :key="event.id" 
            :event="event" 
          />
        </div>
        
        <!-- No Events State -->
        <div v-if="!isLoading && allEvents.length === 0" class="no-events">
          <h3>No events found</h3>
          <p>Check back later for new events</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useEvent } from '../composables/useEvent'
import Header from '../components/Header.vue'
import EventCard from '../components/EventCard.vue'

const { events, getEvents, isLoading } = useEvent()

// format event data for display
const formatEventForDisplay = (event) => {
  return {
    id: event.id,
    category: event.categoryName || 'Unknown',
    title: event.title,
    date: new Date(event.eventDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    location: event.location,
    price: event.price,
    imageUrl: event.imageUrl,
    organizerName: event.organizerName || event.organizerUsername
  }
}

// computed property: format all events
const allEvents = computed(() => {
  if (!events.value || !Array.isArray(events.value)) {
    return []
  }
  return events.value.map(formatEventForDisplay)
})

// initialize data
onMounted(async () => {
  try {
    await getEvents({ page: 1, size: 100 }) // load more events
  } catch (error) {
    console.error('Failed to load events:', error)
  }
})
</script>

<style scoped>
.events-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.events-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #C26CB5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* No Events State */
.no-events {
  text-align: center;
  padding: 4rem 2rem;
}

.no-events h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.no-events p {
  color: #6b7280;
  font-size: 1rem;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style> 