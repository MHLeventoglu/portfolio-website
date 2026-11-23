export const pwaManifest = {
  id: '/',
  name: 'MHL · Kişisel Alan',
  short_name: 'MHL',
  description: 'Portfolyo, yönetim paneli ve kişisel finans alanı.',
  lang: 'tr',
  start_url: '/',
  scope: '/',
  // Installed Android apps should let the page fill the system-bar regions too.
  // Unsupported browsers fall back to standalone via the manifest display chain.
  display: 'fullscreen',
  background_color: '#f4f3ef',
  theme_color: '#f4f3ef',
  icons: [
    { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icons/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ],
  shortcuts: [
    { name: 'Kişisel Finans', short_name: 'Finans', url: '/finance', icons: [{ src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' }] },
    { name: 'Yönetim Paneli', short_name: 'Yönetim', url: '/admin', icons: [{ src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' }] }
  ]
}

// Only the application bundle is precached. There are deliberately no API/data runtime caches.
export const pwaWorkbox = {
  globPatterns: ['**/*.{js,mjs,css,html,svg,png,ico,webmanifest}'],
  globIgnores: ['**/*.map'],
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
  navigateFallback: '/index.html',
  navigateFallbackDenylist: [/^\/api(?:\/|$)/, /^\/auth(?:\/|$)/, /^\/rest(?:\/|$)/, /^\/storage(?:\/|$)/, /^\/functions(?:\/|$)/],
  cleanupOutdatedCaches: true,
  skipWaiting: false,
  clientsClaim: true,
  runtimeCaching: []
}
