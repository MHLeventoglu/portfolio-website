export function readSavedTheme() {
  try { return localStorage.getItem('portfolio_theme') === 'dark' ? 'dark' : 'light' }
  catch { return 'light' }
}

export function applyAppAppearance(theme, pathname) {
  const root = document.documentElement
  const workspace = pathname === '/finance' || pathname === '/admin' || pathname.startsWith('/admin/')
  root.dataset.theme = theme
  root.dataset.appSurface = workspace ? 'workspace' : 'portfolio'
  // The document canvas also paints the OS safe areas and overscroll background.
  const canvas = getComputedStyle(root).getPropertyValue('--app-canvas').trim()
  if (canvas) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', canvas)
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme)
}
