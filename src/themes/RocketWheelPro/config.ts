import type { ThemeConfig } from '../../types/theme'

export const config: ThemeConfig = {
  name: 'RocketWheelPro',
  styleId: 2,
  project: 'rocket',
  isProjectDefault: false,
  backgroundColor: '#000a12',
  timings: {
    spinDuration: 8000,
    timeToPopup: 9000,
    preloaderTime: 500,
  },
  logic: {
    numberOfSpins: 1,
    winSection: 0,
  },
}
