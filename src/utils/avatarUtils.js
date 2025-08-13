// global avatar URL processing tool

/**
 * process avatar URL, unify conversion logic
 * @param {string} avatarUrl - avatar URL
 * @returns {string} processed avatar URL
 */
export function getAvatarUrl(avatarUrl) {
  if (!avatarUrl) return ''
  
  // if base64 format, return directly
  if (avatarUrl.startsWith('data:')) {
    return avatarUrl
  }
  
  // if Cloudinary URL, return directly
  if (avatarUrl.includes('cloudinary.com')) {
    return avatarUrl
  }
  
  // if complete HTTP/HTTPS URL, return directly
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl
  }
  
  // if relative path, add backend base URL
  if (avatarUrl.startsWith('/')) {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://sad-sarina-yezyeats-d7548659.koyeb.app/api'
    // 移除 /api 后缀，因为头像路径通常是 /uploads/avatars/...
    const baseUrl = backendUrl.replace('/api', '')
    return baseUrl + avatarUrl
  }
  
  return avatarUrl
}

/**
 * check if avatar URL is Cloudinary URL
 * @param {string} avatarUrl - avatar URL
 * @returns {boolean}
 */
export function isCloudinaryUrl(avatarUrl) {
  return avatarUrl && avatarUrl.includes('cloudinary.com')
}

/**
 * get avatar display text
 * @param {string} name - username
 * @returns {string} initials
 */
export function getAvatarInitials(name) {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}
