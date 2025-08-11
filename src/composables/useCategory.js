import { ref, onMounted } from 'vue'
import { categoryApi } from '../services/api'

// 开发模式标志 - 设置为false时使用真实API
const MOCK_MODE = false

// Reactive state
const categories = ref([])
const isLoading = ref(false)
const error = ref(null)

// 模拟分类数据
const mockCategories = [
  { id: 1, name: 'Music', description: 'Music performances, singing, open-mic, etc.' },
  { id: 2, name: 'Art & Culture', description: 'Art exhibitions, drama, handcraft, reading, etc.' },
  { id: 3, name: 'Sports & Outdoors', description: 'Sports, outdoor, fitness, hiking, etc.' },
  { id: 4, name: 'Tech & Learning', description: 'Talks, workshops, technology, education, sharing, etc.' },
  { id: 5, name: 'Other', description: 'Other uncategorized activities' }
]

// 真实API函数
const realGetCategories = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await categoryApi.getAllCategories()
    
    console.log('[useCategory] Categories response:', response)
    
    // 处理后端返回的数据格式
    if (response.code === 0 && response.data) {
      // 确保response.data是数组
      if (Array.isArray(response.data)) {
        categories.value = response.data
      } else {
        console.warn('[useCategory] Response data is not an array:', response.data)
        categories.value = []
      }
    } else {
      console.warn('[useCategory] Invalid response format:', response)
      categories.value = []
      throw new Error(response.message || 'Failed to fetch categories')
    }
  } catch (err) {
    console.error('Failed to fetch categories:', err)
    error.value = err.message || 'Failed to fetch categories'
    // 确保在错误时也设置为空数组
    categories.value = []
    throw err
  } finally {
    isLoading.value = false
  }
}

// 模拟API函数
const mockGetCategories = async () => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  categories.value = mockCategories
}

// 获取分类列表
const fetchCategories = async () => {
  if (MOCK_MODE) {
    await mockGetCategories()
  } else {
    await realGetCategories()
  }
}

// 根据ID获取分类
const getCategoryById = (id) => {
  return categories.value.find(category => category.id === id)
}

// 根据名称获取分类
const getCategoryByName = (name) => {
  return categories.value.find(category => category.name === name)
}

// 初始化分类数据
const initializeCategories = async () => {
  if (categories.value.length === 0) {
    await fetchCategories()
  }
}

// 创建 useCategory composable 函数
const useCategory = () => {
  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    getCategoryById,
    getCategoryByName,
    initializeCategories
  }
}

export {
  useCategory,
  categories,
  isLoading,
  error
} 