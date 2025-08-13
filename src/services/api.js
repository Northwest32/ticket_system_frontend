// API services using unified HTTP instance
import http from '../api/http'
import { uploadAvatar, uploadEventCover, uploadEventImage } from '../api/cloudinary'

// user related API
export const userApi = {
  // user register
  register: async (userData) => {
    const response = await http.post('/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      userType: userData.userType
    })
    return response.data
  },

  // user login
  login: async (email, password) => {
    const response = await http.post('/login', {
      email: email,
      password: password
    })
    return response.data
  },

  // get user info
  getProfile: async () => {
    const response = await http.get('/me')
    return response.data
  },

  // reset password
  resetPassword: async (resetData) => {
    const response = await http.post('/reset-password', {
      email: resetData.email,
      newPassword: resetData.newPassword
    })
    return response.data
  },

  // get user info by ID
  getUserById: async (userId) => {
    const response = await http.get(`/users/${userId}`)
    return response.data
  },

  // update user avatar using Cloudinary
  updateAvatar: async (file) => {
    try {
      // 1) upload to Cloudinary
      const { url, publicId } = await uploadAvatar(file);
      
      // 2) save URL to backend - only send Cloudinary URL, no local file
      const formData = new FormData();
      formData.append('avatarUrl', url);
      formData.append('publicId', publicId);
      
      const response = await http.post('/update-avatar', formData);
      
      return response.data;
    } catch (error) {
      console.error('Update avatar failed:', error);
      throw error;
    }
  }
}

// category related API
export const categoryApi = {
  // get all categories
  getAllCategories: async () => {
    const response = await http.get('/categories')
    return response.data
  }
}

// event related API
export const eventApi = {
  // create event
  createEvent: async (eventData) => {
    const response = await http.post('/events', eventData)
    return response.data
  },

  // get event details
  getEventById: async (id) => {
    const response = await http.get(`/events/${id}`)
    return response.data
  },

  // get event list (buyer)
  getEvents: async (params = {}) => {
    const response = await http.get('/events', { params })
    return response.data
  },

  // search events
  searchEvents: async (categoryId, keyword) => {
    const params = {}
    if (categoryId) params.categoryId = categoryId
    if (keyword) params.keyword = keyword
    const response = await http.get('/events', { params })
    return response.data
  },

  // get organizer's event list
  getMyEvents: async () => {
    const response = await http.get('/events/my')
    return response.data
  },

  // update event
  updateEvent: async (id, eventData) => {
    const response = await http.put(`/events/${id}`, eventData)
    return response.data
  },

  // delete event
  deleteEvent: async (id) => {
    const response = await http.delete(`/events/${id}`)
    return response.data
  },

  // get events by organizer
  getEventsByOrganizer: async (organizerId) => {
    const response = await http.get(`/events/organizer/${organizerId}`)
    return response.data
  },

  // upload event cover image using Cloudinary
  uploadEventCover: async (file) => {
    try {
      // 1) 上传到Cloudinary
      const { url, publicId } = await uploadEventCover(file);
      
      return { url, publicId };
    } catch (error) {
      console.error('上传事件封面失败:', error);
      throw error;
    }
  },

  // upload event image using Cloudinary
  uploadEventImage: async (file) => {
    try {
      // 1) 上传到Cloudinary
      const { url, publicId } = await uploadEventImage(file);
      
      return { url, publicId };
    } catch (error) {
      console.error('上传事件图片失败:', error);
      throw error;
    }
  }
}

// organizer profile related API
export const organizerProfileApi = {
  // get organizer profile
  getProfile: async (organizerId) => {
    const response = await http.get(`/organizer-profile/${organizerId}`)
    return response.data
  },

  // save organizer profile
  saveProfile: async (profileData) => {
    const response = await http.post('/organizer-profile/save', profileData)
    return response.data
  },

  // delete organizer profile
  deleteProfile: async (organizerId) => {
    const response = await http.delete(`/organizer-profile/${organizerId}`)
    return response.data
  }
}

