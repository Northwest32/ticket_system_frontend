import { isOrganizer } from './userType'

// Check if user can purchase tickets
export const canBuyTickets = (userType) => {
  return !isOrganizer(userType)
}

// Check if user can bookmark events
export const canBookmarkEvents = (userType) => {
  return !isOrganizer(userType)
}

// Check if user can follow organizers
export const canFollowOrganizers = (userType) => {
  return !isOrganizer(userType)
}

// Check if user can create events
export const canCreateEvents = (userType) => {
  return isOrganizer(userType)
}

// Check if user can manage events
export const canManageEvents = (userType) => {
  return isOrganizer(userType)
}

// Get permission restriction message
export const getPermissionMessage = (action, userType) => {
  if (isOrganizer(userType)) {
    switch (action) {
      case 'buy_tickets':
        return 'Organizers cannot purchase tickets. Please switch to buyer account.'
      case 'bookmark_events':
        return 'Organizers cannot bookmark events. Please switch to buyer account.'
      case 'follow_organizers':
        return 'Organizers cannot follow other organizers. Please switch to buyer account.'
      case 'create_events':
        return 'Only organizers can create events.'
      case 'manage_events':
        return 'Only organizers can manage events.'
      default:
        return 'This action is not available for your account type.'
    }
  }
  return ''
}

// Check if user has specific permission
export const hasPermission = (permission, userType) => {
  switch (permission) {
    case 'buy_tickets':
      return canBuyTickets(userType)
    case 'bookmark_events':
      return canBookmarkEvents(userType)
    case 'follow_organizers':
      return canFollowOrganizers(userType)
    case 'create_events':
      return canCreateEvents(userType)
    case 'manage_events':
      return canManageEvents(userType)
    default:
      return false
  }
} 