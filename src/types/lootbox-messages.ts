/**
 * LootboxMessages — повідомлення для PostMessage API:
 * - lootboxReady: сигнал готовності виджета (вихідне)
 * - startSpin: запит на запуск обертання (вхідне)
 * - winSector: індекс переможного сектора 0..7 від сайту (вхідне; віджет його не надсилає)
 * - spinEnd: обертання завершено (вихідне; приз і timestamp, поле sector віджет не заповнює)
 */
export type LootboxMessages = {
  lootboxReady: void
  startSpin?: { source?: 'user_click' | 'parent' }
  winSector: number
  spinEnd: { sector?: number; prize?: string; timestamp: number }
}
