import { createApp } from 'vue'
import App from './App.vue'

// === КОНСТАНТИ ===
const MAX_THEME_READY_TIMEOUT_MS = 6000 // Максимальний час очікування готовності теми (6 секунд)
const POLLING_INTERVAL_MS = 16 // Інтервал перевірки готовності (60 FPS)

/**
 * Чекаємо повної готовності теми (window.currentTheme.ready)
 * — встановлюється в bootstrap.js після завантаження CSS і декоду всіх зображень.
 * Фолбек за часом залишаємо, щоб app точно змонтувався в крайньому випадку.
 */
async function waitThemeReady(): Promise<void> {
  const startTime = performance.now()

  while (!window.currentTheme?.ready) {
    // Перевіряємо чи не перевищено максимальний час очікування
    if (performance.now() - startTime > MAX_THEME_READY_TIMEOUT_MS) {
      console.warn(
        '[main] Тема не готова за',
        MAX_THEME_READY_TIMEOUT_MS,
        'мс, запускаємо app без теми',
      )
      break
    }

    // Чекаємо наступної перевірки (60 FPS)
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS))
  }
}

// === ГОЛОВНА ФУНКЦІЯ ===
async function bootstrapApp(): Promise<void> {
  try {
    // Чекаємо готовності теми (CSS + зображення)
    await waitThemeReady()

    // Створюємо та монтуємо Vue додаток
    const app = createApp(App)
    app.mount('#app')

    // console.log('[main] Vue додаток успішно запущено')
  } catch (error) {
    console.error('[main] Помилка запуску додатку:', error)
    // Додаток все одно запускається з fallback темою
  }
}

// Запускаємо додаток
bootstrapApp()
