import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      srcDir: 'src/shared/pwa',
      filename: 'sw.ts',
      includeAssets: ['vite.svg', 'pwa-icons/*.png'],
      manifest: {
        name: 'Дыхательные практики',
        short_name: 'Дыхание',
        description: 'Приложение для дыхательных тренировок',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['health', 'fitness', 'wellness'],
        lang: 'ru'
      },
      workbox: {
        globIgnores: ['**/sw.ts', '**/manifest.webmanifest']
      },
      // Не добавляем тег скрипта автоматически - регистрируем в main.tsx вручную
      injectRegister: false,
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
})
