import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/plant-care-pwa/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Plant Care',
        short_name: 'Plant Care',
        description: 'Track your plant watering schedule',
        theme_color: '#2d6a36',
        background_color: '#2d6a36',
        display: 'standalone',
        start_url: '/plant-care-pwa/',
        scope: '/plant-care-pwa/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // woff2 = self-hosted fonts; webp = bundled catalog photos — both precached for offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],
      },
    }),
  ],
})
