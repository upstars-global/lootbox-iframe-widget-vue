import type { ThemeConfig } from '../../types/theme'
import { alpaFontSizes } from '../_shared/alpaFontSizes'

export const config: ThemeConfig = {
  name: 'AlpaWheelLight',
  styleId: 1,
  project: 'alpa',
  isProjectDefault: true,
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
}
