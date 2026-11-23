import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pwaManifest, pwaWorkbox } from '../src/lib/pwaConfig.js'
import { adminDestination } from '../src/lib/authDestination.js'

test('PWA has a stable identity, fullscreen launch, root scope and install icons', async () => {
  assert.equal(pwaManifest.id, '/')
  assert.equal(pwaManifest.display, 'fullscreen')
  assert.equal(pwaManifest.scope, '/')
  assert.ok(pwaManifest.icons.some(icon => icon.sizes === '192x192' && icon.purpose === 'any'))
  assert.ok(pwaManifest.icons.some(icon => icon.sizes === '512x512' && icon.purpose === 'maskable'))
  for (const icon of pwaManifest.icons) {
    const image = await readFile(new URL(`../public${icon.src}`, import.meta.url))
    assert.equal(image.subarray(1, 4).toString(), 'PNG')
    const [width, height] = icon.sizes.split('x').map(Number)
    assert.equal(image.readUInt32BE(16), width); assert.equal(image.readUInt32BE(20), height)
  }
  const apple = await readFile(new URL('../public/icons/apple-touch-icon.png', import.meta.url))
  assert.equal(apple.readUInt32BE(16), 180)
})

test('service worker updates are deliberate and never runtime-cache financial/auth API responses', () => {
  assert.deepEqual(pwaWorkbox.runtimeCaching, [])
  assert.equal(pwaWorkbox.skipWaiting, false)
  assert.equal(pwaWorkbox.navigateFallback, '/index.html')
  for (const path of ['/api/transactions', '/auth/v1/token', '/rest/v1/finance_workspace', '/storage/v1/private', '/functions/v1/quotes']) assert.ok(pwaWorkbox.navigateFallbackDenylist.some(pattern => pattern.test(path)))
  assert.ok(!pwaWorkbox.navigateFallbackDenylist.some(pattern => pattern.test('/finance')))
})

test('protected PWA shortcuts return to their intended view after login without accepting external redirects', () => {
  assert.equal(adminDestination({ pathname: '/finance', search: '?view=investments' }), '/finance?view=investments')
  assert.equal(adminDestination({ pathname: '/admin/projects' }), '/admin/projects')
  for (const pathname of ['//example.com', 'https://example.com', '/finance-other', '/admin\\example.com', '/admin/\nfoo']) assert.equal(adminDestination({ pathname }), '/admin')
})
