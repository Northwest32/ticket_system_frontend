<template>
  <div class="search-container">
    <div class="search-bar">
      <div class="search-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for events, organizers, or categories..."
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <button class="search-button" @click="handleSearch">
        Search
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}
</script>

<style scoped>
.search-container {
  max-width: 800px;
  width: 90%;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 10;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 0.3rem 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.3s, border-color 0.3s, background-color 0.3s;
  height: 48px;
  width: 100%;
}

.search-bar:focus-within {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  background-color: rgba(255, 255, 255, 0.98);
  border-color: rgba(255, 255, 255, 0.4);
}

.search-icon {
  color: #757575;
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.0rem;
  background: transparent;
  line-height: 48px;
  height: 48px;
  color: #222;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-button {
  background: #C26CB5;
  color: white;
  border: 1px solid #C26CB5;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  margin-left: 1rem;
  transition: background 0.2s, box-shadow 0.2s;
}

.search-button:hover {
  background: #a85a9e;
  border-color: #a85a9e;
  box-shadow: 0 4px 12px rgba(194, 108, 181, 0.3);
}

@media (max-width: 768px) {
  .search-container {
    padding: 0 0.5rem;
    max-width: 100%;
  }

  .search-bar {
    padding: 0.3rem 0.8rem;
    height: 40px;
  }
  .search-input {
    font-size: 1rem;
    height: 40px;
    line-height: 40px;
  }
  .search-button {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
    margin-left: 0.5rem;
  }
}

@media (max-width: 480px) {
  .search-bar {
    flex-direction: column;
    gap: 0.5rem;
    height: auto;
    padding: 0.8rem 0.5rem;
  }
  .search-icon {
    margin-right: 0;
    margin-bottom: 0.2rem;
  }
  .search-button {
    margin-left: 0;
    width: 100%;
    border-radius: 16px;
    font-size: 0.98rem;
  }
}

</style> 