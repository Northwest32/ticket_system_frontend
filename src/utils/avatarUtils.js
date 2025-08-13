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
  
  // if relative path, return empty string, let component display default avatar
  if (avatarUrl.startsWith('/')) {
    console.warn('Local file path detected for avatar, ignoring:', avatarUrl)
    return ''
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
