import { ref, onMounted } from 'vue'
import { eventApi } from '../services/api'

// 开发模式标志 - 设置为false时使用真实API
const MOCK_MODE = false

// Reactive state
const events = ref([])
const myEvents = ref([])
const currentEvent = ref(null)
const isLoading = ref(false)
const error = ref(null)

// 格式化日期时间为ISO格式（包含秒）
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return null
  
  // 如果已经是完整格式，直接返回
  if (dateTimeString.includes('T') && dateTimeString.length >= 19) {
    return dateTimeString
  }
  
  // 如果是ISO格式但缺少秒，添加秒
  if (dateTimeString.includes('T') && dateTimeString.length === 16) {
    return dateTimeString + ':00'
  }
  
  return dateTimeString
}

// 真实API函数
const realCreateEvent = async (eventData) => {
  try {
    isLoading.value = true
    error.value = null
    
    // 转换前端数据格式为后端格式
    const backendEventData = {
      title: eventData.title,
      description: eventData.description,
      imageUrl: eventData.imageUrl, // 添加imageUrl字段
      categoryId: eventData.category,
      location: eventData.location,
      eventDate: formatDateTime(eventData.eventDate),
      endDate: formatDateTime(eventData.endDate),
      price: parseFloat(eventData.price),
      capacity: parseInt(eventData.quantity), // 前端quantity对应后端capacity
      remainingQuantity: parseInt(eventData.quantity), // 初始时remainingQuantity等于capacity
      startTime: formatDateTime(eventData.startTime),
      endTime: formatDateTime(eventData.endTime)
    }
    
    const response = await eventApi.createEvent(backendEventData)
    console.log('[useEvent] Create event response:', response)
    
    // 检查响应格式
    let createdEvent = null
    
    if (response && response.code === 0 && response.data) {
      createdEvent = response.data
    } else if (response && typeof response === 'object') {
      createdEvent = response
    } else {
      console.warn('[useEvent] Unexpected create event response format:', response)
      createdEvent = null
    }
    
    return eventData
  } catch (err) {
    console.error('Failed to create event:', err)
    error.value = err.message || 'Failed to create event'
    throw err
  } finally {
    isLoading.value = false
  }
}

const realGetEventById = async (id) => {
  try {
    isLoading.value = true
    error.value = null
    const response = await eventApi.getEventById(id)
    console.log('[useEvent] Event response:', response)
    
    // 检查响应格式
    let eventData = null
    
    if (response && response.code === 0 && response.data) {
      eventData = response.data
    } else if (response && typeof response === 'object') {
      eventData = response
    } else {
      console.warn('[useEvent] Unexpected event response format:', response)
      eventData = null
    }
    
    currentEvent.value = eventData
    return eventData
  } catch (err) {
    console.error('Failed to fetch event:', err)
    error.value = err.message || 'Failed to fetch event'
    throw err
  } finally {
    isLoading.value = false
  }
}

const realGetEvents = async (params = {}) => {
  try {
    isLoading.value = true
    error.value = null
    const { data } = await eventApi.getEvents(params)
    const response = data

    console.log('[useEvent] Events response:', response)
    console.log('[useEvent] getEvents called with params:', params)
    
    // 检查响应格式 - 可能是 CommonResponse 格式或直接数组
    let eventsData = null
    
    if (response && response.code === 0 && response.data) {
      // CommonResponse 格式: { code: 0, message: 'Success', data: [...] }
      eventsData = response.data
    } else if (Array.isArray(response)) {
      // 直接数组格式: [...]
      eventsData = response
    } else {
      console.warn('[useEvent] Unexpected response format:', response)
      eventsData = []
    }
    
    // 确保eventsData是数组
    if (Array.isArray(eventsData)) {
      events.value = eventsData
    } else {
      console.warn('[useEvent] Events data is not an array:', eventsData)
      events.value = []
    }
    
    return events.value
  } catch (err) {
    console.error('Failed to fetch events:', err)
    error.value = err.message || 'Failed to fetch events'
    // 确保在错误时也设置为空数组
    events.value = []
    throw err
  } finally {
    isLoading.value = false
  }


}

const realSearchEvents = async (categoryId, keyword) => {
  try {
    isLoading.value = true
    error.value = null
    const response = await eventApi.searchEvents(categoryId, keyword)
    console.log('[useEvent] Search response:', response)
    
    // 检查响应格式
    let eventsData = null
    
    if (response && response.code === 0 && response.data) {
      eventsData = response.data
    } else if (Array.isArray(response)) {
      eventsData = response
    } else {
      console.warn('[useEvent] Unexpected search response format:', response)
      eventsData = []
    }
    
    // 确保eventsData是数组
    if (Array.isArray(eventsData)) {
      events.value = eventsData
    } else {
      console.warn('[useEvent] Search events data is not an array:', eventsData)
      events.value = []
    }
    
    return events.value
  } catch (err) {
    console.error('Failed to search events:', err)
    error.value = err.message || 'Failed to search events'
    // 确保在错误时也设置为空数组
    events.value = []
    throw err
  } finally {
    isLoading.value = false
  }
}

