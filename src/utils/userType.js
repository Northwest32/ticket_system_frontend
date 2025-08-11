// user type constants
export const USER_TYPES = {
  BUYER: 'buyer',
  ORGANIZER: 'organizer'
}

// user type check function
export const isOrganizer = (userType) => {
  return userType?.toLowerCase() === USER_TYPES.ORGANIZER
}

export const isBuyer = (userType) => {
  return userType?.toLowerCase() === USER_TYPES.BUYER
}

// get user type (standardized to lowercase)
export const normalizeUserType = (userType) => {
  return userType?.toLowerCase()
}

// get home path by user type
export const getHomePath = (userType) => {
  const normalizedType = normalizeUserType(userType)
  if (isOrganizer(normalizedType)) {
    return '/organizer-home'
  } else {
    return '/buyer-home'
  }
}

// user type display name
export const getUserTypeDisplayName = (userType) => {
  const normalizedType = normalizeUserType(userType)
  switch (normalizedType) {
    case USER_TYPES.ORGANIZER:
      return 'Organizer'
    case USER_TYPES.BUYER:
      return 'Buyer'
    default:
      return 'User'
  }
} 