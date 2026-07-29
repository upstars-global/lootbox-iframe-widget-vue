export interface SectorTextLayout {
  labelRadius: number
  sumX: number
  sumY: number
  currencyX: number
  currencyY: number
}

const FALLBACK: SectorTextLayout = {
  labelRadius: 37,
  sumX: 89,
  sumY: 52,
  currencyX: 88.7,
  currencyY: 56,
}

function readCssNumber(varName: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim()
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * Дефолтні позиції тексту секторів (viewBox 0 0 100 100).
 * Читаються в App.vue через readSectorTextLayout() після завантаження theme.css.
 * Перевизначення — у [data-theme='...'] в _tokens.scss кожної теми.
 */
export function readSectorTextLayout(): SectorTextLayout {
  return {
    labelRadius: readCssNumber('--sector-label-radius', FALLBACK.labelRadius),
    sumX: readCssNumber('--sector-sum-x', FALLBACK.sumX),
    sumY: readCssNumber('--sector-sum-y', FALLBACK.sumY),
    currencyX: readCssNumber('--sector-currency-x', FALLBACK.currencyX),
    currencyY: readCssNumber('--sector-currency-y', FALLBACK.currencyY),
  }
}

/**
 * Коло як `<path>` для `<textPath>`: браузери підтримують textPath лише на path,
 * посилання на `<circle>` рендериться без дуги (текст падає в точку 0,0).
 */
export function buildLabelArcPath(radius: number): string {
  const diameter = radius * 2
  return `M 50, 50 m -${radius}, 0 a ${radius},${radius} 0 1,1 ${diameter},0 a ${radius},${radius} 0 1,1 -${diameter},0`
}
