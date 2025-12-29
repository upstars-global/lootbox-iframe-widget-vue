// src/composables/useWheelAnimation.ts
import type { Ref } from 'vue'
import type { Sector, GameState, WheelAnimationCallbacks } from '../types'

// Константи для анімації
const WHEEL_BASE_ANGLE = 2070 // Базовий кут для позиціонування секторів (5.75 обертів)
const SECTOR_ANGLE = 45 // Кут одного сектора (360° / 8 секторів)
const RANDOM_ANGLE_RANGE = 6 // Діапазон випадкового кута (±3°)
const RANDOM_ANGLE_OFFSET = 3 // Зміщення випадкового кута
const SPIN_WITHOUT_WIN_DURATION = 3000 // Тривалість для обертання без виграшу (3s)
const SPIN_WITH_WIN_DURATION = 14000 // Тривалість для обертання з виграшем (14s)
const SWITCH_EFFECTS_THRESHOLD = 0.7 // Поріг для переключення ефектів (70%)
const RESET_DELAY = 30000 // Затримка перед поверненням колеса в початковий стан після виграшу (30s)

/**
 * useWheelAnimation
 *
 * Логіка обертання колеса фортуни з анімацією та ефектами.
 * Підтримує двофазну анімацію: початкове обертання → переключення на виграшний сектор
 *
 * Архітектура:
 * - Розрахунок фінального кута для цільового сектора (0..7)
 * - Покадрова анімація з ease-out через requestAnimationFrame
 * - Керування візуальними ефектами (маска, motion blur)
 * - Відправка подій у parent: `winSector`, `spinEnd`
 * - Автоматичне повернення у стан очікування
 *
 * Приклад використання:
 * const { runWheel } = useWheelAnimation(gameState, spinDuration, timeToPopup, postToParent, sectionsData)
 * runWheel() // Запуск обертання
 */
