// src/types/globals.d.ts
export {}

declare global {
  interface Window {
    /**
     * Конфігурація всіх тем (генерується плагіном у themes/themes-config.js)
     */
    THEMES_CONFIG?: {
      themes: Array<{
        id: string
        name: string
        styleId: number
        project: string
        isProjectDefault: boolean
        backgroundColor?: string
        timings: {
          spinDuration: number
          timeToPopup: number
          preloaderTime: number
        }
        logic: {
          numberOfSpins: number
          winSection: number
        }
        images: string[]
      }>
    }

    /**
     * Рантайм дані теми (встановлюється в bootstrap.js)
     */
    currentTheme:
      | {
          styleId: number
          name: string
          project: string | null
          isProjectDefault: boolean
          backgroundColor?: string
          stylesReady: boolean
          imagesReady: boolean
          sectors: string | null
          sectorsType: string | null
          isActive: boolean
          images: Record<string, string>
          timings: Record<string, number>
          logic: Record<string, unknown>
          fontSizes: {
            sum: {
              short: string
              medium: string
              long: string
              veryLong: string
              extraLong: string
              max: string
            }
            currency: {
              short: string
              long: string
            }
            bonus: {
              default: string
              short: string
              medium: string
              long: string
            }
          } | null
          readonly ready: boolean
        }
      | undefined
  }
}
