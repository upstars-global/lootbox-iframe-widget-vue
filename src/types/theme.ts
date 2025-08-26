/**
 * ThemeConfig — конфігурація теми для lootbox колеса:
 * - name/styleId: ідентифікація теми
 * - timings: тривалість анімацій (обертання, показ результату, прелоадер)
 * - logic: логіка гри (кількість обертів, виграшний сектор)
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
}
