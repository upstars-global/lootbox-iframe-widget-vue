/**
 * Sector — сектор колеса фортуни:
 * - prizeText: текст призу (наприклад, "100 USD")
 * - prizeCurrency: валюта призу
 * - type: опціональний тип сектора
 */
export interface Sector {
  prizeText: string
  prizeCurrency: string
  type?: string
}

/**
 * ParsedSectorsResult — результат парсингу секторів з URL:
 * - sectors: масив секторів
 * - isValid: чи валідний результат
 * - error: повідомлення про помилку (якщо є)
 */
export interface ParsedSectorsResult {
  sectors: Sector[]
  isValid: boolean
  error?: string
}
