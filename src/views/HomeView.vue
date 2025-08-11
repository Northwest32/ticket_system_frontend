<template>
  <div class="home">
    <Header />
    
    <main class="main-content">
      <!-- Search Section -->
      <section class="search-section">
        <SearchBar />
      </section>
      
      <!-- Categories with Events Section -->
      <section class="categories-events-section">
        <div class="container">
          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
          
          <!-- Content -->
          <div v-else>
            <div class="category-block" v-for="category in categoriesWithEvents" :key="category.id">
            <div class="category-header">
              <h2 class="category-title">{{ category.name }}</h2>
              <button class="view-more-button" @click="goToCategory(category.id)">
                View More
              </button>
            </div>
            
            <div class="events-carousel-container">
              <div class="events-carousel" ref="carousels" :data-category-id="category.id">
                <div class="event-card" 
                     v-for="event in category.events" 
                     :key="event.id"
                     @click="navigateToEvent(event.id)">
                  <div class="event-image">
                    <img 
                      v-if="event.imageUrl" 
                      :src="event.imageUrl" 
                      :alt="event.title"
                      class="event-cover-image"
                      @error="handleImageError"
                    />
                    <div 
                      v-else 
                      class="image-placeholder" 
                      :style="{ background: category.gradient }"
                    >
                      <span class="image-text">{{ event.category }}</span>
                    </div>
                  </div>
                  <div class="event-content">
                    <h3 class="event-title">{{ event.title }}</h3>
                    <p class="event-date">{{ event.date }}</p>
                    <p class="event-venue">{{ event.venue }}</p>
                    <div class="event-price">
                      <span class="price-text">From ${{ event.price }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Navigation Arrows for each category -->
              <button class="carousel-arrow carousel-left" @click="scrollCarousel(category.id, 'left')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="carousel-arrow carousel-right" @click="scrollCarousel(category.id, 'right')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- All Events Button at the bottom of categories section -->
          <div class="all-events-section">
            <button class="all-events-button" @click="goToAllEvents">
              View All Events
            </button>
          </div>
            </div>
          </div>
      </section>
    </main>
    
    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <button class="help-button" @click="goToHelp">
          Help & Support
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCategory } from '../composables/useCategory'
import { useEvent } from '../composables/useEvent'
import Header from '../components/Header.vue'
import SearchBar from '../components/SearchBar.vue'

const router = useRouter()
const { categories, initializeCategories, isLoading: categoriesLoading } = useCategory()
const { events, getEvents, isLoading: eventsLoading } = useEvent()

// 计算加载状态
const isLoading = computed(() => categoriesLoading.value || eventsLoading.value)

// 为每个分类生成渐变色
const generateGradient = (index) => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Music
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Art & Culture
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Sports & Outdoors
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Tech & Learning
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'  // Other
  ]
  return gradients[index % gradients.length]
}

// 格式化事件数据用于显示
const formatEventForDisplay = (event) => {
  console.log('🔍 Formatting event:', event)
  console.log('🔍 Event imageUrl:', event.imageUrl)
  
  return {
    id: event.id,
    categoryId: event.categoryId,
    category: event.categoryName || 'Unknown',
    title: event.title,
    date: new Date(event.eventDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    venue: event.location,
    price: event.price,
    imageUrl: event.imageUrl,
    organizerName: event.organizerName || event.organizerUsername,
    createdBy: event.createdBy
  }
}

// 计算属性：将分类和事件数据组合
const categoriesWithEvents = computed(() => {
  // 安全检查：确保events和categories都是数组
  if (!events.value || !Array.isArray(events.value) || !categories.value || !Array.isArray(categories.value)) {
    console.log('[HomeView] Data not ready yet:', { events: events.value, categories: categories.value })
    return []
  }
  
  return categories.value.map((category, index) => {
    const categoryEvents = events.value
      .filter(event => event.categoryId === category.id)
      .map(formatEventForDisplay)
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      gradient: generateGradient(index),
      events: categoryEvents
    }
  })
})

// 初始化数据 - 并行加载以提高性能
onMounted(async () => {
  try {
    console.log('[HomeView] Mounting...')
    // 并行加载分类和事件数据，限制事件数量以提高性能
    await Promise.all([
      initializeCategories(),
      getEvents({ page: 1, size: 50 }) // 限制加载50个事件
    ])
    console.log('[HomeView] Events after loading:', events.value)
    console.log('[HomeView] Categories after loading:', categories.value)
  } catch (error) {
    console.error('Failed to load initial data:', error)
  }
})

