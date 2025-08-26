/**
 * Handlers — набір обробників повідомлень:
 * - мапа колбеків за типом повідомлення
 * - readonly для запобігання мутацій структури
 */
export type Handlers<M extends Record<string, unknown>> = {
  readonly [K in keyof M]?: (payload: M[K], event: MessageEvent) => void
}

/**
 * Options — опції фільтрації повідомлень:
 * - allowedOrigins: перелік дозволених origin'ів
 * - onlyParent: iFrame-режим (тільки від window.parent)
 */
export type Options = {
  readonly allowedOrigins?: readonly string[]
  readonly onlyParent?: boolean
}
