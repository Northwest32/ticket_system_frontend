// 全局头像URL处理工具

/**
 * 处理头像URL，统一转换逻辑
 * @param {string} avatarUrl - 头像URL
 * @returns {string} 处理后的头像URL
 */
export function getAvatarUrl(avatarUrl) {
  if (!avatarUrl) return ''
  
  // 如果是base64格式，直接返回
  if (avatarUrl.startsWith('data:')) {
    return avatarUrl
  }
  
  // 如果是Cloudinary URL，直接返回
  if (avatarUrl.includes('cloudinary.com')) {
    return avatarUrl
  }
  
  // 如果是相对路径，添加后端基础URL
  if (avatarUrl.startsWith('/')) {
    return 'https://sad-sarina-yezyeats-d7548659.koyeb.app' + avatarUrl
  }
  
  // 如果是完整的HTTP/HTTPS URL，直接返回
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl
  }
  
  return avatarUrl
}

/**
 * 检查头像URL是否为Cloudinary URL
 * @param {string} avatarUrl - 头像URL
 * @returns {boolean}
 */
export function isCloudinaryUrl(avatarUrl) {
  return avatarUrl && avatarUrl.includes('cloudinary.com')
}

/**
 * 获取头像的备用显示文本
 * @param {string} name - 用户名
 * @returns {string} 首字母
 */
export function getAvatarInitials(name) {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}
