// src/composables/usePostMessageBus.ts
import { onMounted, onUnmounted } from 'vue'
import type { Handlers, Options } from '../types'

/** Перевіряє, що значення — звичайний об'єкт (не null, не примітив) */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

/**
 * usePostMessageBus
 *
 * Єдиний вхід/вихід для роботи з window.postMessage у віджеті iframe.
 *
 * Архітектура:
 * - Слухає повідомлення з parent вікна і делегує їх у передані обробники
 * - Дозволяє відправляти повідомлення у parent для комунікації
 * - Автоматично підписується/відписується на події при маунті/анмаунті
 *
 * Приклад використання:
 * const { postToParent } = usePostMessageBus<LootboxMessages>({
 *   startSpin: () => runWheel(),
 *   stopSpin: () => stopWheel()
 * })
 */
export function usePostMessageBus<M extends Record<string, unknown>>(
  handlers: Readonly<Handlers<M>>,
  opts: Readonly<Options> = {},
) {
  /** Перевірка, чи можна приймати повідомлення з цього джерела */
  const isAllowed = (e: MessageEvent) => {
    // Обмеження тільки parent вікном для безпеки
    if (opts.onlyParent && e.source !== window.parent) return false
    // Перевірка дозволених origins (якщо вказані)
    if (!opts.allowedOrigins?.length) return true
    return opts.allowedOrigins.includes(e.origin)
  }

  /** Головний обробник події `message` - делегує повідомлення у відповідні функції */
  const onMessage = (event: MessageEvent) => {
    if (!isAllowed(event)) return
    if (!isPlainObject(event.data)) return

    // Очікувана форма: { type: keyof M; data: unknown }
    const { type, data: payload } = event.data as { type?: keyof M; data?: unknown }
    const fn = type ? handlers[type] : undefined
    if (typeof fn === 'function') {
      ;(fn as (p: unknown, e: MessageEvent) => void)(payload, event)
    }
  }

  /** Підписка/відписка на подію message */
  const attach = () => window.addEventListener('message', onMessage)
  const detach = () => window.removeEventListener('message', onMessage)

  /**
   * Відправка повідомлення у довільне вікно (iframe, popup тощо)
   *
   * @param targetWindow - цільове вікно (iframe.contentWindow, window.open тощо)
   * @param type - ключ події з типу M (наприклад, 'startSpin', 'winSector')
   * @param payload - дані події (структура залежить від типу)
   * @param targetOrigin - обмеження за origin для безпеки (за замовчуванням '*')
   *
   * Приклад: postTo(iframe.contentWindow, 'startSpin', { timestamp: Date.now() })
   */
  function postTo<K extends keyof M>(
    targetWindow: Window | null | undefined,
    type: K,
    payload: M[K],
    targetOrigin = '*',
  ) {
    if (!targetWindow) return
    targetWindow.postMessage({ type, data: payload }, targetOrigin)
  }

  /**
   * Шорткат для відправки в батьківське вікно
   *
   * Найчастіший випадок використання - відправка результатів гри у parent сайт.
   * Автоматично перевіряє наявність parent вікна перед відправкою.
   *
   * @param type - ключ події з типу M
   * @param payload - дані події (необов'язково)
   * @param targetOrigin - обмеження за origin (за замовчуванням '*')
   *
   * Приклад: postToParent('winSector', { sector: 0, timestamp: Date.now() })
   */
  function postToParent<K extends keyof M>(type: K, payload?: M[K], targetOrigin = '*') {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type, data: payload }, targetOrigin)
    }
  }

  onMounted(attach)
  onUnmounted(detach)

  return { attach, detach, postTo, postToParent }
}
