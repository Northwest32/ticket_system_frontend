<template>
  <div class="simple-text-editor">
    <textarea
      :value="modelValue"
      @input="handleInput"
      class="editor-textarea"
      :placeholder="placeholder"
      :maxlength="maxLength"
      rows="8"
    ></textarea>
    <div class="character-count">
      {{ characterCount }}/{{ maxLength }} characters
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Start writing...'
  },
  maxLength: {
    type: Number,
    default: 1000
  }
})

const emit = defineEmits(['update:modelValue'])

const characterCount = computed(() => {
  return props.modelValue.length
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<style scoped>
.simple-text-editor {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.simple-text-editor:focus-within {
  /* border-color: #2563eb; */
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.editor-textarea {
  width: 100%;
  padding: 1rem;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 200px;
  background-color: white;
}

.editor-textarea::placeholder {
  color: #9ca3af;
}

.character-count {
  text-align: right;
  font-size: 0.8rem;
  color: #6b7280;
  padding: 0.5rem 1rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .editor-textarea {
    padding: 0.75rem;
    min-height: 150px;
  }
}
</style> 