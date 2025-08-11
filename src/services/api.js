// API config
import { currentApiConfig } from '../config/api'
import axios from 'axios'

const api = axios.create({
  baseURL: currentApiConfig.baseURL,
  timeout: currentApiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    
    // debug: print full request info
    console.log('🔍 Request config:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: config.baseURL + config.url
    })
    
    // define protected paths (paths that need Authorization header)
    const protectedPaths = [
      '/events/my', // get my events
      '/me', // get user info
      '/orders', // order related
      '/bookmarks', // bookmark related
      '/follows', // follow related
      '/comments', // comment related
      '/payments', // payment related
      '/refund-request', // refund related
      '/seckill', // seckill related
      '/organizer-profile' // organizer profile
    ]
    
    // check if current request path needs authentication
    let isProtectedPath = protectedPaths.some(path => config.url.includes(path))
    
    // special handling: /events path only needs authentication for POST/PUT/DELETE methods, GET method does not need authentication
    if (config.url.includes('/events') && !config.url.includes('/events/my')) {
      isProtectedPath = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase())
    }
    
    // for protected paths with token, add Authorization header
    if (token && isProtectedPath) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔍 Adding Authorization header for:', config.url, 'Method:', config.method)
    } else {
      console.log('🔍 No Authorization header for:', config.url, 'Method:', config.method, 'Protected:', isProtectedPath)
    }
    
    // for multipart/form-data request, do not set Content-Type, let browser automatically set
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    console.log('🔍 Response received:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText
    })
    return response
  },
  (error) => {
    console.error('🔍 API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message
    })
    
    if (error.response?.status === 401) {
      // token expired or invalid, clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      window.location.href = '/login'
    }
    
    // handle CORS error
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.error('CORS Error: Make sure the backend server is running and CORS is configured properly')
    }
    
    return Promise.reject(error)
  }
)

// user related API
export const userApi = {
  // user register
  register: async (userData) => {
    const response = await api.post('/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      userType: userData.userType
    })
    return response.data
  },

  // user login
  login: async (email, password) => {
    const response = await api.post('/login', {
      email: email,
      password: password
    })
    return response.data
  },

  // get user info
  getProfile: async () => {
    const response = await api.get('/me')
    return response.data
  },

  // reset password
  resetPassword: async (resetData) => {
    const response = await api.post('/reset-password', {
      email: resetData.email,
      newPassword: resetData.newPassword
    })
    return response.data
  },

  // get user info by ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  }
}

// category related API
export const categoryApi = {
  // get all categories
  getAllCategories: async () => {
    const response = await api.get('/categories')
    return response.data
  }
}

// event related API
export const eventApi = {
  // create event
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData)
    return response.data
  },

  // get event details
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`)
    return response.data
  },

  // get event list (buyer)
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params })
    return response.data
  },

  // search events
  searchEvents: async (categoryId, keyword) => {
    const params = {}
    if (categoryId) params.categoryId = categoryId
    if (keyword) params.keyword = keyword
    const response = await api.get('/events', { params })
    return response.data
  },

  // get organizer's event list
  getMyEvents: async () => {
    const response = await api.get('/events/my')
    return response.data
  },

  // update event
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData)
    return response.data
  },

  // delete event
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`)
    return response.data
  },

  // get events by organizer
  getEventsByOrganizer: async (organizerId) => {
    const response = await api.get(`/events/organizer/${organizerId}`)
    return response.data
  }
}

// organizer profile related API
export const organizerProfileApi = {
  // get organizer profile
  getProfile: async (organizerId) => {
    const response = await api.get(`/organizer-profile/${organizerId}`)
    return response.data
  },

  // save organizer profile
  saveProfile: async (profileData) => {
    const response = await api.post('/organizer-profile/save', profileData)
    return response.data
  },

  // delete organizer profile
  deleteProfile: async (organizerId) => {
    const response = await api.delete(`/organizer-profile/${organizerId}`)
    return response.data
  }
}

// user avatar related API
export const userAvatarApi = {
  // update user avatar
  updateAvatar: async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await api.post('/update-avatar', formData)
    return response.data
  }
}

// image upload related API
export const imageApi = {
  // upload event cover image
  uploadEventImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await api.post('/upload-event-image', formData)
    return response.data
  }
}