const scrollCarousel = (categoryId, direction) => {
  const carousel = document.querySelector(`[data-category-id="${categoryId}"]`)
  if (carousel) {
    const scrollAmount = direction === 'left' ? -300 : 300
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}

const navigateToEvent = (eventId) => {
  router.push(`/event/${eventId}`)
}

const goToCategory = (categoryId) => {
  // 根据分类ID获取分类名称
  const category = categoriesWithEvents.value.find(cat => cat.id === categoryId)
  if (category) {
    router.push(`/category/${category.name}`)
  }
}

const goToAllEvents = () => {
  router.push('/search')
}

const goToHelp = () => {
  router.push('/help')
}

const handleImageError = (event) => {
  console.log('🔍 Image load error for:', event.target.src)
  // 图片加载失败时隐藏图片，显示占位符
  event.target.style.display = 'none'
  const placeholder = event.target.nextElementSibling
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;700&display=swap');

.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
}

.main-content {
  flex: 1;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Search Section */
.search-section {
  margin: 0;
  padding: 6rem 0;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('@/assets/pexels-wendywei-1190298.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  border-radius: 0;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Categories with Events Section */
.categories-events-section {
  padding: 2rem 0;
  background-color: white;
}

.category-block {
  margin-bottom: 1rem;
  padding: 2rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.category-block:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.category-title {
  font-size: 1.75rem;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  color: #1f2937;
  margin: 0;
}

.view-more-button {
  background: none;
  border: none;
  color: #4B164C;
  font-size: 0.9rem;
  font-weight: 400;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: color 0.2s ease;
}

.view-more-button:hover {
  color: #3a1239;
  text-decoration: underline;
}

/* Events Carousel */
.events-carousel-container {
  position: relative;
  max-width: 100%;
}

.events-carousel {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0.5rem 0;
}

.events-carousel::-webkit-scrollbar {
  display: none;
}

.event-card {
  flex: 0 0 280px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e5e7eb;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.event-image {
  height: 160px;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.event-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-text {
  color: white;
  font-weight: bold;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.event-content {
  padding: 1rem;
}

.event-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.event-date {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.event-venue {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.event-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #059669;
}

/* Carousel Navigation Arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #374151;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  z-index: 10;
}

.carousel-arrow:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-50%) scale(1.05);
}

.carousel-left {
  left: -18px;
}

.carousel-right {
  right: -18px;
}

/* All Events Section */
.all-events-section {
  margin-top: 0.5rem;
  padding: 1rem 0;
  text-align: center;
}

.all-events-button {
  background: none;
  color: #4B164C;
  border: none;
  border-radius: 20px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: color 0.2s ease;
}

.all-events-button:hover {
  color: #3a1239;
}

/* Footer */
.footer {
  background-color: #4B164C;
  border-top: 1px solid #e5e7eb;
  padding: 1rem 0;
  margin-top: auto;
}

.help-button {
  background: none;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  transition: color 0.2s ease;
  display: block;
  margin: 0 auto;
}

.help-button:hover {
  color: #f3e8ff;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .search-section {
    margin: 0;
    padding: 4rem 0;
    min-height: 500px;
  }
  
  .category-title {
    font-size: 1.5rem;
  }
  
  .event-card {
    flex: 0 0 240px;
  }
  
  .event-image {
    height: 120px;
  }
  
  .carousel-arrow {
    width: 32px;
    height: 32px;
  }
  
  .carousel-left {
    left: -16px;
  }
  
  .carousel-right {
    right: -16px;
  }
  
  .all-events-section {
    margin-top: 1.5rem;
  }
  
  .all-events-button {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .event-card {
    flex: 0 0 200px;
  }
  
  .event-content {
    padding: 0.75rem;
  }
  
  .event-title {
    font-size: 0.9rem;
  }
  
  .event-date,
  .event-venue {
    font-size: 0.75rem;
  }
  
  .carousel-arrow {
    display: none;
  }
  
  .all-events-section {
    margin-top: 1rem;
  }
  
  .all-events-button {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style> 