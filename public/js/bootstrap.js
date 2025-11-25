/**
 * bootstrap.js
 *
 * Стартовий скрипт iFrame-віджета.
 * Виконується ДО main.ts та відповідає за:
 * - Парсинг URL параметрів
 * - Вибір та завантаження теми (CSS + зображення)
 * - Підготовку середовища для Vue додатку
 */

;(async function () {
  // === КОНСТАНТИ ===9
  const IMAGE_LOAD_TIMEOUT_MS = 6000

  // === ДОПОМІЖНІ ФУНКЦІЇ ===

  /** Отримання параметрів з URL запиту */
  function readUrlParams() {
    const searchParams = new URLSearchParams(location.search)
    const activeParam = searchParams.get('active')
    return {
      themeName: searchParams.get('style') || null,
      sectors: searchParams.get('sectors') || null,
      sectorsType: searchParams.get('sectors_type') || null,
      active: activeParam !== 'false', // true за замовчуванням, false тільки якщо явно вказано
    }
  }

  /** Отримання конфігурації тем */
  function getThemesConfig() {
    const themesConfig = window.THEMES_CONFIG || { themes: [] }
    // console.log('[bootstrap] Конфігурація тем:', themesConfig)
    return themesConfig
  }

  /** Вибір теми за назвою */
  function selectThemeByName(themesConfig, params) {
    const themes = Array.isArray(themesConfig.themes) ? themesConfig.themes : []
    if (params.themeName) {
      const byName = themes.find(theme => theme.name === params.themeName)
      // console.log('[bootstrap] Тема за назвою:', byName)
      if (byName) return byName
    }
    // console.log('[bootstrap] Використовуємо першу тему:', themes[0])
    return themes[0] || null
  }

  /** Встановлення прелоадера теми */
  function applyThemePreloader(theme) {
    const preloaderImgEl = document.querySelector('#preloader-bg img')
    if (!preloaderImgEl) return
    const preloaderImage = (theme.images || []).find(imagePath =>
      /\/preloader\.(svg|png|webp|gif)$/i.test(imagePath)
    )
    // console.log('[bootstrap] Прелоадер теми:', preloaderImage)
    if (preloaderImage) preloaderImgEl.src = preloaderImage
  }

  /** Встановлення data-theme атрибута */
  function setThemeDataAttribute(theme) {
    document.documentElement.setAttribute('data-theme', theme.name)
  }

  /** Завантаження CSS теми */
  function loadThemeStylesheet(theme) {
    const href = `themes/${theme.name}/theme.css`
    const linkEl = document.createElement('link')
    linkEl.rel = 'stylesheet'
    linkEl.href = href
    // Promise який чекає завантаження CSS файлу
    const ready = new Promise(resolve => linkEl.addEventListener('load', resolve, { once: true }))
    document.head.appendChild(linkEl)
    return ready
  }

  /** Попереднє завантаження зображень теми для запобігання FOUC */
  async function waitForAllImages(imageUrls, timeoutMs) {
    // console.log('[bootstrap] Завантаження зображень:', imageUrls?.length)
    // Функція для завантаження одного зображення
    const waitForOne = src =>
      new Promise(resolve => {
        // Створюємо зображення з оптимізацією для швидкого завантаження
        const img = new Image()
        img.loading = 'eager' // Не чекаємо видимості - завантажуємо одразу
        img.decoding = 'async' // Не блокуємо UI під час декодування
        img.fetchPriority = 'high' // Пріоритет над іншими ресурсами
        img.src = src

        // Сучасний спосіб: використовуємо img.decode() з fallback
        if (img.decode) {
          img
            .decode() // Декодуємо зображення
            .then(resolve) // Успіх → завершуємо Promise
            .catch(() => {
              // Помилка → fallback на старий спосіб
              img.onload = resolve
              img.onerror = resolve
            })
        } else {
          // Fallback для старих браузерів
          img.onload = resolve // Завантаження успішне
          img.onerror = resolve // Помилка завантаження (тоже завершуємо)
        }
      })

    // Чекаємо завантаження з таймаутом - не блокуємо UI довго
    await Promise.race([
      // Завантажуємо всі зображення одночасно для швидкості
      Promise.all((imageUrls || []).map(waitForOne)),
      // Захист від довгого очікування - максимум 6 секунд
      new Promise(r => setTimeout(r, timeoutMs)),
    ])
    // console.log('[bootstrap] Всі зображення завантажені')
  }

  /**
   * Побудувати мапу зображень для Vue компонентів
   *
   * Перетворює список URL зображень у зручну мапу:
   * Input:  ["themes/default/images/bg.webp", "themes/default/images/logo.svg"]
   * Output: { "bg": "themes/default/images/bg.webp", "logo": "themes/default/images/logo.svg" }
   *
   * Це дозволяє Vue компонентам динамічно звертатися до зображень по імені:
   * <img :src="currentTheme.images.bg" /> замість довгих URL
   */
  function buildImageMap(imageUrls) {
    const map = {}
    for (const url of imageUrls || []) {
      const base = (url.split('/').pop() || '').trim()
      if (!base) continue
      map[base.replace(/\.[^.]+$/, '')] = url
    }
    return map
  }

  /** Експорт рантайму теми для Vue */
  function exposeThemeRuntime(theme, params, imagesMap) {
    window.currentTheme = {
      styleId: theme.styleId,
      name: theme.name,
      sectors: params.sectors,
      sectorsType: params.sectorsType,
      isActive: params.active,
      stylesReady: true,
      imagesReady: true,
      get ready() {
        return this.stylesReady && this.imagesReady
      },
      timings: theme.timings || {},
      logic: theme.logic || {},
      images: imagesMap,
    }

    // Застосовуємо CSS клас для відключення анімацій якщо лутбокс неактивний
    if (!params.active) {
      document.getElementById('app').classList.add('lootbox-inactive')
    }

    // Захист від FOUC — сигналізуємо готовність теми для main.ts
    console.log('[bootstrap] Захист від FOUC — сигналізуємо готовність теми для main.ts')
    document.documentElement.setAttribute('data-theme-ready', '1')
  }

  // === ГОЛОВНА ЛОГІКА ===

  const urlParams = readUrlParams()
  const themesConfig = getThemesConfig()

  let selectedTheme = selectThemeByName(themesConfig, urlParams)

  // applyThemePreloader(selectedTheme)
  // ↑ ЗАКОМЕНТОВАНО: Прелоадер тепер встановлюється синхронно через інлайн-скрипт в index.html
  // для миттєвого відображення без затримки. Це виправляє баг з білим фоном при жорсткому перезавантаженні.
  // Функція applyThemePreloader залишена як fallback, але більше не викликається.

  setThemeDataAttribute(selectedTheme)

  const cssReady = loadThemeStylesheet(selectedTheme)
  await waitForAllImages(selectedTheme.images, IMAGE_LOAD_TIMEOUT_MS)
  await cssReady

  const imageMap = buildImageMap(selectedTheme.images)
  exposeThemeRuntime(selectedTheme, urlParams, imageMap) // window.currentTheme = { ... }
})()
