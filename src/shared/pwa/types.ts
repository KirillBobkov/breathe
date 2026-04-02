/**
 * PWA update state (только обновление Service Worker)
 * Установка PWA осуществляется пользователем через браузер
 */
export interface PWAUpdateState {
  /** Whether a new service worker version is available */
  isUpdateAvailable: boolean
  /** Whether the update is currently being applied */
  isUpdating: boolean
  /** Whether a new service worker was found but not yet activated */
  isWaiting: boolean
}
