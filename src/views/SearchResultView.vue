<template>
  <div class="search-result-page">
    <Header />
    
    <main class="search-result-main">
      <!-- search section -->
      <div class="search-section">
        <div class="search-container">
          <div class="search-input-wrapper">
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Search for events, organizers, or categories..."
              @keyup.enter="handleSearch"
            />
            <button @click="handleSearch" class="search-button">
              <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>
          
          <!-- filter panel -->
          <div class="filter-panel">
            <button 
              class="filter-toggle-button"
              @click="toggleFilterPanel"
            >
              <svg class="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
              </svg>
              Filters
            </button>
            
            <div v-if="showFilterPanel" class="filter-content">
              <div class="filter-row">
                <div class="filter-group">
                  <label class="filter-label">Location</label>
                  <input
                    v-model="locationFilter"
                    type="text"
                    class="filter-input"
                    placeholder="Enter location (e.g., city, venue)"
                    @input="applyFilters"
                  />
                </div>
                
                <div class="filter-group">
                  <label class="filter-label">Date Range</label>
                  <div class="date-inputs">
                    <input
                      v-model="startDateFilter"
                      type="date"
                      class="filter-input date-input"
                      @change="applyFilters"
                    />
                    <span class="date-separator">to</span>
                    <input
                      v-model="endDateFilter"
                      type="date"
                      class="filter-input date-input"
                      @change="applyFilters"
                    />
                  </div>
                </div>
              </div>
              
              <div class="filter-actions">
                <button 
                  class="clear-filters-button"
                  @click="clearFilters"
                >
                  Clear Filters
                </button>
                <button 
                  class="apply-filters-button"
                  @click="applyFilters"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- search results -->
      <div class="results-section">
        <div class="results-container">
          <div class="results-header">
            <h2 class="results-title">{{ isCategoryView ? 'Category Events' : 'Search Results' }}</h2>
            <p class="results-count">{{ filteredEvents.length }} events found</p>
          </div>

          <!-- loading state -->
          <div v-if="loading" class="loading-state">
            <p>Loading events...</p>
          </div>
          
          <!-- event list -->
          <div v-else class="events-list">
            <div
              v-for="event in filteredEvents"
              :key="event.id"
              class="event-card"
              :class="{ 'expired-event': getEventStatus(event) === 'expired' }"
              @click="viewEvent(event.id)"
            >
              <!-- left image -->
              <div class="event-image">
                <img 
                  v-if="event.imageUrl" 
                  :src="event.imageUrl" 
                  :alt="event.title" 
                  class="event-img"
                  @error="handleImageError"
                />
                <div 
                  v-else 
                  class="image-placeholder"
                >
                  <span class="image-text">{{ event.category || 'Event' }}</span>
                </div>
              </div>

                             <!-- middle content -->
               <div class="event-content">
                 <div class="event-date">{{ formatDate(event.date) }}</div>
                 <h3 class="event-title">
                   {{ event.title }}
                   <span v-if="getEventStatus(event) === 'expired'" class="expired-badge">Ended</span>
                 </h3>
                 <div class="event-organizer">by {{ event.organizer }}</div>
                 <div class="event-location">{{ event.venue }}</div>
               </div>

              <!-- right button -->
              <div class="event-action">
                <div v-if="getEventStatus(event) === 'expired'" class="event-status expired">
                  <span class="status-text">Event Ended</span>
                </div>
                <button 
                  class="see-event-button"
                  @click.stop="viewEvent(event.id)"
                >
                  See Event
                </button>
              </div>
            </div>
          </div>

          <!-- no results state -->
          <div v-if="filteredEvents.length === 0" class="no-results">
            <div class="no-results-content">
              <h3>No events found</h3>
              <p>Try adjusting your search criteria or browse our categories</p>
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
import { eventApi, categoryApi } from '../services/api'
import Header from '../components/Header.vue'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const isCategoryView = ref(false)
const categoryName = ref('')
const categoryId = ref(null)

// event data
const events = ref([])
const loading = ref(false)

// filter related
const showFilterPanel = ref(false)
const locationFilter = ref('')
const startDateFilter = ref('')
const endDateFilter = ref('')
const filteredEvents = ref([])

onMounted(async () => {
  // check if it is category view
  if (route.params.category) {
    isCategoryView.value = true
    categoryName.value = route.params.category
    searchQuery.value = categoryName.value
    await loadEventsByCategory()
  } else if (route.query.q) {
    // search view
    searchQuery.value = route.query.q
    await loadEventsBySearch()
  } else {
    // default load all events
    await loadAllEvents()
  }
})

