

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

/**
 * 安全的重定向函数，确保用户状态已加载
 * @param {Object} router - Vue Router实例
 * @param {string} path - 要跳转的路径
 * @param {Function} checkAuth - 检查认证状态的函数
 */
export const safeRedirect = async (router, path, checkAuth) => {
  // 等待认证状态加载
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    if (checkAuth()) {
      console.log('[safeRedirect] Auth state ready, redirecting to:', path)
      router.replace(path)
      return
    }
    
    await new Promise(resolve => setTimeout(resolve, 50))
    attempts++
  }
  
  console.warn('[safeRedirect] Auth state not ready after max attempts, redirecting anyway')
  router.replace(path)
}