const realGetMyEvents = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await eventApi.getMyEvents()
    console.log('[useEvent] My events response:', response)
    
    // 检查响应格式
    let eventsData = null
    
    if (response && response.code === 0 && response.data) {
      eventsData = response.data
    } else if (Array.isArray(response)) {
      eventsData = response
    } else {
      console.warn('[useEvent] Unexpected my events response format:', response)
      eventsData = []
    }
    
    // 确保eventsData是数组
    if (Array.isArray(eventsData)) {
      myEvents.value = eventsData
    } else {
      console.warn('[useEvent] My events data is not an array:', eventsData)
      myEvents.value = []
    }
    
    return myEvents.value
  } catch (err) {
    console.error('Failed to fetch my events:', err)
    error.value = err.message || 'Failed to fetch my events'
    // 确保在错误时也设置为空数组
    myEvents.value = []
    throw err
  } finally {
    isLoading.value = false
  }
}

const realUpdateEvent = async (id, eventData) => {
  try {
    isLoading.value = true
    error.value = null
    const response = await eventApi.updateEvent(id, eventData)
    console.log('[useEvent] Update event response:', response)
    
    // 检查响应格式
    let result = null
    
    if (response && response.code === 0 && response.data) {
      result = response.data
    } else if (response && typeof response === 'object') {
      result = response
    } else {
      console.warn('[useEvent] Unexpected update event response format:', response)
      result = null
    }
    
    return result
  } catch (err) {
    console.error('Failed to update event:', err)
    error.value = err.message || 'Failed to update event'
    throw err
  } finally {
    isLoading.value = false
  }
}

const realDeleteEvent = async (id) => {
  try {
    isLoading.value = true
    error.value = null
    const response = await eventApi.deleteEvent(id)
    console.log('[useEvent] Delete event response:', response)
    
    // 检查响应格式
    let result = null
    
    if (response && response.code === 0 && response.data) {
      result = response.data
    } else if (response && typeof response === 'object') {
      result = response
    } else {
      console.warn('[useEvent] Unexpected delete event response format:', response)
      result = null
    }
    
    return result
  } catch (err) {
    console.error('Failed to delete event:', err)
    error.value = err.message || 'Failed to delete event'
    throw err
  } finally {
    isLoading.value = false
  }
}

// 模拟API函数
const mockCreateEvent = async (eventData) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const newEvent = {
    id: Date.now(),
    ...eventData,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  }
  return newEvent
}

const mockGetEvents = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  events.value = [
    {
      id: 1,
      title: 'Summer Music Festival 2024',
      description: 'A fantastic music festival',
      categoryId: 1,
      location: 'Central Park, NYC',
      eventDate: '2024-07-15',
      price: 89,
      status: 'ACTIVE'
    }
  ]
  return events.value
}

const mockGetMyEvents = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  myEvents.value = [
    {
      id: 1,
      title: 'My Music Event',
      description: 'My created event',
      categoryId: 1,
      location: 'My Venue',
      eventDate: '2024-08-15',
      price: 50,
      status: 'ACTIVE'
    }
  ]
  return myEvents.value
}

// 公共函数
const createEvent = async (eventData) => {
  if (MOCK_MODE) {
    return await mockCreateEvent(eventData)
  } else {
    return await realCreateEvent(eventData)
  }
}

const getEventById = async (id) => {
  if (MOCK_MODE) {
    // 模拟获取事件详情
    await new Promise(resolve => setTimeout(resolve, 500))
    currentEvent.value = events.value.find(e => e.id === id) || null
    return currentEvent.value
  } else {
    return await realGetEventById(id)
  }
}

const getEvents = async (params = {}) => {
  if (MOCK_MODE) {
    return await mockGetEvents()
  } else {
    return await realGetEvents(params)
  }
}

const searchEvents = async (categoryId, keyword) => {
  if (MOCK_MODE) {
    return await mockGetEvents()
  } else {
    return await realSearchEvents(categoryId, keyword)
  }
}

const getMyEvents = async () => {
  if (MOCK_MODE) {
    return await mockGetMyEvents()
  } else {
    return await realGetMyEvents()
  }
}

const updateEvent = async (id, eventData) => {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { message: 'Event updated successfully' }
  } else {
    return await realUpdateEvent(id, eventData)
  }
}

const deleteEvent = async (id) => {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { message: 'Event deleted successfully' }
  } else {
    return await realDeleteEvent(id)
  }
}

// 创建 useEvent composable 函数
const useEvent = () => {
  return {
    events,
    myEvents,
    currentEvent,
    isLoading,
    error,
    createEvent,
    getEventById,
    getEvents,
    searchEvents,
    getMyEvents,
    updateEvent,
    deleteEvent
  }
}

export {
  useEvent,
  events,
  myEvents,
  currentEvent,
  isLoading,
  error
} 