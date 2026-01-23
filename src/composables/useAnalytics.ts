// src/composables/useAnalytics.ts

/**
 * useAnalytics — відправка подій в аналітику напряму з iframe
 *
 * Підтримує:
 * - FullStory (через SDK)
 * - Google Analytics 4 (через Cloudflare Worker proxy)
 *
 * Якщо сервіс недоступний — виклик ігнорується без помилок.
 *
 * Приклад використання:
 * const { track } = useAnalytics()
 * track('Spin Ended', { prize: '500 USD', sector: 3 })
 */

// GA4 Worker endpoint (проксі для обходу блокування Safari / AdBlock)
const GA_WORKER_URL = 'https://still-band-a01d.upstars-marbella.workers.dev'

// Ключ для збереження client_id в localStorage
const GA_CLIENT_ID_KEY = 'ga_client_id'

/**
 * Генерує або отримує збережений client_id для GA4
 */
const getClientId = (): string => {
  try {
    let clientId = localStorage.getItem(GA_CLIENT_ID_KEY)
    if (!clientId) {
      clientId = crypto.randomUUID()
      localStorage.setItem(GA_CLIENT_ID_KEY, clientId)
    }
    return clientId
  } catch {
    // Fallback для private mode / iframe without storage
    return crypto.randomUUID()
  }
}

export function useAnalytics() {
  /**
   * Перевіряє чи FullStory SDK доступний
   */
  const isFullStoryAvailable = (): boolean => {
    return typeof window.FS?.event === 'function'
  }

  /**
   * Відправка події в FullStory
   */
  const trackFullStory = (eventName: string, properties?: Record<string, unknown>): void => {
    if (isFullStoryAvailable()) {
      window.FS!.event(eventName, properties)
    }
  }

  /**
   * Відправка події в Google Analytics 4 через Cloudflare Worker
   */
  const trackGA4 = async (
    eventName: string,
    properties?: Record<string, unknown>
  ): Promise<void> => {
    try {
      const ga4EventName = eventName.toLowerCase().replace(/\s+/g, '_')
      const isDebug = import.meta.env.DEV

      await fetch(GA_WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: getClientId(),
          events: [
            {
              name: ga4EventName,
              params: {
                ...(properties ?? {}),
                engagement_time_msec: 1,
                ...(isDebug ? { debug_mode: 1 } : {}),
              },
            },
          ],
        }),
      })
    } catch (e) {
      console.warn('GA4 tracking failed:', e)
    }
  }

  /**
   * Універсальний трекінг
   */
  const track = (eventName: string, properties?: Record<string, unknown>): void => {
    trackFullStory(eventName, properties)
    trackGA4(eventName, properties)
  }

  return {
    track,
    isFullStoryAvailable,
  }
}
