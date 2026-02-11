import { ref } from 'vue'

/**
 * Composable для передзавантаження SVG win-анімації через Blob URL
 *
 * Проблема: SVG з CSS @keyframes кешується браузером, анімація не перезапускається
 * при повторному показі. Рішення через ?t=timestamp створює новий мережевий запит кожен раз.
 *
 * Рішення: Завантажуємо SVG один раз як Blob, при кожному показі створюємо
 * унікальний Blob URL — браузер сприймає це як новий файл, @keyframes перезапускаються,
 * але мережевого запиту немає.
 *
 * @param svgUrl - URL до SVG файлу анімації
 *
 * @example
 * const { preload, createFreshUrl, revokeUrl, isPreloaded } = useWinAnimationPreloader(themeImages.winanimation)
 *
 * onMounted(() => {
 *   preload() // Неблокуюче передзавантаження у фоні
 * })
 *
 * watch(showWinAnimation, (show) => {
 *   if (show) {
 *     winAnimationSrc.value = createFreshUrl()
 *   } else {
 *     revokeUrl(winAnimationSrc.value)
 *     winAnimationSrc.value = ''
 *   }
 * })
 */
export function useWinAnimationPreloader(svgUrl: string) {
  const blobData = ref<Blob | null>(null)
  const isPreloaded = ref(false)

  /**
   * Завантажує SVG у пам'ять як Blob
   * Викликається один раз після маунту компонента
   */
  async function preload(): Promise<void> {
    if (blobData.value || !svgUrl) return

    try {
      const response = await fetch(svgUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      blobData.value = await response.blob()
      isPreloaded.value = true
    } catch (error) {
      console.warn('[WinAnimation] Preload failed, fallback to direct URL:', error)
    }
  }

  /**
   * Створює унікальний Blob URL для SVG
   * Кожен виклик повертає новий URL — це гарантує перезапуск @keyframes
   *
   * @returns Blob URL або прямий URL (fallback)
   */
  function createFreshUrl(): string {
    if (!blobData.value) {
      return `${svgUrl}?t=${Date.now()}`
    }
    return URL.createObjectURL(blobData.value)
  }

  /**
   * Звільняє Blob URL після використання
   *
   * @param url - Blob URL для звільнення
   */
  function revokeUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }

  return {
    preload,
    createFreshUrl,
    revokeUrl,
    isPreloaded,
  }
}
