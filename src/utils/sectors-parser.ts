import type { Sector, ParsedSectorsResult } from '../types'

export type { Sector, ParsedSectorsResult }

/**
 * Розбиває рядок секторів з URL у масив, коректно декодуючи значення.
 *
 * Приклади:
 *   "100%20FS,200%20EUR" → ["100 FS", "200 EUR"]
 */
export function parseSectors(sectorsString: string): string[] {
  if (typeof sectorsString !== 'string' || sectorsString.trim() === '') return []

  return sectorsString
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      // коректне декодування (на відміну від локальної заміни %20)
      try {
        return decodeURIComponent(s)
      } catch {
        // якщо рядок уже декодований або кривий — віддаємо як є
        return s.replace(/%20/g, ' ')
      }
    })
}

/**
 * Перевірка кількості секторів: від 2 до 8 включно.
 */
export function validateSectors(sectors: string[]): { isValid: boolean; error?: string } {
  if (!Array.isArray(sectors)) {
    return { isValid: false, error: 'Сектори повинні бути масивом' }
  }
  if (sectors.length < 2) {
    return { isValid: false, error: 'Мінімум 2 сектори' }
  }
  if (sectors.length > 8) {
    return { isValid: false, error: 'Максимум 8 секторів' }
  }
  return { isValid: true }
}

/**
 * Розбирає одиничний сектор на значення і тип призу.
 * Допускається будь-який тип у другій частині (включно з символом '%').
 *
 * Формат: "<value><spaces><currency>"
 *   "100 FS" → { prizeText: "100", prizeCurrency: "FS" }
 *   "150 %"  → { prizeText: "150", prizeCurrency: "%" }
 */
function parseSingleSector(s: string): { prizeText: string; prizeCurrency: string } | null {
  // перший «слово-пакет» — значення; все інше — валюта/суфікс
  const m = s.match(/^(\S+)\s+(.+)$/)
  if (!m) return null
  const [, prizeText, prizeCurrency] = m
  return { prizeText, prizeCurrency }
}

/**
 * Створює об’єкти секторів із рядків і (необов’язково) масиву типів.
 * Якщо формат сектора неправильний — кидає помилку (ловиться на рівні processSectorsFromUrl).
 */
export function createSectorObjects(sectors: string[], types?: string[]): Sector[] {
  return sectors.map((raw, index) => {
    const parsed = parseSingleSector(raw)
    if (!parsed) {
      throw new Error(
        `Неправильний формат сектора: "${raw}". Очікується формат "значення валюта", напр. "100 FS"`,
      )
    }

    const type = types?.[index]
    return {
      prizeText: parsed.prizeText,
      prizeCurrency: parsed.prizeCurrency,
      type,
    }
  })
}

/**
 * Повний цикл обробки секторів з URL:
 * - парсинг
 * - валідація кількості
 * - створення структурованих об’єктів
 *
 * На будь-якій помилці повертає isValid:false і повідомлення.
 */
export function processSectorsFromUrl(
  sectorsString?: string,
  typesString?: string,
): ParsedSectorsResult {
  if (!sectorsString) {
    return { sectors: [], isValid: false, error: 'Не вказані сектори' }
  }

  const sectorItems = parseSectors(sectorsString)

  const validation = validateSectors(sectorItems)
  if (!validation.isValid) {
    return { sectors: [], isValid: false, error: validation.error }
  }

  const types = typesString
    ? typesString
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map((t) => {
          try {
            return decodeURIComponent(t)
          } catch {
            return t.replace(/%20/g, ' ')
          }
        })
    : undefined

  try {
    const sectorObjects = createSectorObjects(sectorItems, types)
    return { sectors: sectorObjects, isValid: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Помилка обробки секторів'
    return { sectors: [], isValid: false, error: msg }
  }
}
