<template>
  <div class="create-event-page">
    <Header />
    
    <main class="create-event-main">
      <div class="container">
        <!-- Header Section -->
        <div class="page-header">
          <button class="back-button" @click="goBack">
            ← Back
          </button>
          <h1 class="page-title">Create New Event</h1>
        </div>
        
        <!-- Event Form -->
        <div class="event-form-card">
          <form @submit.prevent="createEvent" class="event-form">
            <!-- Basic Information -->
            <div class="form-section">
              <h2 class="section-title">Basic Information</h2>
              
              <div class="form-group">
                <label for="title" class="form-label">Event Title *</label>
                <input
                  id="title"
                  v-model="eventData.title"
                  type="text"
                  class="form-input"
                  placeholder="Enter event title"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="description" class="form-label">Description *</label>
                <div class="description-editor">
                  <TiptapEditor
                    v-model="eventData.description"
                    :placeholder="'Describe your event... You can include details about the event, add images, and format your text.'"
                    :max-length="2000"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="coverImage" class="form-label">Cover Image</label>
                <div class="image-upload-section">
                  <div 
                    v-if="!eventData.imageUrl && !imagePreview" 
                    class="image-upload-placeholder"
                    @click="triggerImageUpload"
                  >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                    </svg>
                    <p>Click to upload cover image</p>
                    <span class="upload-hint">Recommended size: 800x600px, Max: 5MB</span>
                  </div>
                  
                  <div v-else class="image-preview">
                    <img 
                      :src="imagePreview || eventData.imageUrl" 
                      alt="Event cover" 
                      class="preview-image"
                    />
                    <div class="image-actions">
                      <button 
                        type="button" 
                        class="change-image-btn"
                        @click="triggerImageUpload"
                      >
                        Change Image
                      </button>
                      <button 
                        type="button" 
                        class="remove-image-btn"
                        @click="removeImage"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    @change="handleImageChange"
                    class="image-input"
                    style="display: none;"
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="category" class="form-label">Category *</label>
                  <select
                    id="category"
                    v-model="eventData.category"
                    class="form-select"
                    required
                    :disabled="categoriesLoading"
                  >
                    <option value="">Select category</option>
                    <option 
                      v-for="category in categories" 
                      :key="category.id" 
                      :value="category.id"
                    >
                      {{ category.name }} - {{ category.description }}
                    </option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="location" class="form-label">Location *</label>
                  <input
                    id="location"
                    v-model="eventData.location"
                    type="text"
                    class="form-input"
                    placeholder="Event location"
                    required
                  />
                </div>
              </div>
            </div>
            
            <!-- Date & Time -->
            <div class="form-section">
              <h2 class="section-title">Date & Time</h2>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="eventDate" class="form-label">Event Date *</label>
                  <DateTimePicker
                    v-model="eventData.eventDate"
                    :required="true"
                    date-id="eventDate"
                    time-id="eventTime"
                  />
                </div>
                
                <div class="form-group">
                  <label for="endDate" class="form-label">End Date</label>
                  <DateTimePicker
                    v-model="eventData.endDate"
                    :required="false"
                    date-id="endDate"
                    time-id="endTime"
                  />
                </div>
              </div>
            </div>
            
            <!-- Ticket Information -->
            <div class="form-section">
              <h2 class="section-title">Ticket Information</h2>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="price" class="form-label">Price ($) *</label>
                  <input
                    id="price"
                    v-model="eventData.price"
                    type="number"
                    class="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label for="quantity" class="form-label">Available Quantity *</label>
                  <input
                    id="quantity"
                    v-model="eventData.quantity"
                    type="number"
                    class="form-input"
                    placeholder="100"
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="startTime" class="form-label">Sale Start Time</label>
                  <DateTimePicker
                    v-model="eventData.startTime"
                    :required="false"
                    date-id="startTime"
                    time-id="startTimeTime"
                  />
                </div>
                
                <div class="form-group">
                  <label for="endTime" class="form-label">Sale End Time</label>
                  <DateTimePicker
                    v-model="eventData.endTime"
                    :required="false"
                    date-id="endTime"
                    time-id="endTimeTime"
                  />
                </div>
              </div>
            </div>
            
            <!-- Submit Button -->
            <div class="form-actions">
              <button 
                type="submit" 
                class="publish-button"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Creating...' : 'Publish Event' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useCategory } from '../composables/useCategory'
import { useEvent } from '../composables/useEvent'
import { imageApi } from '../services/api'
import Header from '../components/Header.vue'
import DateTimePicker from '../components/DateTimePicker.vue'
import TiptapEditor from '../components/TiptapEditor.vue'

