/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Precache assets - кэшируем все статические файлы при установке
precacheAndRoute(self.__WB_MANIFEST)

// Clean up outdated caches
cleanupOutdatedCaches()

// Cache images with CacheFirst strategy
registerRoute(
  /^https?.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
  'GET'
)

// Cache JS and CSS with StaleWhileRevalidate
registerRoute(
  /\.(?:js|css)$/i,
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  }),
  'GET'
)

// Cache manifest.webmanifest
registerRoute(
  ({ request }) => request.destination === 'manifest',
  new CacheFirst({
    cacheName: 'manifest-cache',
  })
)

// Handle navigation fallback (SPA routing) - КРИТИЧНО ДЛЯ iOS OFFLINE
// Используем NetworkFirst с fallback на кэшированный index.html
const navigationHandler = new NetworkFirst({
  cacheName: 'pages-cache',
  plugins: [
    {
      cacheWillUpdate: async ({ response }) => {
        // Кэшируем только успешные ответы
        return response?.status === 200 ? response : null
      },
    },
  ],
})

// Регистрируем маршрут для навигации с fallback
registerRoute(
  new NavigationRoute(navigationHandler, {
    // Allowlist - какие запросы обрабатывать
    allowlist: [/^\/(?!.*\.\w+$)/], // все URL кроме тех что имеют расширения файлов
  })
)

// Дополнительный fallback: если сеть недоступна, пытаемся взять из precache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Только для навигационных запросов к своему же origin
  if (
    request.mode === 'navigate' &&
    url.origin === self.location.origin &&
    // Пропускаем запросы к workbox префиксам
    !url.pathname.startsWith('/__wb')
  ) {
    event.respondWith(
      (async () => {
        try {
          // Сначала пробуем получить из сети
          const networkResponse = await fetch(request)
          return networkResponse
        } catch {
          // Если сеть недоступна - offline fallback
          // Пытаемся найти в precache или regular cache
          const cachedResponse = await caches.match('/index.html', {
            ignoreSearch: true,
          })
          if (cachedResponse) {
            return cachedResponse
          }
          // Если ничего не нашли - возвращаем базовый HTML
          return new Response('<h1>Offline</h1>', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/html' }),
          })
        }
      })()
    )
  }
})

// Сообщения от клиента для пропуска ожидания (activate immediately)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Активируем новый SW сразу для всех клиентов
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
