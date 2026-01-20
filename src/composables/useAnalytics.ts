// src/composables/useAnalytics.ts

/**
 * useAnalytics - відправка подій в аналітику напряму з iframe
 *
 * Підтримує FullStory (і можна додати GA в майбутньому).
 * Якщо сервіс недоступний — виклик ігнорується без помилок.
 *
 * Приклад використання:
 * const { track } = useAnalytics()
 * track('Spin Ended', { prize: '500 USD', sector: 3 })
 */
export function useAnalytics() {
  /**
   * Перевіряє чи FullStory SDK завантажений і доступний
   */
  const isFullStoryAvailable = (): boolean => {
    return typeof window.FS?.event === 'function'
  }

  /**
   * Відправляє подію в FullStory
   *
   * @param eventName - назва події (наприклад 'Spin Ended')
   * @param properties - додаткові властивості події
   */
  const trackFullStory = (eventName: string, properties?: Record<string, unknown>): void => {
    if (isFullStoryAvailable()) {
      window.FS!.event(eventName, properties)
    }
  }

  /**
   * Універсальний метод для відправки подій в усі підключені сервіси аналітики
   *
   * Наразі підтримує:
   * - FullStory
   *
   * В майбутньому можна додати:
   * - Google Analytics (gtag)
   * - Інші сервіси
   *
   * @param eventName - назва події
   * @param properties - додаткові властивості події
   */
  const track = (eventName: string, properties?: Record<string, unknown>): void => {
    trackFullStory(eventName, properties)
    // Тут можна додати інші сервіси:
    // trackGA(eventName, properties)
  }

  return {
    track,
    isFullStoryAvailable,
  }
}
