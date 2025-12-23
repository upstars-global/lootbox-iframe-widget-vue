import type { ThemeConfig } from '../../types/theme'

export const config: ThemeConfig = {
  name: 'RocketWheelLite',
  styleId: 1,
  project: 'rocket',
  isProjectDefault: true,
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