export function useWheelAnimation(
  gameState: GameState,
  spinDuration: Ref<number>,
  timeToPopup: Ref<number>,
  winAnimationOffset: Ref<number>,
  sectionsData: Sector[]
) {
  const {
    running,
    winAnimationStarted,
    showWinAnimation,
    angle,
    randomAngle,
    motionBlurOpacity,
    maskOpacity,
    winAnimationOpacity,
    animationId,
    winnerSection,
    hasWinSection,
  } = gameState

  /**
   * Обчислення фінального кута з урахуванням переможного сектора
   *
   * Формула: базовий кут + випадкове зміщення - позиція сектора
   * Результат: кут в градусах для зупинки на цільовому секторі
   *
   * @param startAngle - початковий кут колеса
   * @param winner - індекс переможного сектора (0..7)
   * @returns фінальний кут для анімації
   */
  const calculateFinalAngle = (startAngle: number, winner: number): number => {
    return (
      Math.round(startAngle / 360) * 360 +
      WHEEL_BASE_ANGLE -
      winner * SECTOR_ANGLE +
      randomAngle.value
    )
  }

  /**
   * Покадрова анімація через requestAnimationFrame з двофазною логікою
   *
   * Керує плавним обертанням колеса з візуальними ефектами:
   * - Motion blur зникає на 60% анімації
   * - Маска з'являється на 50% анімації
   * - Переключення ефектів на 70% при наявності виграшного сектора
   * - Ease-out забезпечує природне сповільнення
   *
   * @param start - час початку анімації (performance.now())
   * @param startAngle - початковий кут колеса
   * @param finalAngle - цільовий кут для зупинки
   * @param duration - тривалість анімації в мс
   */
  const handleAnimationFrame = (start: number, startAngle: number) => {
    const now = performance.now()

    // Динамічно визначаємо параметри анімації на основі поточного стану
    const currentDuration = hasWinSection.value ? SPIN_WITH_WIN_DURATION : SPIN_WITHOUT_WIN_DURATION
    const currentWinner = hasWinSection.value ? winnerSection.value || 0 : 0
    const currentFinalAngle = calculateFinalAngle(startAngle, currentWinner)

    let t = Math.min(1, (now - start) / currentDuration)

    // Застосовуємо easing залежно від наявності виграшу
    if (hasWinSection.value) {
      t = 1 - Math.pow(1 - t, 4) // Ease-out для виграшної анімації
    } else {
      t = t // Лінійна анімація для звичайного обертання
    }

    // Оновлюємо кут з урахуванням динамічно зміненого finalAngle
    angle.value = startAngle + t * (currentFinalAngle - startAngle)

    // Переключаємо ефекти на 70% прогресу якщо є виграш
    if (t > SWITCH_EFFECTS_THRESHOLD && hasWinSection.value) {
      motionBlurOpacity.value = 0
      maskOpacity.value = 1
    }

    // Показуємо win-анімацію раніше, якщо задано winAnimationOffset
    // Це кастомна опція для кожної теми — дозволяє показати фанфари та winframe
    // до повної зупинки колеса. Значення в мс: 0 = стандартно, 2000 = на 2 сек раніше
    if (hasWinSection.value && winAnimationOffset.value > 0) {
      const elapsed = now - start
      const timeRemaining = currentDuration - elapsed
      if (timeRemaining <= winAnimationOffset.value && !showWinAnimation.value) {
        showWinAnimation.value = true
        winAnimationOpacity.value = 1
      }
    }

    if (t < 1) {
      animationId.value = requestAnimationFrame(() => handleAnimationFrame(start, startAngle))
      return
    }
    // Логіка завершення анімації
    if (!hasWinSection.value) {
      return spinTo()
    }

    handleWinAnimation()
  }

  // Callbacks для подій (встановлюються ззовні)
  let onSpinEnd: WheelAnimationCallbacks['onSpinEnd'] = undefined

  /**
   * Дії після зупинки колеса: анімація виграшу + виклик callback'ів
   *
   * Послідовність дій:
   * 1. Запуск анімації виграшу (winAnimationStarted та showWinAnimation = true)
   * 2. Пауза для показу анімації виграшу (timeToPopup)
   * 3. Виклик callback'ів (spinEnd) за 3 секунди до приховування анімації
   * 4. Плавне зникнення анімації виграшу (500мс fade-out)
   * 5. Приховування візуальної анімації (showWinAnimation = false)
   * 6. Затримка 30 секунд - колесо нерухоме в фінальній позиції (winAnimationStarted = true)
   * 7. Скидання всіх станів для наступного обертання
   */
  const handleWinAnimation = () => {
    winAnimationStarted.value = true
    showWinAnimation.value = true
    winAnimationOpacity.value = 1
    running.value = false

    // Використовуємо виграшний сектор з gameState
    const winningSector = winnerSection.value || 0
    const winningSectorData = sectionsData[winningSector]
    const prize = `${winningSectorData.prizeText} ${winningSectorData.prizeCurrency}`

    // Відправляємо spinEnd за 3 секунди до приховування анімації
    const spinEndDelay = timeToPopup.value - 3000
    setTimeout(() => {
      onSpinEnd?.(prize)
    }, spinEndDelay)

    // Плавне зникнення анімації за 500мс перед приховуванням
    const fadeOutDelay = timeToPopup.value - 500
    setTimeout(() => {
      winAnimationOpacity.value = 0
    }, fadeOutDelay)

    // Приховуємо візуальну анімацію виграшу після timeToPopup
    setTimeout(() => {
      showWinAnimation.value = false
    }, timeToPopup.value)

    // Загальна затримка = час показу анімації + час утримання позиції
    const totalDelay = timeToPopup.value + RESET_DELAY

    // Скидаємо всі стани після повної затримки
    // winAnimationStarted залишається true протягом всього часу, щоб запобігти
    // застосуванню класу waiting-spin-animation, який скидає позицію колеса
    setTimeout(() => {
      winAnimationStarted.value = false
      maskOpacity.value = 0
    }, totalDelay)
  }

  /**
   * Запуск одного обертання колеса з двофазною логікою
   *
   * Підготовка анімації:
   * 1. Скидання станів попередньої анімації виграшу
   * 2. Генерація випадкового кута для різноманітності
   * 3. Розрахунок фінального кута для цільового сектора
   * 4. Визначення тривалості анімації залежно від наявності виграшного сектора
   * 5. Запуск покадрової анімації
   */
  const spinTo = () => {
    // Скидаємо стани попередньої анімації виграшу
    // Це важливо, щоб клас winSector прибрався з попереднього виграшного сектора
    winAnimationStarted.value = false
    showWinAnimation.value = false
    winAnimationOpacity.value = 1
    winnerSection.value = null // Скидаємо виграшний сектор перед новим спіном

    // Генеруємо випадковий кут для різноманітності анімації
    // randomAngle.value = Math.round(Math.random() * RANDOM_ANGLE_RANGE - RANDOM_ANGLE_OFFSET)
    randomAngle.value = 0

    const startAngle = angle.value
    const start = performance.now()

    // Запускаємо анімацію з ефектами
    motionBlurOpacity.value = 1
    maskOpacity.value = 0
    running.value = true

    animationId.value = requestAnimationFrame(() => handleAnimationFrame(start, startAngle))
  }

  /**
   * Публічний метод: запускає обертання, якщо колесо не крутиться
   *
   * Захист від повторних запусків під час анімації.
   * Використовується ззовні для запуску гри.
   */
  const runWheel = () => {
    if (!running.value) spinTo()
  }

  return {
    spinTo,
    runWheel,
    setSpinEndCallback: (callback: (prize: string) => void) => {
      onSpinEnd = callback
    },
  } as const
}
