<template>
  <div class="datetime-picker">
    <div class="datetime-inputs">
      <div class="date-input">
        <input
          :id="dateId"
          v-model="dateValue"
          type="date"
          class="form-input"
          :required="required"
          lang="en"
          @change="updateDateTime"
        />
      </div>
      <div class="time-input">
        <input
          :id="timeId"
          v-model="timeValue"
          type="time"
          class="form-input"
          :required="required"
          lang="en"
          @change="updateDateTime"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  dateId: {
    type: String,
    default: ''
  },
  timeId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const dateValue = ref('')
const timeValue = ref('')

// when external value changes, update internal value
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue)
    dateValue.value = date.toISOString().split('T')[0]
    timeValue.value = date.toTimeString().slice(0, 5)
  } else {
    dateValue.value = ''
    timeValue.value = ''
  }
}, { immediate: true })

// when internal value changes, update external value
const updateDateTime = () => {
  if (dateValue.value && timeValue.value) {
    // ensure time format contains seconds, backend expects YYYY-MM-DDTHH:MM:SS format
    const timeWithSeconds = timeValue.value.length === 5 ? `${timeValue.value}:00` : timeValue.value
    const dateTimeString = `${dateValue.value}T${timeWithSeconds}`
    emit('update:modelValue', dateTimeString)
  } else {
    emit('update:modelValue', '')
  }
}

// initialize when component is mounted
onMounted(() => {
  if (props.modelValue) {
    const date = new Date(props.modelValue)
    dateValue.value = date.toISOString().split('T')[0]
    timeValue.value = date.toTimeString().slice(0, 5)
  }
  
  // force date and time input box language to English
  const dateInputs = document.querySelectorAll('input[type="date"]')
  const timeInputs = document.querySelectorAll('input[type="time"]')
  
  dateInputs.forEach(input => {
    input.setAttribute('lang', 'en')
    input.setAttribute('data-lang', 'en')
  })
  
  timeInputs.forEach(input => {
    input.setAttribute('lang', 'en')
    input.setAttribute('data-lang', 'en')
  })
})
</script>

<style scoped>
.datetime-picker {
  width: 100%;
}

.datetime-inputs {
  display: flex;
  gap: 0.5rem;
}

.date-input {
  flex: 1;
}

.time-input {
  flex: 1;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  color: #374151;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

/* ensure date and time input box uses English format */
.form-input[type="date"]::-webkit-calendar-picker-indicator {
  filter: none;
}

.form-input[type="time"]::-webkit-calendar-picker-indicator {
  filter: none;
}

/* force date and time input box to use English format */
.form-input[type="date"],
.form-input[type="time"] {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* ensure date picker displays English */
.form-input[type="date"]::-webkit-datetime-edit {
  color: #374151;
}

.form-input[type="date"]::-webkit-datetime-edit-fields-wrapper {
  color: #374151;
}

.form-input[type="date"]::-webkit-datetime-edit-text {
  color: #374151;
}

.form-input[type="date"]::-webkit-datetime-edit-month-field,
.form-input[type="date"]::-webkit-datetime-edit-day-field,
.form-input[type="date"]::-webkit-datetime-edit-year-field {
  color: #374151;
}

/* ensure time picker displays English */
.form-input[type="time"]::-webkit-datetime-edit {
  color: #374151;
}

.form-input[type="time"]::-webkit-datetime-edit-fields-wrapper {
  color: #374151;
}

.form-input[type="time"]::-webkit-datetime-edit-text {
  color: #374151;
}

.form-input[type="time"]::-webkit-datetime-edit-hour-field,
.form-input[type="time"]::-webkit-datetime-edit-minute-field {
  color: #374151;
}
</style> 