// comment related API
export const commentApi = {
  // get comments by organizer
  getCommentsByOrganizer: async (organizerId) => {
    const response = await api.get(`/organizers/${organizerId}/comments`)
    return response.data
  },

  // get comments by event
  getCommentsByEvent: async (eventId) => {
    const response = await api.get(`/events/${eventId}/comments`)
    return response.data
  },

  // create comment
  createComment: async (commentData) => {
    const response = await api.post('/comments', commentData)
    return response.data
  },

  // delete comment
  deleteComment: async (commentId, userId) => {
    const response = await api.delete(`/comments/${commentId}?userId=${userId}`)
    return response.data
  },

  // get comments given by user
  getGivenComments: async (userId) => {
    const response = await api.get(`/users/${userId}/comments/given`)
    return response.data
  },

  // get comments received by user
  getReceivedComments: async (userId) => {
    const response = await api.get(`/users/${userId}/comments/received`)
    return response.data
  }
}

// seckill related API
export const seckillApi = {
  // seckill buy ticket
  seckill: async (eventId, quantity = 1) => {
    const response = await api.post(`/seckill/${eventId}?quantity=${quantity}`)
    return response.data
  }
}

// order related API
export const orderApi = {
  // create order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData)
    return response.data
  },

  // get my orders
  getMyOrders: async () => {
    const response = await api.get('/orders')
    return response.data
  },

  // get order details
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`)
    return response.data
  },

  // get all orders for an event (organizer use)
  getOrdersByEventId: async (eventId) => {
    const response = await api.get(`/orders/event/${eventId}`)
    return response.data
  },

  // update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status })
    return response.data
  }
}

// bookmark related API
export const bookmarkApi = {
  // add bookmark
  addBookmark: async (eventId) => {
    const response = await api.post('/bookmarks', { eventId })
    return response.data
  },

  // remove bookmark
  removeBookmark: async (eventId) => {
    const response = await api.delete(`/bookmarks/${eventId}`)
    return response.data
  },

  // get my bookmarks
  getMyBookmarks: async () => {
    const response = await api.get('/bookmarks/my/with-details')
    return response.data
  },

  // check if event is bookmarked
  checkBookmarkStatus: async (eventId) => {
    const response = await api.get(`/bookmarks/check/${eventId}`)
    return response.data
  },

  // get event's bookmark count
  getBookmarkCount: async (eventId) => {
    const response = await api.get(`/bookmarks/count/${eventId}`)
    return response.data
  }
}

// follow related API
export const followApi = {
  // follow organizer
  followOrganizer: async (organizerId) => {
    const response = await api.post('/follows', { organizerId })
    return response.data
  },

  // unfollow organizer
  unfollowOrganizer: async (organizerId) => {
    const response = await api.delete(`/follows/${organizerId}`)
    return response.data
  },

  // get my follows
  getMyFollows: async () => {
    const response = await api.get('/follows/my')
    return response.data
  },

  // check if organizer is followed
  checkFollowStatus: async (organizerId) => {
    const response = await api.get(`/follows/check/${organizerId}`)
    return response.data
  },

  // get organizer's follower count
  getFollowerCount: async (organizerId) => {
    const response = await api.get(`/follows/count/${organizerId}`)
    return response.data
  }
}

// refund related API
export const refundApi = {
  // submit refund request
  createRefundRequest: async (refundData) => {
    const response = await api.post('/refund-request', {
      orderId: refundData.orderId,
      reason: refundData.reason
    })
    return response.data
  },

  // get my refund requests
  getMyRefundRequests: async () => {
    const response = await api.get('/refund-request/my')
    return response.data
  },

  // get refund request details
  getRefundRequestById: async (id) => {
    const response = await api.get(`/refund-request/${id}`)
    return response.data
  },

  // organizer approve refund request (agree)
  approveRefundRequest: async (refundId, approvalData) => {
    const response = await api.post(`/refund-request/${refundId}/approve`, approvalData)
    return response.data
  },

  // organizer approve refund request (reject)
  rejectRefundRequest: async (refundId, approvalData) => {
    const response = await api.post(`/refund-request/${refundId}/reject`, approvalData)
    return response.data
  }
}

// export api instance, so it can be used in other places
export default api 