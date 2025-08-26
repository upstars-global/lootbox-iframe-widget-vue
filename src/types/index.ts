/**
 * Реэкспорт всіх типів проекту
 *
 * @example
 * import { LootboxMessages, ThemeConfig } from '@/types'
 */

// PostMessage API
export type { LootboxMessages } from './lootbox-messages'

// PostMessage утиліти
export type { Handlers, Options } from './post-message'

// Сектори
export type { Sector, ParsedSectorsResult } from './sectors'

// Теми
export type { ThemeConfig } from './theme'

// Ігровий стан
export type { GameState, WheelAnimationCallbacks } from './game-state'
