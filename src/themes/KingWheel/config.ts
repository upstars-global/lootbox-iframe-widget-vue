import type { ThemeConfig } from '../../types/theme'

export const config: ThemeConfig = {
  name: 'KingWheel',
  styleId: 3,
  project: 'king',
  isProjectDefault: true,
  backgroundColor: '#F8F7FA',
  timings: {
    spinDuration: 8000,
    timeToPopup: 9000,
    winAnimationOffset: 2000, // Показувати win-анімацію на 2 сек раніше
  },
  logic: {
    numberOfSpins: 1,
    winSection: 0,
  },
  /** Сезонне промо: автоматичний дизайн на період (див. bootstrap.js + styles/_promo.scss). Час — Київ (+02:00 взимку) */
  promoPeriod: {
    start: '2026-10-30T00:00:00+02:00',
    end: '2027-01-10T23:59:59+02:00',
  },
  /** Кеглі тексту секторів у промо: диск секторів займає 74.6% колеса замість 60% у класиці */
  promoFontSizes: {
    sum: {
      short: '7',
      medium: '5.9',
      long: '5.05',
      veryLong: '4.6',
      extraLong: '3.4',
      max: '2.5',
    },
    currency: {
      short: '4',
      long: '2.4',
    },
    bonus: {
      default: '3.64',
      short: '3.64',
      medium: '2.95',
      long: '2',
    },
  },
  // Custom font sizes for KingWheel theme (adjust as needed)
  fontSizes: {
    sum: {
      short: '8',
      medium: '7',
      long: '6',
      veryLong: '5.5',
      extraLong: '4',
      max: '3',
    },
    currency: {
      short: '3.3',
      long: '2',
    },
    bonus: {
      default: '3.7',
      short: '3.7',
      medium: '3',
      long: '2',
    },
  },
}
