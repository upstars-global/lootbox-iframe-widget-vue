/**
 * Composable для відстеження реального завантаження зображень
 *
 * Проблема: прелоадер ховався по таймеру, а не по факту завантаження.
 * Рішення: чекаємо поки ВСІ <img> елементи реально завантажаться.
 *
 * @example
 * const { waitForImages } = useImagePreloader()
 * await waitForImages('#app img', 10000)
 */
export function useImagePreloader() {
  /**
   * Чекає завантаження одного зображення
   * Використовує decode() API з fallback на onload/onerror
   */
  const waitForOneImage = (img: HTMLImageElement): Promise<void> => {
    // Якщо зображення вже завантажене (з кешу) — одразу resolve
    if (img.complete && img.naturalWidth > 0) {
      return Promise.resolve()
    }

    return new Promise(resolve => {
      // Сучасний спосіб: decode() API
      if (img.decode) {
        img
          .decode()
          .then(() => resolve())
          .catch(() => {
            // Fallback: чекаємо load/error події
            img.addEventListener('load', () => resolve(), { once: true })
            img.addEventListener('error', () => resolve(), { once: true })
          })
      } else {
        // Для старих браузерів
        img.addEventListener('load', () => resolve(), { once: true })
        img.addEventListener('error', () => resolve(), { once: true })
      }
    })
  }

  /**
   * Чекає завантаження всіх зображень за селектором
   *
   * @param selector - CSS селектор для пошуку зображень
   * @param timeoutMs - максимальний час очікування (fallback)
   * @returns Promise який резолвиться коли всі зображення завантажені
   */
  const waitForImages = async (selector: string, timeoutMs: number = 15000): Promise<void> => {
    const images = document.querySelectorAll<HTMLImageElement>(selector)

    if (images.length === 0) {
      return
    }

    // Створюємо Promise для кожного зображення
    const imagePromises = Array.from(images).map(waitForOneImage)

    // Чекаємо завантаження з fallback таймаутом
    // Таймаут потрібен на випадок якщо якесь зображення зламане
    await Promise.race([
      Promise.all(imagePromises),
      new Promise<void>(resolve => setTimeout(resolve, timeoutMs)),
    ])
  }

  return {
    waitForImages,
    waitForOneImage,
  }
}
