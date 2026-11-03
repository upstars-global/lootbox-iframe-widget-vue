import { createApp } from 'vue'
import App from './App.vue'

// === КОНСТАНТИ ===
const MAX_THEME_READY_TIMEOUT_MS = 6000 // Максимальний час очікування готовності теми (6 секунд)
const POLLING_INTERVAL_MS = 16 // Інтервал перевірки готовності (60 FPS)

/**
 * Чекаємо повної готовності теми (window.currentTheme.ready)
 * — встановлюється в bootstrap.js після завантаження CSS і декоду всіх зображень.
 * Без теми app не монтуємо: якщо тема запізнюється — чекаємо далі (прелоадер на екрані),
 * якщо bootstrap.js повідомив про збій (data-theme-failed) — повертаємо false.
 */
async function waitThemeReady(): Promise<boolean> {
  const startTime = performance.now()
  let warned = false

  while (!window.currentTheme?.ready) {
    if (document.documentElement.hasAttribute('data-theme-failed')) return false

    if (!warned && performance.now() - startTime > MAX_THEME_READY_TIMEOUT_MS) {
      console.warn('[main] Тема не готова за', MAX_THEME_READY_TIMEOUT_MS, 'мс, чекаємо далі')
      warned = true
    }

    // Чекаємо наступної перевірки (60 FPS)
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS))
  }
  return true
}

// === ГОЛОВНА ФУНКЦІЯ ===
async function bootstrapApp(): Promise<void> {
  try {
    // Чекаємо готовності теми (CSS + зображення); без теми не запускаємось
    if (!(await waitThemeReady())) {
      console.error('[main] Тема не завантажилась — додаток не запускаємо')
      return
    }

    // Створюємо та монтуємо Vue додаток
    const app = createApp(App)
    app.mount('#app')

    // console.log('[main] Vue додаток успішно запущено')
  } catch (error) {
    console.error('[main] Помилка запуску додатку:', error)
  }
}

// Запускаємо додаток
bootstrapApp()