// comment related API
export const commentApi = {
  // get comments by organizer
  getCommentsByOrganizer: async (organizerId) => {
    const response = await http.get(`/organizers/${organizerId}/comments`)
    return response.data
  },

  // get comments by event
  getCommentsByEvent: async (eventId) => {
    const response = await http.get(`/events/${eventId}/comments`)
    return response.data
  },

  // create comment
  createComment: async (commentData) => {
    const response = await http.post('/comments', commentData)
    return response.data
  },

  // delete comment
  deleteComment: async (commentId, userId) => {
    const response = await http.delete(`/comments/${commentId}?userId=${userId}`)
    return response.data
  },

  // get comments given by user
  getGivenComments: async (userId) => {
    const response = await http.get(`/users/${userId}/comments/given`)
    return response.data
  },

  // get comments received by user
  getReceivedComments: async (userId) => {
    const response = await http.get(`/users/${userId}/comments/received`)
    return response.data
  }
}

// seckill related API
export const seckillApi = {
  // seckill buy ticket
  seckill: async (eventId, quantity = 1) => {
    const response = await http.post(`/seckill/${eventId}?quantity=${quantity}`)
    return response.data
  }
}

// order related API
export const orderApi = {
  // create order
  createOrder: async (orderData) => {
    const response = await http.post('/orders', orderData)
    return response.data
  },

  // get my orders
  getMyOrders: async () => {
    const response = await http.get('/orders')
    return response.data
  },

  // get order details
  getOrderById: async (orderId) => {
    const response = await http.get(`/orders/${orderId}`)
    return response.data
  },

  // get all orders for an event (organizer use)
  getOrdersByEventId: async (eventId) => {
    const response = await http.get(`/orders/event/${eventId}`)
    return response.data
  },

  // update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await http.put(`/orders/${orderId}/status`, { status })
    return response.data
  }
}

// bookmark related API
export const bookmarkApi = {
  // add bookmark
  addBookmark: async (eventId) => {
    const response = await http.post('/bookmarks', { eventId })
    return response.data
  },

  // remove bookmark
  removeBookmark: async (eventId) => {
    const response = await http.delete(`/bookmarks/${eventId}`)
    return response.data
  },

  // get my bookmarks
  getMyBookmarks: async () => {
    const response = await http.get('/bookmarks/my/with-details')
    return response.data
  },

  // check if event is bookmarked
  checkBookmarkStatus: async (eventId) => {
    const response = await http.get(`/bookmarks/check/${eventId}`)
    return response.data
  },

  // get event's bookmark count
  getBookmarkCount: async (eventId) => {
    const response = await http.get(`/bookmarks/count/${eventId}`)
    return response.data
  }
}

// follow related API
export const followApi = {
  // follow organizer
  followOrganizer: async (organizerId) => {
    const response = await http.post('/follows', { organizerId })
    return response.data
  },

  // unfollow organizer
  unfollowOrganizer: async (organizerId) => {
    const response = await http.delete(`/follows/${organizerId}`)
    return response.data
  },

  // get my follows
  getMyFollows: async () => {
    const response = await http.get('/follows/my')
    return response.data
  },

  // check if organizer is followed
  checkFollowStatus: async (organizerId) => {
    const response = await http.get(`/follows/check/${organizerId}`)
    return response.data
  },

  // get organizer's follower count
  getFollowerCount: async (organizerId) => {
    const response = await http.get(`/follows/count/${organizerId}`)
    return response.data
  }
}

// refund related API
export const refundApi = {
  // submit refund request
  createRefundRequest: async (refundData) => {
    const response = await http.post('/refund-request', {
      orderId: refundData.orderId,
      reason: refundData.reason
    })
    return response.data
  },

  // get my refund requests
  getMyRefundRequests: async () => {
    const response = await http.get('/refund-request/my')
    return response.data
  },

  // get refund request details
  getRefundRequestById: async (id) => {
    const response = await http.get(`/refund-request/${id}`)
    return response.data
  },

  // organizer approve refund request (agree)
  approveRefundRequest: async (refundId, approvalData) => {
    const response = await http.post(`/refund-request/${refundId}/approve`, approvalData)
    return response.data
  },

  // organizer approve refund request (reject)
  rejectRefundRequest: async (refundId, approvalData) => {
    const response = await http.post(`/refund-request/${refundId}/reject`, approvalData)
    return response.data
  }
}

// export http instance for direct use
export default http 