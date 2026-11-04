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

// Прапорець для вимкнення аналітики (використовується для preview iframe на test-ab.html)
const isAnalyticsDisabled = new URLSearchParams(window.location.search).has('no_analytics')

// Ключ для збереження client_id в localStorage
const GA_CLIENT_ID_KEY = 'ga_client_id'

// Ключ для збереження session_id в sessionStorage
const GA_SESSION_ID_KEY = 'analytics_session_id'

/** UUID v4: crypto.randomUUID є лише в secure context (https, localhost) — інакше з getRandomValues */
const uuid = (): string => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6]! & 0x0f) | 0x40
  b[8] = (b[8]! & 0x3f) | 0x80
  const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

// Запасні id, коли сховище недоступне (заблоковані сторонні cookies, sandbox без allow-same-origin):
// генеруються один раз на завантаження, а не на кожну подію — інакше кожна подія = новий користувач
let fallbackClientId: string | null = null
let fallbackSessionId: string | null = null

/**
 * Генерує або отримує збережений client_id для GA4
 */
const getClientId = (): string => {
  try {
    let clientId = localStorage.getItem(GA_CLIENT_ID_KEY)
    if (!clientId) {
      clientId = uuid()
      localStorage.setItem(GA_CLIENT_ID_KEY, clientId)
    }
    return clientId
  } catch {
    // Fallback для private mode / iframe without storage
    return (fallbackClientId ??= uuid())
  }
}

/**
 * Генерує або отримує session_id для поточної сесії
 * Зберігається в sessionStorage — живе до закриття вкладки
 */
const getSessionId = (): string => {
  try {
    let sessionId = sessionStorage.getItem(GA_SESSION_ID_KEY)
    if (!sessionId) {
      sessionId = uuid()
      sessionStorage.setItem(GA_SESSION_ID_KEY, sessionId)
    }
    return sessionId
  } catch {
    // Fallback для private mode / iframe without storage
    return (fallbackSessionId ??= uuid())
  }
}

/**
 * Отримує домен батьківського сайту з document.referrer
 * Потрібно для аналітики: на якому сайті крутили колесо
 */
const getHost = (): string => {
  try {
    if (document.referrer) {
      return new URL(document.referrer).hostname
    }
    return 'direct'
  } catch {
    return 'unknown'
  }
}

/**
 * Загальні параметри для всіх подій аналітики
 * Автоматично додаються до кожного track() виклику
 * Якщо активний A/B тест — додає ab_test_id та ab_variant
 */
const getCommonParams = (): Record<string, string> => {
  const abTest = window.currentTheme?.abTest
  const userId = window.currentTheme?.userId
  return {
    session_id: getSessionId(),
    host: getHost(),
    env: import.meta.env.DEV ? 'dev' : 'prod',
    // ?active=false — сторінка «спін уже використано»: щоб такі покази можна було відфільтрувати
    active: window.currentTheme?.isActive === false ? 'false' : 'true',
    ...(userId ? { user_id: userId } : {}),
    ...(abTest
      ? {
          ab_test_id: abTest.testId,
          ab_variant: abTest.variantId,
        }
      : {}),
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
      const userId = window.currentTheme?.userId

      await fetch(GA_WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: getClientId(),
          ...(userId ? { user_id: userId } : {}),
          user_agent: navigator.userAgent,
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
   * Універсальний трекінг з автоматичним додаванням загальних параметрів
   * Кожна подія отримує: session_id, host, env, active (і user_id, ab_test_id, ab_variant, якщо вони є)
   * Якщо в URL є ?no_analytics — нічого не відправляється (preview iframe)
   */
  const track = (eventName: string, properties?: Record<string, unknown>): void => {
    if (isAnalyticsDisabled) return

    const enrichedProperties = {
      ...getCommonParams(),
      ...(properties ?? {}),
    }
    trackFullStory(eventName, enrichedProperties)
    trackGA4(eventName, enrichedProperties)
  }

  return {
    track,
    isFullStoryAvailable,
  }
}
