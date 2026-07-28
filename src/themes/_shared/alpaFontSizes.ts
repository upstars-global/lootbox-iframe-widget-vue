import type { FontSizesConfig } from '../../types/theme'

/**
 * Розміри тексту секторів для всіх колес Alpa.
 *
 * Значення — user units viewBox'а `svg.bonus-type` ("0 0 100 100"). SVG займає
 * `.wheel-sectors-mask` = 85% контейнера, тобто при кадрі макета 1000x1000
 * 1 unit = 8.5px. Звідси перерахунок зі спеки дизайну:
 *
 *   Prize (Roboto Slab Black, 56–65pt) → 65/8.5 = 7.65 … 56/8.5 = 6.59
 *   USD / FS (Roboto Slab Black, 19pt) → 19/8.5 = 2.24
 *   Cash Prize / Bonus Prize (Rubik Bold, 24pt) → 24/8.5 = 2.82
 *
 * Базовий перерахунок pt→unit (×1.12), далі підігнанo pixel-perfect overlay
 * ref-mart.png / ref-pro.png (audit 2026-07): суми +10%, USD/FS +5%, підписи +15%.
 *
 * Верхню межу діапазону отримують короткі суми ("10", "500"), нижню — довші
 * ("5,000"). Далі кегль зменшується східчасто, щоб текст не виліз за сектор:
 * ці бакети спека не описує, вони збережені з попередніх колес пропорційно.
 */
export const alpaFontSizes: FontSizesConfig = {
  sum: {
    short: '9.4', // overlay +10%
    medium: '9.4',
    long: '8.1',
    veryLong: '6.8',
    extraLong: '4.9',
    max: '3.7',
  },
  currency: {
    short: '2.64', // overlay +5%
    long: '1.76',
  },
  bonus: {
    default: '3.63', // overlay +15%
    short: '3.63',
    medium: '2.94',
    long: '1.95',
  },
}

/** Light має ширший кольоровий сектор — тримаємо +15%. Pro/Max/Mart: спека 24pt → 2.82 unit. */
export const alpaDarkFontSizes: FontSizesConfig = {
  ...alpaFontSizes,
  bonus: {
    default: '2.82',
    short: '2.82',
    medium: '2.28',
    long: '1.52',
  },
}
