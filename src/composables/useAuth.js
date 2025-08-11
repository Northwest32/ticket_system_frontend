import { ref, computed } from 'vue'
import { userApi } from '../services/api'

// 开发模式标志 - 设置为false时使用真实API
const MOCK_MODE = false

// Reactive state
const isLoggedIn = ref(false)
const userInfo = ref(null)

// Computed properties
const isAuthenticated = computed(() => isLoggedIn.value)
const currentUser = computed(() => userInfo.value)

// 模拟API函数
const mockLogin = async (email, password) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟验证逻辑
  if (email === 'buyer@test.com' && password === 'password') {
    return {
      token: 'mock-jwt-token-buyer',
      user: {
        id: 1,
        username: email,
        email: email,
        userType: 'buyer',
        name: 'Test Buyer'
      }
    }
  } else if (email === 'organizer@test.com' && password === 'password') {
    return {
      token: 'mock-jwt-token-organizer',
      user: {
        id: 2,
        username: email,
        email: email,
        userType: 'organizer',
        name: 'Test Organizer',
        description: 'Leading event organizer specializing in music festivals and live performances. We bring the best artists and create unforgettable experiences for our audience.'
      }
    }
  } else {
    throw new Error('Invalid credentials')
  }
}

const mockRegister = async (userData) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟注册成功
  return {
    message: 'Registration successful',
    user: {
      id: Math.floor(Math.random() * 1000),
      username: userData.username,
      email: userData.email,
      userType: userData.userType?.toLowerCase(),
      name: userData.name
    }
  }
}

const mockForgetPassword = async (email) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟发送重置邮件成功
  return {
    message: 'Password reset email sent successfully'
  }
}

// Functions
const login = (token, user) => {
  // 只有在token还没有存储时才存储（避免重复存储）
  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', token)
  }
  // 确保userType是小写的
  const normalizedUser = { ...user }
  if (normalizedUser.userType) {
    normalizedUser.userType = normalizedUser.userType.toLowerCase()
  }
  localStorage.setItem('userInfo', JSON.stringify(normalizedUser))
  isLoggedIn.value = true
  userInfo.value = normalizedUser
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  isLoggedIn.value = false
  userInfo.value = null
}

const initializeAuth = () => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('userInfo')
  
  if (token && user) {
    try {
      isLoggedIn.value = true
      const parsedUser = JSON.parse(user)
      // 确保userType是小写的
      if (parsedUser.userType) {
        parsedUser.userType = parsedUser.userType.toLowerCase()
      }
      userInfo.value = parsedUser
    } catch (error) {
      console.error('Failed to parse user info:', error)
      logout()
    }
  }
  
  // 返回一个立即解析的 Promise
  return Promise.resolve()
}

// 刷新用户信息（从后端获取最新信息）
const refreshUserInfo = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('[useAuth] No token found, cannot refresh user info')
      return false
    }
    
    const profileResponse = await userApi.getProfile()
    console.log('[useAuth] Profile refresh response:', profileResponse)
    
    // 检查profile响应格式
    let userProfile
    if (profileResponse && profileResponse.code === 0 && profileResponse.data) {
      // CommonResponse 格式
      userProfile = profileResponse.data
    } else if (typeof profileResponse === 'object') {
      // 直接对象格式（兼容旧格式）
      userProfile = profileResponse
    } else {
      console.warn('[useAuth] Unexpected profile response format:', profileResponse)
      return false
    }
    
    // 构建用户信息
    const user = {
      id: userProfile.id,
      username: userProfile.username,
      email: userProfile.username,
      userType: userProfile.userType?.toLowerCase(),
      name: userProfile.username,
      avatarUrl: userProfile.avatarUrl || null
    }
    
    // 更新本地状态和localStorage
    userInfo.value = user
    localStorage.setItem('userInfo', JSON.stringify(user))
    
    console.log('[useAuth] User info refreshed successfully:', user)
    return true
  } catch (error) {
    console.error('[useAuth] Failed to refresh user info:', error)
    return false
  }
}