const router = useRouter()
const { currentUser } = useAuth()
const { categories, isLoading: categoriesLoading, initializeCategories } = useCategory()
const { createEvent: createEventApi, isLoading: eventLoading, error: eventError } = useEvent()

const isSubmitting = ref(false)
const imageInput = ref(null)
const imagePreview = ref(null)

// Event form data
const eventData = ref({
  title: '',
  description: '',
  imageUrl: '',
  category: '',
  location: '',
  eventDate: '',
  endDate: '',
  price: '',
  quantity: '',
  startTime: '',
  endTime: ''
})

// initialize category data
onMounted(async () => {
  await initializeCategories()
})

const goBack = () => {
  router.back()
}

const triggerImageUpload = () => {
  imageInput.value.click()
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // check file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }
  
  // check file size (limit to 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should be less than 5MB')
    return
  }
  
  // create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
  
  // clear input
  event.target.value = ''
}

const removeImage = () => {
  imagePreview.value = null
  eventData.value.imageUrl = ''
}

const createEvent = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // if there is a new uploaded image, upload image first
    if (imagePreview.value) {
      console.log('🔍 Uploading event image...')
      
      // convert base64 to File object
      const response = await fetch(imagePreview.value)
      const blob = await response.blob()
      const file = new File([blob], 'event-cover.jpg', { type: 'image/jpeg' })
      
      const uploadResponse = await imageApi.uploadEventImage(file)
      
      if (uploadResponse && uploadResponse.code === 0) {
        eventData.value.imageUrl = uploadResponse.data
        console.log('🔍 Image uploaded successfully:', uploadResponse.data)
      } else {
        console.error('Failed to upload image:', uploadResponse)
        alert('Failed to upload image. Please try again.')
        return
      }
    }
    
    // use real API to create event
    console.log('🔍 Creating event with data:', eventData.value)
    console.log('🔍 Event imageUrl:', eventData.value.imageUrl)
    
    const result = await createEventApi(eventData.value)
    
    console.log('Event created:', result)
    
    // show success message
    alert('Event created successfully!')
    
    // redirect to Dashboard
    router.push('/dashboard')
  } catch (error) {
    console.error('Failed to create event:', error)
    // ensure it is a string instead of an object
    const errorMessage = typeof error.message === 'string' ? error.message : 'Failed to create event. Please try again.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}



const validateForm = () => {
  if (!eventData.value.title.trim()) {
    alert('Please enter an event title.')
    return false
  }
  
  if (!eventData.value.description.trim()) {
    alert('Please enter an event description.')
    return false
  }
  
  if (!eventData.value.category) {
    alert('Please select a category.')
    return false
  }
  
  if (!eventData.value.location.trim()) {
    alert('Please enter an event location.')
    return false
  }
  
  if (!eventData.value.eventDate) {
    alert('Please select an event date.')
    return false
  }
  
  if (!eventData.value.price || eventData.value.price <= 0) {
    alert('Please enter a valid price.')
    return false
  }
  
  if (!eventData.value.quantity || eventData.value.quantity <= 0) {
    alert('Please enter a valid quantity.')
    return false
  }
  
  return true
}
</script>

<style scoped>
.create-event-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.create-event-main {
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header Section */
.page-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
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

.page-header {
  position: relative;
  height: 3rem;
  margin-bottom: 2rem;
}

.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
}


/* Event Form Card */
.event-form-card {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.event-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Form Sections */
.form-section {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 2rem;
}

.form-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

/* Form Groups */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #FAE3C6;
  box-shadow: 0 0 0 3px rgba(250, 227, 198, 0.3);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.description-editor {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.description-editor:focus-within {
  border-color: #d1d5db;
  box-shadow: none;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.publish-button {
  padding: 1rem 3rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background-color: #FAE3C6;
  color: #8B4513;
}

.publish-button:hover:not(:disabled) {
  background-color: #f4d4a3;
  transform: translateY(-1px);
}

.publish-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  color: #6b7280;
}

/* responsive design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .publish-button {
    width: 100%;
  }
}

/* image upload style */
.image-upload-section {
  margin-top: 0.5rem;
}

.image-upload-placeholder {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f9fafb;
}

.image-upload-placeholder:hover {
  border-color: #FAE3C6;
  background-color: #fef3c7;
}

.image-upload-placeholder svg {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.image-upload-placeholder p {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.upload-hint {
  font-size: 0.8rem;
  color: #6b7280;
}

.image-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.preview-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.75rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.change-image-btn,
.remove-image-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-image-btn {
  background-color: #FAE3C6;
  color: #8B4513;
}

.change-image-btn:hover {
  background-color: #f4d4a3;
}

.remove-image-btn {
  background-color: #dc2626;
  color: white;
}

.remove-image-btn:hover {
  background-color: #b91c1c;
}
</style> 