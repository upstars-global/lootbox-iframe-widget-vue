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
const WAITING_START_ANGLE = 40 // Поза колеса на 0% @keyframes waitingSpinAnimation (styles/_animations.scss тем)
const RETURN_TO_WAITING_DURATION = 2000 // Плавний поворот у позу початку покачування після утримання виграшу
const FINISH_TIMER_SLACK = 100 // Запас таймера завершення: у видимій вкладці першим завершує кадр

/** Найкоротший поворот до того самого положення по колу: результат у [-180, 180) */
const nearestTurn = (delta: number): number => (((delta % 360) + 540) % 360) - 180

/**
 * Реальний кут колеса на екрані: у спокої його задає CSS-покачування (waiting-spin-animation),
 * а не angle. null — елемента немає або transform не задано.
 */
const readWheelAngle = (): number | null => {
  const el = document.getElementById('wheel_sectors')
  if (!el) return null
  const transform = getComputedStyle(el).transform
  if (!transform || transform === 'none') return null
  const m = new DOMMatrix(transform)
  return (Math.atan2(m.b, m.a) * 180) / Math.PI
}

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
   * Фінальний кут фази, перезапущеної посеред циклу: ідеальна відстань distance від from,
   * підправлена до найближчого положення, де колесо стає на сектор winner (як calculateFinalAngle)
   */
  const calculateRestartFinalAngle = (from: number, distance: number, winner: number): number => {
    const ideal = from + distance
    return ideal + nearestTurn(WHEEL_BASE_ANGLE - winner * SECTOR_ANGLE + randomAngle.value - ideal)
  }

  /** Фінальний кут виграшної фази: класичний (виграш відомий зі старту) або перезапущеної */
  const winFinalAngle = (startAngle: number, winner: number, winDistance?: number): number =>
    winDistance === undefined
      ? calculateFinalAngle(startAngle, winner)
      : calculateRestartFinalAngle(startAngle, winDistance, winner)

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
   * @param winDistance - відстань фази, перезапущеної з приходом результату (див. setWinner)
   */
  const handleAnimationFrame = (start: number, startAngle: number, winDistance?: number) => {
    const now = performance.now()

    // Динамічно визначаємо параметри анімації на основі поточного стану
    const currentDuration = hasWinSection.value ? SPIN_WITH_WIN_DURATION : SPIN_WITHOUT_WIN_DURATION
    const currentWinner = hasWinSection.value ? winnerSection.value || 0 : 0
    const currentFinalAngle = hasWinSection.value
      ? winFinalAngle(startAngle, currentWinner, winDistance)
      : calculateFinalAngle(startAngle, currentWinner)

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
      animationId.value = requestAnimationFrame(() =>
        handleAnimationFrame(start, startAngle, winDistance)
      )
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

  // true — winnerSection уже показаний (колесо на ньому зупинилось), наступний спін його скидає.
  // false — winnerSection прийшов після зупинки або до першого спіну: він для наступного спіну.
  let winnerShown = false

  // Таймери win-стану попереднього спіну (spinEnd, fade-out, приховування, скидання);
  // новий спін їх скасовує, щоб вони не спрацювали посеред нього
  const winTimers: ReturnType<typeof setTimeout>[] = []

  // Поточний цикл обертання без виграшу; null — цикл не йде або виграш уже відомий
  let cycle: { start: number; startAngle: number } | null = null

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
    winnerShown = true

    // Використовуємо виграшний сектор з gameState
    // Даних сектора може не бути (призів менше 8 або список порожній) —
    // тоді приз порожній, але таймери і spinEnd ставляться завжди
    const winningSector = winnerSection.value || 0
    const winningSectorData = sectionsData[winningSector]
    const prize = winningSectorData
      ? `${winningSectorData.prizeText} ${winningSectorData.prizeCurrency}`.trim()
      : ''

    // Відправляємо spinEnd за 3 секунди до приховування анімації
    const spinEndDelay = timeToPopup.value - 3000
    winTimers.push(
      setTimeout(() => {
        onSpinEnd?.(prize)
      }, spinEndDelay)
    )

    // Плавне зникнення анімації за 500мс перед приховуванням
    const fadeOutDelay = timeToPopup.value - 500
    winTimers.push(
      setTimeout(() => {
        winAnimationOpacity.value = 0
      }, fadeOutDelay)
    )

    // Приховуємо візуальну анімацію виграшу після timeToPopup
    winTimers.push(
      setTimeout(() => {
        showWinAnimation.value = false
      }, timeToPopup.value)
    )

    // Загальна затримка = час показу анімації + час утримання позиції
    const totalDelay = timeToPopup.value + RESET_DELAY

    // Скидаємо всі стани після повної затримки
    // winAnimationStarted залишається true протягом всього часу, щоб запобігти
    // застосуванню класу waiting-spin-animation, який скидає позицію колеса
    winTimers.push(
      setTimeout(() => {
        maskOpacity.value = 0
        returnToWaiting()
      }, totalDelay)
    )
  }

  /**
   * Завершення виграшної фази за часом — дублює кадрове завершення. У фоновій вкладці
   * (і в iframe поза екраном) requestAnimationFrame стоїть, а зупинка і spinEnd мають
   * відбутися вчасно. Якщо кадр уже завершив спін (running = false) — нічого не робить;
   * новий спін скасовує таймер разом з іншими winTimers.
   */
  const scheduleFinish = (start: number, startAngle: number, winDistance?: number) => {
    const delay = start + SPIN_WITH_WIN_DURATION + FINISH_TIMER_SLACK - performance.now()
    winTimers.push(
      setTimeout(() => {
        if (!running.value) return
        if (animationId.value !== null) cancelAnimationFrame(animationId.value)
        angle.value = winFinalAngle(startAngle, winnerSection.value || 0, winDistance)
        motionBlurOpacity.value = 0
        maskOpacity.value = 1
        handleWinAnimation()
      }, delay)
    )
  }

  /**
   * Повернення в очікування без стрибка: колесо плавно доповертається з фінальної позиції
   * в позу 0% покачування, і лише тоді winAnimationStarted = false вмикає waiting-spin-animation
   */
  const returnToWaiting = () => {
    const from = angle.value
    const to = from + nearestTurn(WAITING_START_ANGLE - from)
    const start = performance.now()

    const step = () => {
      const t = Math.min(1, (performance.now() - start) / RETURN_TO_WAITING_DURATION)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 // ease-in-out
      angle.value = from + eased * (to - from)
      if (t < 1) {
        animationId.value = requestAnimationFrame(step)
        return
      }
      winAnimationStarted.value = false
    }

    animationId.value = requestAnimationFrame(step)
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
    // Старт зі спокою: беремо кут, який зараз на екрані (поза покачування або фінал минулого
    // спіну), — інакше перший кадр стрибає з пози покачування в angle. Читаємо до зміни станів:
    // DOM ще з класом покачування
    if (!running.value) angle.value = readWheelAngle() ?? angle.value
    // Зупиняємо поворот у покачування, якщо він ще йде
    if (animationId.value !== null) cancelAnimationFrame(animationId.value)

    winTimers.forEach(id => clearTimeout(id))
    winTimers.length = 0

    // Скидаємо стани попередньої анімації виграшу
    // Це важливо, щоб клас winSector прибрався з попереднього виграшного сектора
    winAnimationStarted.value = false
    showWinAnimation.value = false
    winAnimationOpacity.value = 1
    // Скидаємо виграшний сектор попереднього спіну; сектор, що прийшов до startSpin, лишаємо
    if (winnerShown) {
      winnerSection.value = null
      winnerShown = false
    }

    // Генеруємо випадковий кут для різноманітності анімації
    // randomAngle.value = Math.round(Math.random() * RANDOM_ANGLE_RANGE - RANDOM_ANGLE_OFFSET)
    randomAngle.value = 0

    const startAngle = angle.value
    const start = performance.now()
    cycle = hasWinSection.value ? null : { start, startAngle }

    // Запускаємо анімацію з ефектами
    motionBlurOpacity.value = 1
    maskOpacity.value = 0
    running.value = true

    if (hasWinSection.value) scheduleFinish(start, startAngle)
    animationId.value = requestAnimationFrame(() => handleAnimationFrame(start, startAngle))
  }

  /**
   * Публічний метод: запускає обертання, якщо колесо не крутиться
   *
   * Захист від повторних запусків під час анімації.
   * Використовується ззовні для запуску гри.
   * @returns true — обертання запущено; false — колесо вже крутиться, команду проігноровано
   */
  const runWheel = (): boolean => {
    if (running.value) return false
    spinTo()
    return true
  }

  /**
   * Публічний метод: встановлює виграшний сектор (уже провалідований).
   * Сектор, що прийшов до startSpin, не губиться — його використає наступний спін.
   */
  const setWinner = (sector: number) => {
    winnerSection.value = sector
    winnerShown = false
    if (running.value && cycle) restartWithWinner(cycle)
  }

  /**
   * Результат прийшов посеред циклу без виграшу: фаза сповільнення стартує з поточного
   * положення колеса, а не з початку циклу (інакше кут відскакує назад до 850° за кадр),
   * і з тією ж швидкістю — стартова швидкість ease-out 4·Δ/T дорівнює швидкості циклу
   */
  const restartWithWinner = ({ start, startAngle }: { start: number; startAngle: number }) => {
    cycle = null
    const now = performance.now()
    const cycleDistance = calculateFinalAngle(startAngle, 0) - startAngle
    const from = startAngle + Math.min(1, (now - start) / SPIN_WITHOUT_WIN_DURATION) * cycleDistance
    const distance = ((cycleDistance / SPIN_WITHOUT_WIN_DURATION) * SPIN_WITH_WIN_DURATION) / 4

    if (animationId.value !== null) cancelAnimationFrame(animationId.value)
    scheduleFinish(now, from, distance)
    animationId.value = requestAnimationFrame(() => handleAnimationFrame(now, from, distance))
  }

  return {
    spinTo,
    runWheel,
    setWinner,
    setSpinEndCallback: (callback: (prize: string) => void) => {
      onSpinEnd = callback
    },
  } as const
}
