export function adminDestination(from) {
  const path = typeof from?.pathname === 'string' ? from.pathname : ''
  if (path !== '/finance' && path !== '/admin' && !path.startsWith('/admin/')) return '/admin'
  if (/[\\\s]/.test(path)) return '/admin'
  return path + (typeof from.search === 'string' && from.search.startsWith('?') ? from.search : '')
}
