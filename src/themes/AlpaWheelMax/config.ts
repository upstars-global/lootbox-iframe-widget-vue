import type { ThemeConfig } from '../../types/theme'
import { alpaFontSizes } from '../_shared/alpaFontSizes'

export const config: ThemeConfig = {
  name: 'AlpaWheelMax',
  styleId: 6,
  project: 'alpa',
  isProjectDefault: false,
  backgroundColor: '#000a12',
  timings: {
    spinDuration: 8000,
    timeToPopup: 9000,
    winAnimationOffset: 0, // Стандартна поведінка (0 = показати після зупинки колеса)
  },
  logic: {
    numberOfSpins: 1,
    winSection: 0,
  },
  fontSizes: alpaFontSizes,
  // VIP-сезони: за сезоном міняються лише поінтер і кристал у центрі —
  // файли images/wheelpointer--<id>.webp та images/centerbg--<id>.webp.
  // Час — UTC. Сезон триває до start наступного, тому хвилина між «10:00» і
  // «10:01» лишається за попереднім сезоном, а не блимає базовим.
  // У andromeda власних файлів немає — показуються базові (рожеві).
  seasons: [
    { id: 'milky-way', start: '2026-10-02T00:00:00Z' },
    { id: 'orion-nebula', start: '2027-01-04T10:01:00Z' },
    { id: 'eagle-nebula', start: '2027-03-01T10:01:00Z' },
    { id: 'andromeda', start: '2027-05-02T10:01:00Z', end: '2027-08-02T10:00:00Z' },
  ],
}
