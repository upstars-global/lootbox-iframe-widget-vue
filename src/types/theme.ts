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
 * ThemeConfig — конфігурація теми для lootbox колеса:
 * - name/styleId: ідентифікація теми
 * - timings: тривалість анімацій (обертання, показ результату, прелоадер)
 * - logic: логіка гри (кількість обертів, виграшний сектор)
 * - fontSizes: налаштування розмірів шрифтів (опціонально)
 */
export interface ThemeConfig {
  name: string
  styleId: number
  timings: {
    spinDuration: number
    timeToPopup: number
    preloaderTime: number
  }
  logic: {
    numberOfSpins: number
    winSection: number
  }
  fontSizes?: FontSizesConfig
}
