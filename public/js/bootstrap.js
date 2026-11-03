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
    // ?promo=force|disable — QA-override сезонного промо (KingWheel).
    // Дозволяє перевірити обидва стани без зміни системної дати/конфігу.
    // Будь-яке інше значення → null → працює дата з theme.promoPeriod.
    const promoRaw = searchParams.get('promo')
    const promo = promoRaw === 'force' || promoRaw === 'disable' ? promoRaw : null
    // ?season=<id>|none — примусовий сезон теми (QA або батьківський сайт),
    // ?season_at=<ISO UTC> — підставити «зараз» для перевірки меж сезонів (QA).
    // Діють лише на теми з seasons у config.ts, див. resolveSeason().
    const season = (searchParams.get('season') || '').trim().toLowerCase() || null
    return {
      themeName: searchParams.get('style') || null,
      project: searchParams.get('project') || null,
      sectors: searchParams.get('sectors') || null,
      sectorsType: searchParams.get('sectors_type') || null,
      active: activeParam !== 'false', // true за замовчуванням, false тільки якщо явно вказано
      userId: searchParams.get('user_id') || null,
      ab: searchParams.get('ab') === 'true',
      promo, // 'force' | 'disable' | null — override промо, див. isPromoActive()
      season, // id сезону | 'none' | null — override сезону, див. resolveSeason()
      seasonAt: searchParams.get('season_at') || null,
    }
  }

  /**
   * Нормалізація застарілих імен проекту та теми (Rocket → Alpa).
   *
   * Мапи аліасів визначені один раз в index.html (window.__lootboxBoot), щоб
   * ранній резолв теми для прелоадера й вибір теми тут не розʼїхались. Фолбек на
   * локальні копії потрібен на випадок, коли bootstrap.js підключають окремо.
   */
  function normalizeLegacyParams(params) {
    const boot = window.__lootboxBoot || {}
    const legacyProjects = boot.legacyProjects || { rocket: 'alpa' }
    const legacyThemes = boot.legacyThemes || {
      RocketWheelLite: 'AlpaWheelLight',
      RocketWheelPro: 'AlpaWheelPro',
      RocketWheelMAX: 'AlpaWheelMax',
    }
    return {
      ...params,
      project: (params.project && legacyProjects[params.project]) || params.project,
      themeName: (params.themeName && legacyThemes[params.themeName]) || params.themeName,
    }
  }

  /** Отримання конфігурації тем */
  function getThemesConfig() {
    const themesConfig = window.THEMES_CONFIG || { themes: [] }
    // console.log('[bootstrap] Конфігурація тем:', themesConfig)
    return themesConfig
  }

  /**
   * Вибір теми з валідацією належності до проекту.
   *
   * Пріоритети:
   * 1. ?style= без ?project= → використовуємо тему (зворотна сумісність)
   * 2. ?project= без ?style= → дефолтна тема проекту
   * 3. ?project= + ?style= → валідуємо належність теми до проекту
   *    - якщо тема належить проекту → використовуємо її
   *    - якщо ні → ігноруємо style, використовуємо дефолт проекту + console.warn
   * 4. Fallback → перша тема
   */
  function selectTheme(themesConfig, params) {
    const themes = Array.isArray(themesConfig.themes) ? themesConfig.themes : []

    // Допоміжна функція: знайти дефолтну тему проекту
    const findProjectDefault = projectName => {
      // Спочатку шукаємо тему з isProjectDefault: true
      const defaultTheme = themes.find(t => t.project === projectName && t.isProjectDefault)
      if (defaultTheme) return defaultTheme

      // Якщо дефолт не знайдено — беремо будь-яку тему проекту
      return themes.find(t => t.project === projectName) || null
    }

    // Сценарій 1: Передано ТІЛЬКИ ?style= (без ?project=)
    // Зворотна сумісність — використовуємо тему без валідації
    if (params.themeName && !params.project) {
      const byName = themes.find(t => t.name === params.themeName)
      if (byName) return byName
    }

    // Сценарій 2: Передано ТІЛЬКИ ?project= (без ?style=)
    // Використовуємо дефолтну тему проекту
    if (params.project && !params.themeName) {
      const projectDefault = findProjectDefault(params.project)
      if (projectDefault) return projectDefault
    }

    // Сценарій 3: Передано ОБИДВА параметри — валідуємо належність
    if (params.project && params.themeName) {
      const requestedTheme = themes.find(t => t.name === params.themeName)

      if (requestedTheme) {
        // Перевіряємо: чи належить тема до вказаного проекту?
        if (requestedTheme.project === params.project) {
          // ✅ Тема належить проекту — використовуємо її
          return requestedTheme
        } else {
          // ❌ Тема НЕ належить проекту — ігноруємо style
          console.warn(
            `[Lootbox] Theme "${params.themeName}" belongs to project "${requestedTheme.project}", ` +
              `not "${params.project}". Using default theme for "${params.project}" instead.`
          )
          const projectDefault = findProjectDefault(params.project)
          if (projectDefault) return projectDefault
        }
      } else {
        // Тема не знайдена — використовуємо дефолт проекту
        console.warn(
          `[Lootbox] Theme "${params.themeName}" not found. Using default theme for "${params.project}".`
        )
        const projectDefault = findProjectDefault(params.project)
        if (projectDefault) return projectDefault
      }
    }

    // Сценарій 4: Fallback — перша тема
    return themes[0] || null
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

  /** Ключ зображення без розширення з URL (basename → ключ для мапи images) */
  function imageKeyFromUrl(url) {
    const base = (url.split('/').pop() || '').trim()
    if (!base) return ''
    return base.replace(/\.[^.]+$/, '')
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Сезонне промо (KingWheel)
  //
  // Ідея: одна тема (KingWheel) має два візуальні стани — класика та промо.
  // У period (theme.promoPeriod) на колесі автоматично з'являється промо-
  // дизайн (і, якщо є promo-center-anim, анімація поверх центру в момент
  // виграшу). Поза періодом — класика.
  // Жодних змін на батьківському сайті чи редеплою не треба: при кожному
  // завантаженні iframe bootstrap.js перераховує isPromoActive і:
  //   1) виставляє/знімає <html data-king-promo="active"> → стилі _promo.scss
  //   2) підмінює мапу зображень promo-X → X → Vue не знає про режим
  //   3) кладе isPromoActive у window.currentTheme → App.vue вмикає промо-оверлей
  //   4) бере кеглі тексту секторів з theme.promoFontSizes, якщо вони задані
  //
  // Хардкод 'KingWheel' навмисний: промо запитували саме під цю тему. Якщо
  // знадобиться промо для іншої теми — узагальнити через флаг у config.ts
  // (напр. theme.promo.enabled) і свій data-attribute / partial.
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Чи активне сезонне промо KingWheel.
   *
   * Пріоритети:
   *   1. ?promo=force   → завжди true  (QA: перевірити промо поза датами)
   *   2. ?promo=disable → завжди false (QA: класика всередині дат)
   *   3. promoPeriod з config.ts → true, якщо Date.now() ∈ [start, end]
   *
   * Інші теми завжди отримують false — це навмисно (див. блок-коментар вище).
   */
  function isPromoActive(theme, params) {
    if (!theme || theme.name !== 'KingWheel') return false
    if (params.promo === 'force') return true
    if (params.promo === 'disable') return false
    const p = theme.promoPeriod
    if (!p || typeof p.start !== 'string' || typeof p.end !== 'string') return false
    const start = Date.parse(p.start)
    const end = Date.parse(p.end)
    if (Number.isNaN(start) || Number.isNaN(end)) return false
    const now = Date.now()
    return now >= start && now <= end
  }

  /**
   * Список зображень для критичного прелоаду (запобігає FOUC).
   *
   * Виключаємо з критичного прелоаду «важкі та відкладені» асети — вони
   * потрібні лише після перемоги, тому їх вантажимо у фоні з App.vue вже
   * після появи колеса:
   *   - winanimation       → useWinAnimationPreloader (Blob URL для @keyframes)
   *   - promo-center-anim  → warm-up HTTP-кешу через new Image() (animated WebP,
   *                          ~380 KB, потрібен тільки в промо у win-стані)
   *
   * Поза промо: викидаємо ВСІ promo-* (зайвий трафік на ~500 KB).
   * У промо: тягнемо тільки promo-* + ті класичні, у яких немає promo-аналога,
   * щоб не качати парами одне і те саме (наприклад, center.webp і
   * promo-center.webp — у промо потрібен лише promo-center.webp).
   */
  const DEFERRED_IMAGE_KEYS = new Set(['winanimation', 'promo-center-anim'])

  function pickPreloadImages(imageUrls, isPromo) {
    let urls = (imageUrls || []).filter(u => !DEFERRED_IMAGE_KEYS.has(imageKeyFromUrl(u)))
    if (!isPromo) {
      return urls.filter(u => {
        const k = imageKeyFromUrl(u)
        return !k.startsWith('promo-')
      })
    }
    const promoOverrides = new Set()
    for (const u of urls) {
      const k = imageKeyFromUrl(u)
      if (k.startsWith('promo-')) {
        promoOverrides.add(k.replace(/^promo-/, ''))
      }
    }
    return urls.filter(u => {
      const k = imageKeyFromUrl(u)
      if (k.startsWith('promo-')) return true
      if (promoOverrides.has(k)) return false
      return true
    })
  }

  /**
   * Побудувати мапу зображень для Vue компонентів.
   *
   * Input:  ["themes/default/images/bg.webp", "themes/default/images/logo.svg"]
   * Output: { "bg": "themes/default/images/bg.webp", "logo": "themes/default/images/logo.svg" }
   *
   * Vue звертається до зображень по basename: <img :src="themeImages.bg" />
   *
   * Промо (isPromo=true): для кожного ключа promo-X записуємо його URL під
   * ключем X, тож Vue без жодних умов отримує літню версію того самого
   * зображення (center → promo-center.webp і т.д.) — без розгалуження логіки
   * у шаблонах.
   *
   * ВИНЯТОК: promo-center-anim — це УНІКАЛЬНИЙ промо-асет (анімація овечки),
   * у класики аналога нема. Якщо його теж "розпакувати" → з'явиться ключ
   * "center-anim", якого ніхто не очікує, а App.vue все одно бере його під
   * повним ім'ям themeImages['promo-center-anim']. Тому виключаємо.
   * Аналогічно треба буде робити з будь-яким новим promo-only ассетом.
   *
   * @param {string[]} imageUrls
   * @param {boolean} isPromo
   */
  function buildImageMap(imageUrls, isPromo) {
    const map = {}
    for (const url of imageUrls || []) {
      const key = imageKeyFromUrl(url)
      if (!key) continue
      map[key] = url
    }
    if (isPromo) {
      for (const key of Object.keys(map)) {
        // promo-only асети залишаємо тільки під promo-ключем — див. JSDoc вище
        if (key.startsWith('promo-') && key !== 'promo-center-anim') {
          const target = key.replace(/^promo-/, '')
          map[target] = map[key]
        }
      }
    }
    return map
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Сезони теми (AlpaWheelMax — VIP-сезони)
  //
  // Тема може оголосити в config.ts список seasons: [{ id, start, end? }].
  // Сезонний файл лежить поруч із базовим: images/<ключ>--<id>.<ext>
  // (wheelpointer--milky-way.webp). В активному сезоні він стає під ключ
  // <ключ>, тож Vue без жодних умов бере themeImages.wheelpointer. Немає
  // файлу для сезону — лишається базовий.
  //
  // Окремо від промо KingWheel навмисно: промо — це вмикач «є / нема» з
  // власними винятками, а сезонів N, і активний рівно один. Теми без seasons
  // проходять крізь цей блок без змін (той самий масив зображень).
  // ──────────────────────────────────────────────────────────────────────────

  const SEASON_SEPARATOR = '--'

  function getSeasons(theme) {
    return theme && Array.isArray(theme.seasons) ? theme.seasons : []
  }

  /**
   * Активний сезон теми: id або null (базові зображення).
   *
   * Пріоритети:
   *   1. ?season=none → null
   *   2. ?season=<id> → цей сезон (невідомий id → console.warn і далі за датою)
   *   3. дата: сезон з найпізнішим start <= зараз; діє до start наступного
   *      сезону або до власного end (не включно)
   *
   * Порівнюються абсолютні моменти часу: start/end записані в UTC ("…Z"),
   * Date.now() теж не залежить від часового поясу пристрою — сезон
   * перемикається в одну мить для всіх. Обчислюється один раз при завантаженні.
   */
  function resolveSeason(theme, params) {
    const seasons = getSeasons(theme)
    if (!seasons.length) return null
    if (params.season === 'none') return null
    if (params.season) {
      if (seasons.some(s => s.id === params.season)) return params.season
      console.warn(
        `[Lootbox] Unknown season "${params.season}" for theme "${theme.name}". Using the date.`
      )
    }

    let now = Date.now()
    if (params.seasonAt) {
      const forcedNow = Date.parse(params.seasonAt)
      if (Number.isNaN(forcedNow)) {
        console.warn(`[Lootbox] Invalid season_at "${params.seasonAt}". Using the device clock.`)
      } else {
        now = forcedNow
      }
    }

    let current = null
    for (const s of seasons) {
      const start = Date.parse(s.start)
      if (Number.isNaN(start) || start > now) continue
      if (!current || start > current.start) current = { id: s.id, start, end: s.end }
    }
    if (!current) return null
    if (current.end) {
      const end = Date.parse(current.end)
      if (!Number.isNaN(end) && now >= end) return null
    }
    return current.id
  }

  /** 'wheelpointer--milky-way' → { base: 'wheelpointer', id: 'milky-way' } | null */
  function splitSeasonKey(key, seasons) {
    const i = key.lastIndexOf(SEASON_SEPARATOR)
    if (i <= 0) return null
    const id = key.slice(i + SEASON_SEPARATOR.length)
    return seasons.some(s => s.id === id) ? { base: key.slice(0, i), id } : null
  }

  /**
   * Лишити зображення активного сезону: файли інших сезонів викидаємо, а
   * базовий файл, який сезон перекриває, — теж (щоб не качати пару).
   */
  function filterSeasonImages(imageUrls, theme, seasonId) {
    const seasons = getSeasons(theme)
    if (!seasons.length) return imageUrls
    const overridden = new Set()
    const kept = []
    for (const url of imageUrls || []) {
      const variant = splitSeasonKey(imageKeyFromUrl(url), seasons)
      if (!variant) {
        kept.push(url)
      } else if (variant.id === seasonId) {
        kept.push(url)
        overridden.add(variant.base)
      }
    }
    return kept.filter(url => !overridden.has(imageKeyFromUrl(url)))
  }

  /** Перекласти сезонні ключі мапи на базові: wheelpointer--<id> → wheelpointer */
  function applySeasonToImageMap(map, seasonId) {
    if (!seasonId) return map
    const suffix = SEASON_SEPARATOR + seasonId
    for (const key of Object.keys(map)) {
      if (key.endsWith(suffix)) {
        map[key.slice(0, -suffix.length)] = map[key]
        delete map[key]
      }
    }
    return map
  }

  // === A/B ТЕСТУВАННЯ ===

  /** Детерміністичний хеш рядка (FNV-1a) → число */
  function fnv1aHash(str) {
    var hash = 2166136261
    for (var i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i)
      hash = (hash * 16777619) >>> 0
    }
    return hash
  }

  /** Отримати або створити стабільний userId для A/B розподілу */
  function getOrCreateABUserId() {
    var key = 'ab_user_id'
    try {
      var id = localStorage.getItem(key)
      if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem(key, id)
      }
      return id
    } catch {
      return crypto.randomUUID()
    }
  }

  /** Обрати варіант за кумулятивними вагами */
  function pickVariant(variants, hash) {
    var bucket = hash % 100
    var cumulative = 0
    for (var i = 0; i < variants.length; i++) {
      cumulative += variants[i].weight
      if (bucket < cumulative) return variants[i]
    }
    return variants[variants.length - 1]
  }

  /**
   * Визначити A/B варіант для проекту
   *
   * @param {object} themesConfig - Конфігурація тем з abTests
   * @param {string} project - Назва проекту
   * @param {string|null} urlUserId - user_id з URL (реальний користувач з проду)
   * @returns {{ testId: string, variantId: string, theme: object } | null}
   */
  function resolveABVariant(themesConfig, project, urlUserId) {
    var abTests = themesConfig.abTests
    if (!abTests || !project || !abTests[project]) return null

    var test = abTests[project]
    if (!test.variants || !test.variants.length) return null

    var userId = urlUserId || getOrCreateABUserId()
    var hash = fnv1aHash(userId + ':' + test.testId)
    var variant = pickVariant(test.variants, hash)

    var themes = Array.isArray(themesConfig.themes) ? themesConfig.themes : []
    var variantTheme = themes.find(function (t) {
      return t.name === variant.theme
    })

    if (!variantTheme) {
      console.warn(
        '[Lootbox A/B] Theme "' + variant.theme + '" not found for variant ' + variant.id
      )
      return null
    }

    return {
      testId: test.testId,
      variantId: variant.id,
      theme: variantTheme,
    }
  }

  /** Експорт рантайму теми для Vue */
  function exposeThemeRuntime(theme, params, imagesMap, abResult, isPromo, seasonId) {
    window.currentTheme = {
      styleId: theme.styleId,
      name: theme.name,
      project: theme.project || null,
      isProjectDefault: theme.isProjectDefault || false,
      backgroundColor: theme.backgroundColor || null,
      isPromoActive: !!isPromo,
      season: seasonId || null,
      sectors: params.sectors,
      sectorsType: params.sectorsType,
      isActive: params.active,
      userId: params.userId,
      stylesReady: true,
      imagesReady: true,
      get ready() {
        return this.stylesReady && this.imagesReady
      },
      timings: theme.timings || {},
      logic: theme.logic || {},
      // У промо диск секторів може мати інший розмір, тому кеглі — свої (promoFontSizes)
      fontSizes: (isPromo && theme.promoFontSizes) || theme.fontSizes || null,
      images: imagesMap,
      abTest: abResult ? { testId: abResult.testId, variantId: abResult.variantId } : null,
    }

    // Застосовуємо CSS клас для відключення анімацій якщо лутбокс неактивний
    if (!params.active) {
      document.getElementById('app').classList.add('lootbox-inactive')
    }

    // Захист від FOUC — сигналізуємо готовність теми для main.ts
    document.documentElement.setAttribute('data-theme-ready', '1')
  }

  // === ГОЛОВНА ЛОГІКА ===

  const urlParams = normalizeLegacyParams(readUrlParams())
  const themesConfig = getThemesConfig()

  let selectedTheme = selectTheme(themesConfig, urlParams)

  // A/B тестування: спрацьовує ТІЛЬКИ якщо явно передано ?ab=true
  // та НЕ вказано конкретну тему (?style=)
  var abResult = null
  if (urlParams.project && urlParams.ab && !urlParams.themeName) {
    abResult = resolveABVariant(themesConfig, urlParams.project, urlParams.userId)
    if (abResult) {
      selectedTheme = abResult.theme
    }
  }

  setThemeDataAttribute(selectedTheme)

  // Промо-режим (KingWheel): обчислюємо ОДИН раз при ініціалізації.
  // Атрибут на <html> керує промо-стилями (themes/KingWheel/styles/_promo.scss),
  // а сам прапорець isPromo передається у buildImageMap/exposeThemeRuntime,
  // щоб Vue (App.vue) теж знав про режим (для overlay на win-стані).
  const isPromo = isPromoActive(selectedTheme, urlParams)
  if (isPromo) {
    document.documentElement.setAttribute('data-king-promo', 'active')
  } else {
    document.documentElement.removeAttribute('data-king-promo')
  }

  // Сезон теми (AlpaWheelMax — VIP-сезони): теж один раз при ініціалізації.
  // Далі працюємо зі списком зображень, з якого прибрано чужі сезони та
  // перекриті базові файли; для тем без seasons це той самий масив.
  const seasonId = resolveSeason(selectedTheme, urlParams)
  if (seasonId) {
    document.documentElement.setAttribute('data-season', seasonId)
  } else {
    document.documentElement.removeAttribute('data-season')
  }
  const themeImageUrls = filterSeasonImages(selectedTheme.images, selectedTheme, seasonId)

  const cssReady = loadThemeStylesheet(selectedTheme)
  // Прелоад без winanimation і з урахуванням промо (див. pickPreloadImages)
  const criticalImages = pickPreloadImages(themeImageUrls, isPromo)
  await waitForAllImages(criticalImages, IMAGE_LOAD_TIMEOUT_MS)
  await cssReady

  const imageMap = applySeasonToImageMap(buildImageMap(themeImageUrls, isPromo), seasonId)
  exposeThemeRuntime(selectedTheme, urlParams, imageMap, abResult, isPromo, seasonId) // window.currentTheme = { ... }
})()
