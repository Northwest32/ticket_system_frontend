

/**
 * redirect to login page
 * @param {Object} router - Vue Router instance
 * @param {string} currentPath - current page path
 * @param {Object} currentQuery - current page query parameters
 */
export const redirectToLogin = (router, currentPath, currentQuery = {}) => {
  // build the full current path (include query parameters)
  const currentFullPath = router.resolve({
    path: currentPath,
    query: currentQuery
  }).fullPath
  
  // redirect to login page, and pass the redirect parameter
  router.push({
    path: '/login',
    query: {
      redirect: currentFullPath
    }
  })
}

/**
 * get the redirect path from the login page
 * @param {Object} route - Vue Router's route object
 * @returns {string|null} the redirect path, if not return null
 */
export const getRedirectPath = (route) => {
  return route.query.redirect || null
}

/**
 * clear the redirect parameter
 * @param {Object} router - Vue Router实例
 */
export const clearRedirect = (router) => {
  const currentRoute = router.currentRoute.value
  if (currentRoute.query.redirect) {
    // remove the redirect parameter, keep other query parameters
    const { redirect, ...otherQuery } = currentRoute.query
    router.replace({
      path: currentRoute.path,
      query: otherQuery
    })
  }
}
