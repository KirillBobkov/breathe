import { useState, useEffect, useCallback, useRef } from 'react'
import type { PWAUpdateState } from '../../../shared/pwa/types.js'

/**
 * Hook для управления обновлениями PWA (service worker)
 *
 * Простая логика:
 * 1. Обнаружили waiting SW → показываем уведомление
 * 2. Пользователь нажал "Обновить" → отправляем SKIP_WAITING
 * 3. Пользователь нажал "Позже" → скрываем до следующего запуска
 * 4. controllerchange → перезагрузка страницы
 *
 * Баннер появляется КАЖДЫЙ раз при наличии waiting SW.
 */
export const usePWAUpdate = (): PWAUpdateState & {
  applyUpdate: () => Promise<void>
  dismissUpdate: () => void
} => {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const [state, setState] = useState<PWAUpdateState>({
    isUpdateAvailable: false,
    isUpdating: false,
    isWaiting: false,
  })

  // Показать баннер
  const showUpdateBanner = useCallback(() => {
    console.log('[PWA] 🎯 Showing update banner')
    setState({
      isUpdateAvailable: true,
      isUpdating: false,
      isWaiting: true,
    })
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let refreshing = false

    // Обработчик изменения контроллера - перезагружаем страницу
    const controllerChangeHandler = () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler)

    const setupRegistration = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (!registration) {
          console.log('[PWA] ⚠️ No service worker registration found')
          return
        }

        console.log('[PWA] ✅ Service worker registration found', {
          active: registration.active?.state,
          waiting: registration.waiting?.state,
          installing: registration.installing?.state,
        })

        registrationRef.current = registration

        // Проверяем наличие waiting SW сразу при загрузке
        if (registration.waiting) {
          console.log('[PWA] ⏳ Found waiting service worker on load')
          showUpdateBanner()
          return
        }

        // Отслеживаем появление новой версии
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          console.log('[PWA] 🆕 Update found, installing...');

          newWorker.addEventListener('statechange', () => {
            console.log('[PWA] SW state changed:', newWorker.state);
            if (newWorker.state === 'installed' && registration.active) {
              console.log('[PWA] ✅ New SW installed and waiting');
              showUpdateBanner();
            }
          })
        })
      } catch (error) {
        console.error('[PWA] Error:', error)
      }
    }

    setupRegistration()

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler)
    }
  }, [showUpdateBanner])

  const applyUpdate = useCallback(async (): Promise<void> => {
    const registration = registrationRef.current

    if (registration?.waiting) {
      setState((prev) => ({ ...prev, isUpdating: true }))
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    } else {
      window.location.reload()
    }
  }, [])

  const dismissUpdate = useCallback(() => {
    setState({
      isUpdateAvailable: false,
      isUpdating: false,
      isWaiting: false,
    })
  }, [])

  return {
    ...state,
    applyUpdate,
    dismissUpdate,
  }
}
