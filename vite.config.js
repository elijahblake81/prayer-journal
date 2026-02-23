
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/prayer-journal/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Prayer Journal',
        short_name: 'Prayer Journal',
        description: 'Write, review, and remember answered prayers.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/prayer-journal/',
        start_url: '/prayer-journal/',
        icons: [
          { src: '/prayer-journal/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/prayer-journal/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/prayer-journal/pwa-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Cache app shell + static assets for offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})

