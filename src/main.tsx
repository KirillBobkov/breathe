import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './app/index'

// Регистрируем service worker только в production
// Вся логика обновлений находится в usePWAUpdate хуке
const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker not supported')
    return
  }

  try {
    await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none',
    })
    console.log('[SW] Service Worker registered')
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error)
  }
}

// Регистрируем SW в production или в dev режиме с VITE_ENABLE_PWA=true
// Для локального тестирования используйте: npm run dev:pwa
const shouldRegisterSW = import.meta.env.PROD || import.meta.env.VITE_ENABLE_PWA
if (shouldRegisterSW) {
  registerServiceWorker()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
