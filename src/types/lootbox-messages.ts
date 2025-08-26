/**
 * LootboxMessages — повідомлення для PostMessage API:
 * - lootboxReady: сигнал готовності виджета
 * - startSpin: запит на запуск обертання
 * - winSector: визначено переможний сектор
 * - spinEnd: обертання завершено (можна віддати приз)
 */
export type LootboxMessages = {
  lootboxReady: void
  startSpin?: { source?: 'user_click' | 'parent' }
  winSector: { sector: number; timestamp: number }
  spinEnd: { sector?: number; prize?: string; timestamp: number }
}
