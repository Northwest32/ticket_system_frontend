<template>
  <div class="event-card" @click="navigateToEvent">
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
      >
        <span class="image-text">{{ event.category }}</span>
      </div>
    </div>
    <div class="event-content">
      <h3 class="event-title">{{ event.title }}</h3>
      <p class="event-date">{{ event.date }}</p>
      <p class="event-location">{{ event.location }}</p>
      <p class="event-organizer">{{ event.organizerName || event.organizerUsername }}</p>
      <div class="event-price">
        <span class="price-text">From ${{ event.price }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const navigateToEvent = () => {
  router.push(`/event/${props.event.id}`)
}

const handleImageError = (event) => {
  // when image fails to load, hide image and show placeholder
  event.target.style.display = 'none'
  const placeholder = event.target.nextElementSibling
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
}
</script>

<style scoped>
.event-card {
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.image-text {
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.event-content {
  padding: 1rem;
}

.event-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.event-date {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.event-location {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.event-organizer {
  font-size: 0.85rem;
  color: #9ca3af;
  margin-bottom: 0.75rem;
  font-style: italic;
}

.event-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-text {
  font-size: 1rem;
  font-weight: 600;
  color: #059669;
}

@media (max-width: 768px) {
  .event-content {
    padding: 0.75rem;
  }
  
  .event-title {
    font-size: 1rem;
  }
  
  .event-image {
    height: 120px;
  }
}
</style> 