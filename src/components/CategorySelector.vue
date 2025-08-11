<template>
  <div class="category-selector">
    <label v-if="label" class="category-label">{{ label }}</label>
    
    <div v-if="isLoading" class="loading">
      Loading categories...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <select 
      v-else
      v-model="selectedCategoryId"
      @change="handleCategoryChange"
      class="category-select"
      :disabled="disabled"
    >
      <option value="">Select a category</option>
      <option 
        v-for="category in categories" 
        :key="category.id" 
        :value="category.id"
      >
        {{ category.name }}
      </option>
    </select>
    
    <div v-if="selectedCategory && showDescription" class="category-description">
      {{ selectedCategory.description }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCategory } from '../composables/useCategory'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null
  },
  label: {
    type: String,
    default: 'Category'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showDescription: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const { categories, isLoading, error, initializeCategories } = useCategory()

const selectedCategoryId = ref(props.modelValue)

// computed property: get selected category
const selectedCategory = computed(() => {
  if (!selectedCategoryId.value) return null
  return categories.value.find(cat => cat.id === selectedCategoryId.value)
})

// handle category change
const handleCategoryChange = () => {
  emit('update:modelValue', selectedCategoryId.value)
  emit('change', selectedCategory.value)
}

// monitor external value change
watch(() => props.modelValue, (newValue) => {
  selectedCategoryId.value = newValue
})

// initialize category data when component is mounted
onMounted(async () => {
  await initializeCategories()
})
</script>

<style scoped>
.category-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.category-select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.2s ease;
}

.category-select:focus {
  outline: none;
  border-color: #2563eb;
}

.category-select:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.loading {
  color: #6b7280;
  font-style: italic;
}

.error {
  color: #dc2626;
  font-size: 0.9rem;
}

.category-description {
  font-size: 0.8rem;
  color: #6b7280;
  font-style: italic;
  margin-top: 0.25rem;
}
</style> 