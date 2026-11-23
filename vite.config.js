import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { pwaManifest, pwaWorkbox } from './src/lib/pwaConfig.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    injectRegister: null,
    includeAssets: ['icons/apple-touch-icon.png', 'icons/app-icon.svg'],
    manifest: pwaManifest,
    workbox: pwaWorkbox,
    devOptions: { enabled: false }
  })],
})