// apply filter
const applyFilters = () => {
  let filtered = [...events.value]
  
  // location filter (fuzzy search)
  if (locationFilter.value.trim()) {
    const locationQuery = locationFilter.value.toLowerCase().trim()
    filtered = filtered.filter(event => {
      const venue = (event.venue || '').toLowerCase()
      const location = (event.location || '').toLowerCase()
      return venue.includes(locationQuery) || location.includes(locationQuery)
    })
  }
  
  // time filter
  if (startDateFilter.value) {
    const startDate = new Date(startDateFilter.value)
    filtered = filtered.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= startDate
    })
  }
  
  if (endDateFilter.value) {
    const endDate = new Date(endDateFilter.value)
    filtered = filtered.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate <= endDate
    })
  }
  
  filteredEvents.value = filtered
}

// check if event is expired
const isEventExpired = (eventDate) => {
  const currentDate = new Date()
  const eventDateTime = new Date(eventDate)
  return currentDate > eventDateTime
}

// get event status
const getEventStatus = (event) => {
  if (isEventExpired(event.date)) {
    return 'expired'
  }
  return 'active'
}

// clear filter
const clearFilters = () => {
  locationFilter.value = ''
  startDateFilter.value = ''
  endDateFilter.value = ''
  filteredEvents.value = [...events.value]
}

// switch filter panel
const toggleFilterPanel = () => {
  showFilterPanel.value = !showFilterPanel.value
}

// format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
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

// load all events
const loadAllEvents = async () => {
  try {
    loading.value = true
    const response = await eventApi.getEvents()
    if (response && response.code === 0 && response.data) {
      events.value = response.data.map(event => ({
        id: event.id,
        title: event.title,
        date: event.eventDate,
        venue: event.location,
        imageUrl: event.imageUrl,
        category: event.categoryName || 'Event',
        organizer: event.organizerName || event.organizerUsername || 'Event Organizer'
      }))
      // initialize filter results
      filteredEvents.value = [...events.value]
    } else {
      events.value = []
      filteredEvents.value = []
    }
  } catch (error) {
    console.error('Failed to load events:', error)
    events.value = []
  } finally {
    loading.value = false
  }
}

// load events by category
const loadEventsByCategory = async () => {
  try {
    loading.value = true
    
    // first get category ID
    const categoriesResponse = await categoryApi.getAllCategories()
    if (categoriesResponse && categoriesResponse.code === 0 && categoriesResponse.data) {
      const category = categoriesResponse.data.find(cat => 
        cat.name.toLowerCase() === categoryName.value.toLowerCase()
      )
      if (category) {
        categoryId.value = category.id
      }
    }
    
    // search events by category ID
    const response = await eventApi.searchEvents(categoryId.value, null)
    if (response && response.code === 0 && response.data) {
      events.value = response.data.map(event => ({
        id: event.id,
        title: event.title,
        date: event.eventDate,
        venue: event.location,
        city: event.location,
        imageUrl: event.imageUrl,
        category: event.categoryName || 'Event',
        organizer: event.organizerName || event.organizerUsername || 'Event Organizer',
        organizerDescription: event.organizerDescription || null
      }))
      // initialize filter results
      filteredEvents.value = [...events.value]
    } else {
      events.value = []
      filteredEvents.value = []
    }
  } catch (error) {
    console.error('Failed to load events by category:', error)
    events.value = []
  } finally {
    loading.value = false
  }
}

// search events by keyword
const loadEventsBySearch = async () => {
  try {
    loading.value = true
    
    // first check if it is category search
    const categoriesResponse = await categoryApi.getAllCategories()
    let categoryId = null
    
    if (categoriesResponse && categoriesResponse.code === 0 && categoriesResponse.data) {
      // find matching category (support partial matching and case insensitive)
      const matchedCategory = categoriesResponse.data.find(cat => {
        const categoryName = cat.name.toLowerCase()
        const searchTerm = searchQuery.value.toLowerCase()
        
        // support full matching, partial matching, and include relation
        return categoryName === searchTerm || 
               categoryName.includes(searchTerm) || 
               searchTerm.includes(categoryName) ||
               categoryName.split(' ').some(word => word.includes(searchTerm)) ||
               searchTerm.split(' ').some(word => categoryName.includes(word))
      })
      
      if (matchedCategory) {
        categoryId = matchedCategory.id
        console.log(`Found matching category: ${matchedCategory.name} (ID: ${categoryId})`)
      }
    }
    
    // search events by category ID and keyword (backend SQL already supports organizer username search)
    const response = await eventApi.searchEvents(categoryId, searchQuery.value)
    if (response && response.code === 0 && response.data) {
      events.value = response.data.map(event => ({
        id: event.id,
        title: event.title,
        date: event.eventDate,
        venue: event.location,
        imageUrl: event.imageUrl,
        category: event.categoryName || 'Event',
        organizer: event.organizerName || event.organizerUsername || 'Event Organizer'
      }))
      
      // initialize filter results
      filteredEvents.value = [...events.value]
      
      // record search result statistics
      console.log(`Search results for "${searchQuery.value}": ${events.value.length} events found`)
      if (events.value.length > 0) {
        const organizers = [...new Set(events.value.map(e => e.organizer))]
        const categories = [...new Set(events.value.map(e => e.category))]
        console.log(`Matched organizers: ${organizers.join(', ')}`)
        console.log(`Matched categories: ${categories.join(', ')}`)
      }
    } else {
      events.value = []
      filteredEvents.value = []
    }
  } catch (error) {
    console.error('Failed to search events:', error)
    events.value = []
  } finally {
    loading.value = false
  }
}

