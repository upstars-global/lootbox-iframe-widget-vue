import type { ThemeConfig } from '../../types/theme'

export const config: ThemeConfig = {
  name: 'crown',
  styleId: 2,
  timings: {
    spinDuration: 8000,
    timeToPopup: 4000,
    preloaderTime: 1500,
  },
  logic: {
    numberOfSpins: 1,
    winSection: 5,
  },
}
