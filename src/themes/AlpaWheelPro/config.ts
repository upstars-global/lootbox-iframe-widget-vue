import type { ThemeConfig } from '../../types/theme'
import { alpaFontSizes } from '../_shared/alpaFontSizes'

export const config: ThemeConfig = {
  name: 'AlpaWheelPro',
  styleId: 2,
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
}