// handle search
const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    // update URL
    router.push({ 
      path: '/search', 
      query: { q: searchQuery.value.trim() } 
    })
    
    // execute search
    await loadEventsBySearch()
  }
}

// view event details
const viewEvent = (eventId) => {
  router.push(`/event/${eventId}`)
}

// image error handling
const handleImageError = (event) => {
  // when image loading fails, hide image and show placeholder
  event.target.style.display = 'none'
  const placeholder = event.target.nextElementSibling
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
}
</script>

<style scoped>
.search-result-page {
  min-height: 100vh;
  background-color: #fafafa;
}

.search-result-main {
  flex: 1;
}

/* compact search bar */
.search-section {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0; /* smaller than home page */
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1.5px solid #dfe1e5;
  border-radius: 24px;
  padding: 0 1.1rem;
  max-width: 520px;
  height: 48px;
  margin: 0 auto;
  box-shadow: 0 1px 6px rgba(60,64,67,.08);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.search-input-wrapper:focus-within {
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37,99,235,0.13);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem 0;
  font-size: 1.12rem;
  outline: none;
  line-height: 48px;
  height: 48px;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-button {
  background: #f8f9fa;
  border: none;
  color: #3c4043;
  border-radius: 20px;
  padding: 0.3rem 1rem;
  font-size: 0.96rem;
  font-weight: 500;
  margin-left: 1rem;
  transition: background 0.15s, box-shadow 0.15s;
  box-shadow: none;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.search-button:hover {
  background: #e7eaf2;
}

.search-icon {
  width: 1.3rem;
  height: 1.3rem;
}

/* filter panel style */
.filter-panel {
  margin-top: 1rem;
  text-align: left;
}

.filter-toggle-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #dfe1e5;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: #3c4043;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-toggle-button:hover {
  background: #e7eaf2;
  border-color: #c1c3c6;
}

.filter-icon {
  width: 1.2rem;
  height: 1.2rem;
}

.filter-content {
  margin-top: 1rem;
  background: white;
  border: 1px solid #dfe1e5;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  flex: 1;
  text-align: left;
}

.filter-label {
  display: block;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.filter-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.filter-input:focus {
  outline: none;
  border-color: #C26CB5;
  box-shadow: 0 0 0 3px rgba(194, 108, 181, 0.1);
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  flex: 1;
}

.date-separator {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.clear-filters-button {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters-button:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.apply-filters-button {
  background: #C26CB5;
  color: white;
  border: 1px solid #C26CB5;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.apply-filters-button:hover {
  background: #b05a9e;
  border-color: #b05a9e;
}

/* search result section */
.results-section {
  padding: 2rem 0;
}

.results-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.results-header {
  margin-bottom: 2rem;
}

.results-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.results-count {
  color: #6b7280;
  font-size: 1rem;
}

/* event list */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  display: flex;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-card.expired-event {
  opacity: 0.7;
}

.event-card.expired-event:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-image {
  flex-shrink: 0;
  width: 200px;
  height: 150px;
}

.event-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.image-text {
  color: white;
  font-weight: bold;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.event-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-date {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.event-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.expired-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: #ef4444;
  background-color: #fef2f2;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  border: 1px solid #fecaca;
}

.event-organizer {
  font-size: 0.875rem;
  color: #C26CB5;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.event-location {
  font-size: 0.875rem;
  color: #6b7280;
}



.event-action {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  flex-shrink: 0;
}

.see-event-button {
  background-color: white;
  color: #C26CB5;
  border: 2px solid #C26CB5;
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.see-event-button:hover {
  background-color: #C26CB5;
  color: white;
}

/* event status style */
.event-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 120px;
}

.event-status.expired {
  background-color: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.status-text {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* loading state */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-state p {
  color: #6b7280;
  font-size: 1rem;
}

/* no results state */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
}

.no-results-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.no-results-content p {
  color: #6b7280;
  font-size: 1rem;
}

/* responsive design */
@media (max-width: 768px) {
  .event-card {
    flex-direction: column;
  }
  
  .event-image {
    width: 100%;
    height: 200px;
  }
  
  .event-content {
    padding: 1rem;
  }
  
  .event-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .expired-badge {
    align-self: flex-start;
  }
  
  .event-action {
    padding: 1rem;
    justify-content: center;
  }
  
  .search-input-wrapper {
    margin: 0;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .clear-filters-button,
  .apply-filters-button {
    width: 100%;
    max-width: 200px;
  }
}
</style> 