// 真实API函数
const realLogin = async (email, password) => {
  try {
    const loginResponse = await userApi.login(email, password)
    console.log('[useAuth] Login response:', loginResponse)
    
    // 检查响应格式 - 可能是 CommonResponse 格式或直接字符串
    let token
    if (loginResponse && loginResponse.code === 0 && loginResponse.data) {
      // CommonResponse 格式: { code: 0, message: "Login successful", data: "token" }
      token = loginResponse.data
    } else if (typeof loginResponse === 'string') {
      // 直接字符串格式（兼容旧格式）
      token = loginResponse
    } else {
      console.warn('[useAuth] Unexpected login response format:', loginResponse)
      throw new Error('Invalid login response format')
    }
    
    // 先存储token，这样getProfile请求就能携带Authorization头
    localStorage.setItem('token', token)
    
    const profileResponse = await userApi.getProfile()
    console.log('[useAuth] Profile response:', profileResponse)
    
    // 检查profile响应格式
    let userProfile
    if (profileResponse && profileResponse.code === 0 && profileResponse.data) {
      // CommonResponse 格式
      userProfile = profileResponse.data
    } else if (typeof profileResponse === 'object') {
      // 直接对象格式（兼容旧格式）
      userProfile = profileResponse
    } else {
      console.warn('[useAuth] Unexpected profile response format:', profileResponse)
      throw new Error('Invalid profile response format')
    }
    
    // 构建用户信息
    const user = {
      id: userProfile.id, // 使用后端返回的真实ID
      username: userProfile.username,
      email: userProfile.username, // 后端返回的username就是email
      userType: userProfile.userType?.toLowerCase(), // 确保userType是小写的
      name: userProfile.username, // 临时使用username作为name
      avatarUrl: userProfile.avatarUrl || null // 添加头像URL
    }
    
    return { token, user }
  } catch (error) {
    // 如果出错，清除可能已经存储的token
    localStorage.removeItem('token')
    console.error('[useAuth] Login error:', error)
    
    // 处理不同的错误格式
    let errorMessage = 'Login failed'
    
    if (error.response?.data?.message) {
      // CommonResponse格式: { code: 1, message: "Invalid email or password", data: null }
      errorMessage = error.response.data.message
    } else if (error.response?.data) {
      // 直接错误对象
      errorMessage = typeof error.response.data === 'string' ? error.response.data : 'Invalid email or password'
    } else if (error.message) {
      // Error对象
      errorMessage = error.message
    }
    
    throw new Error(errorMessage)
  }
}

const realRegister = async (userData) => {
  try {
    const response = await userApi.register(userData)
    console.log('[useAuth] Register response:', response)
    
    // 检查响应格式
    let message
    if (response && response.code === 0 && response.data) {
      // CommonResponse 格式
      message = response.data
    } else if (typeof response === 'string') {
      // 直接字符串格式（兼容旧格式）
      message = response
    } else {
      console.warn('[useAuth] Unexpected register response format:', response)
      throw new Error('Invalid register response format')
    }
    
    return {
      message: message,
      user: {
        id: Math.floor(Math.random() * 1000),
        username: userData.username,
        email: userData.email,
        userType: userData.userType?.toLowerCase(),
        name: userData.username
      }
    }
  } catch (error) {
    console.error('[useAuth] Register error:', error)
    
    // 处理不同的错误格式
    let errorMessage = 'Registration failed'
    
    if (error.response?.data?.message) {
      // CommonResponse格式
      errorMessage = error.response.data.message
    } else if (error.response?.data) {
      // 直接错误对象
      errorMessage = typeof error.response.data === 'string' ? error.response.data : 'Registration failed'
    } else if (error.message) {
      // Error对象
      errorMessage = error.message
    }
    
    throw new Error(errorMessage)
  }
}

const realForgetPassword = async (resetData) => {
  try {
    const response = await userApi.resetPassword(resetData)
    console.log('[useAuth] Reset password response:', response)
    
    // 检查响应格式
    let message
    if (response && response.code === 0 && response.data) {
      // CommonResponse 格式
      message = response.data
    } else if (typeof response === 'string') {
      // 直接字符串格式（兼容旧格式）
      message = response
    } else {
      console.warn('[useAuth] Unexpected reset password response format:', response)
      throw new Error('Invalid reset password response format')
    }
    
    return { message: message }
  } catch (error) {
    console.error('[useAuth] Reset password error:', error)
    
    // 处理不同的错误格式
    let errorMessage = 'Password reset failed'
    
    if (error.response?.data?.message) {
      // CommonResponse格式
      errorMessage = error.response.data.message
    } else if (error.response?.data) {
      // 直接错误对象
      errorMessage = typeof error.response.data === 'string' ? error.response.data : 'Password reset failed'
    } else if (error.message) {
      // Error对象
      errorMessage = error.message
    }
    
    throw new Error(errorMessage)
  }
}

// 创建 useAuth composable 函数
const useAuth = () => {
  return {
    isAuthenticated,
    currentUser,
    login,
    logout,
    initializeAuth,
    refreshUserInfo,
    MOCK_MODE,
    // 根据模式返回不同的函数
    loginUser: MOCK_MODE ? mockLogin : realLogin,
    registerUser: MOCK_MODE ? mockRegister : realRegister,
    forgetPassword: MOCK_MODE ? mockForgetPassword : realForgetPassword
  }
}

export {
  useAuth,
  isAuthenticated,
  currentUser,
  login,
  logout,
  initializeAuth,
  MOCK_MODE
} 