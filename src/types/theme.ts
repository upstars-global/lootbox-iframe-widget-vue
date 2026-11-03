/**
 * FontSizes — налаштування розмірів шрифтів для текстів у секторах колеса
 */
export interface FontSizesConfig {
  sum: {
    short: string
    medium: string
    long: string
    veryLong: string
    extraLong: string
    max: string
  }
  currency: {
    short: string
    long: string
  }
  bonus: {
    default: string
    short: string
    medium: string
    long: string
  }
}

/**
 * ThemeSeason — один сезон теми (наприклад, VIP-сезон у AlpaWheelMax).
 *
 * Сезон активний від свого `start` (включно) до `start` наступного сезону.
 * `end` (не включно) потрібен лише там, де після сезону нічого не йде.
 * Дати — ISO-8601 з явною зоною (`Z` або `+hh:mm`): без зони рядок читається
 * як місцевий час пристрою, і межа сезону поїде.
 */
export interface ThemeSeason {
  id: string // kebab-case, він же суфікс файлу: wheelpointer--<id>.webp
  start: string
  end?: string
}

/**
 * ThemeConfig — конфігурація теми для lootbox колеса:
 * - name/styleId: ідентифікація теми
 * - project: назва проекту (king, alpa, thor тощо)
 * - isProjectDefault: чи є ця тема дефолтною для проекту
 * - timings: тривалість анімацій (обертання, показ результату, прелоадер)
 * - logic: логіка гри (кількість обертів, виграшний сектор)
 * - fontSizes: налаштування розмірів шрифтів (опціонально)
 */
export interface ThemeConfig {
  name: string
  styleId: number
  project: string
  isProjectDefault: boolean
  timings: {
    spinDuration: number
    timeToPopup: number
    winAnimationOffset: number // Час (мс) на скільки раніше показувати win-анімацію (0 = стандартно)
  }
  logic: {
    numberOfSpins: number
    winSection: number
  }
  fontSizes?: FontSizesConfig
  backgroundColor?: string // Колір фону для теми (опціонально)
  /** Опціональний період сезонного промо (ISO-8601 з offset) */
  promoPeriod?: { start: string; end: string }
  /** Кеглі тексту секторів на час промо (якщо промо-диск іншого розміру, ніж у класиці) */
  promoFontSizes?: FontSizesConfig
  /** Опціональні сезони: підміна зображень за датою (див. ThemeSeason) */
  seasons?: ThemeSeason[]
}
