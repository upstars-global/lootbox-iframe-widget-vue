# Документація проекту: Lootbox iFrame Widget

**Lootbox iFrame Widget** - незалежний Vue 3 компонент для інтеграції в iframe, який дозволяє легко кастомізувати та модифікувати лутбокс під різні активності та сегменти гравців.

- **Незалежний iframe лутбокс** - ізольований компонент
- **Двостороння комунікація** через PostMessage API
- **Конфігурація через query-параметри** - динамічна налаштування
- **Vue 3 + Composition API + TypeScript** - сучасний стек
- **Оптимізована анімація** без GSAP (requestAnimationFrame)
- **Модульна система тем** - легке додавання нових дизайнів

## 📋 Архітектура проекту

### Структура директорій

```
Projects/lootbox-iframe-widget-vue/
├── public/                  # Статичні файли (копіюються в dist)
│   ├── js/
│   │   └── bootstrap.js     # Ранній рантайм + A/B тестування
│   └── test-*.html          # Тестові сторінки: test-lootbox, test-alpa-lootbox,
│                            #   test-king-lootbox, test-thor-lootbox, test-ab
├── src/
│   ├── ab/                   # A/B тестування
│   │   └── config.ts         # Конфігурація A/B тестів
│   ├── components/           # FpsMonitor.vue (?fps=true)
│   ├── composables/          # Перевикористовувана логіка
│   │   ├── useWheelAnimation.ts    # Анімація колеса
│   │   ├── usePostMessageBus.ts    # PostMessage комунікація
│   │   ├── useAnalytics.ts         # Аналітика (FullStory, GA4)
│   │   ├── useImagePreloader.ts    # Попереднє завантаження зображень
│   │   └── useWinAnimationPreloader.ts # Прелоад win-анімації
│   ├── types/               # TypeScript типи (тема, повідомлення, стан колеса)
│   ├── utils/               # Утиліти: sectors-parser.ts (парсинг призів),
│   │                        #   sector-text-layout.ts (позиції тексту секторів)
│   ├── themes/              # Теми дизайну
│   │   ├── _shared/         # Спільні конфіги тем (не є темою)
│   │   │   └── alpaFontSizes.ts
│   │   ├── AlpaWheelLight/ # Тема Alpa Light (дефолт для alpa)
│   │   │   ├── config.ts
│   │   │   ├── theme.scss
│   │   │   ├── images/
│   │   │   └── styles/
│   │   ├── AlpaWheelPro/  # Тема Alpa Pro
│   │   │   ├── config.ts
│   │   │   ├── theme.scss
│   │   │   ├── images/
│   │   │   └── styles/
│   │   ├── AlpaWheelMax/    # Тема Alpa MAX
│   │   │   └── ...
│   │   ├── AlpaWheelMart/   # Тема Alpa Mart
│   │   │   └── ...
│   │   ├── KingWheel/       # Тема King (дефолт для king)
│   │   │   ├── config.ts
│   │   │   ├── theme.scss
│   │   │   ├── images/
│   │   │   └── styles/
│   │   └── ThorWheel/       # Тема Thor (дефолт для thor)
│   │       ├── config.ts
│   │       ├── theme.scss
│   │       ├── images/
│   │       └── styles/
│   ├── main.ts              # Монтує Vue після готовності теми
│   └── App.vue              # Головний компонент
├── vite/                    # Конфігурація збірки
│   └── plugins/
│       └── vite-plugin-themes.ts
├── dist/                    # Зібрані файли
│   ├── js/
│   │   └── bootstrap.js     # Копія з public/js/
│   └── themes/              # Генеровані файли тем (з src/themes/)
│       ├── themes-config.js # Конфігурація всіх тем + A/B тести
│       ├── AlpaWheelLight/
│       │   ├── theme.css
│       │   └── images/
│       ├── AlpaWheelPro/
│       │   ├── theme.css
│       │   └── images/
│       ├── AlpaWheelMax/
│       │   ├── theme.css
│       │   └── images/
│       ├── AlpaWheelMart/
│       │   ├── theme.css
│       │   └── images/
│       ├── KingWheel/
│       │   ├── theme.css
│       │   └── images/
│       └── ThorWheel/
│           ├── theme.css
│           └── images/
└── index.html               # Точка входу: ранній вибір теми, прелоадер, FullStory
```

### Архітектурні принципи

**Поточна архітектура:**

- Динамічна генерація конфігурацій
- Модульна структура
- Легка кастомізація через query-параметри

### Система збірки та розподілу ресурсів

**Vite Plugin System** (`vite-plugin-themes.ts`) автоматично:

- Генерує `themes-config.js` з конфігурацією всіх тем
- Компілює SCSS файли в CSS для кожної теми
- Копіює зображення в `dist/themes/` без змін
- Створює готову структуру для розподілу
- Перевіряє конфіги тем і зв'язки між ними (див. «Перевірки під час збірки»)

**Bootstrap.js** (`public/js/bootstrap.js`):

- **Ранній рантайм** - виконується ДО main.ts
- **Парсинг URL параметрів** для вибору теми
- **Динамічне завантаження** CSS стилів теми
- **Попереднє завантаження** критичних зображень теми (важкі відкладені — `winanimation`, `promo-center-anim` — вантажаться у фоні пізніше)
- **Запобігання FOUC** (Flash of Unstyled Content)
- **Підготовка середовища** для Vue додатку
- **Встановлення** `window.currentTheme` з готовими ресурсами

## 📋 Система тем

### Мультипроектна архітектура

Віджет підтримує роботу з **кількома проектами** (Alpa, King, Thor тощо). Кожен проект може мати свої теми з різним дизайном.

**Ключові концепції:**

- **Проект (`project`)** — логічна група тем (наприклад, `alpa`, `king`, `thor`)
- **Тема** — конкретний дизайн колеса (наприклад, `AlpaWheelLight`, `KingWheel`, `ThorWheel`)
- **Дефолтна тема проекту** — тема, яка застосовується якщо не вказано конкретну тему

**Приклад структури:**

```
Проект Alpa:
├── AlpaWheelLight (дефолт для Alpa)
├── AlpaWheelPro
├── AlpaWheelMax
└── AlpaWheelMart

Проект King:
└── KingWheel (дефолт для King)

Проект Thor:
└── ThorWheel (дефолт для Thor)
```

### Розміщення тем у src/, а не в public/

Усі конфіги, стилі та зображення тем зберігаються в `src/themes`. Це забезпечує:

- **Типобезпеку**: `config.ts` проходить перевірку TypeScript
- **Єдиний збірочний пайплайн**: SCSS компілюється, зображення копіюються без змін, ресурси автоматично потрапляють у `dist/`
- **Керованість та версіонування**: теми версіонуються разом із кодом, зміни легко відслідковуються та відкочуються
- **Автоматизацію**: спеціальний Vite-плагін генерує `themes-config.js` без ручного втручання

### Структура теми

```
src/themes/
├── _shared/                 # Не тема: теки, назва яких починається з "_" або ".", плагін ігнорує
│   ├── alpaFontSizes.ts     # Спільні кеглі тексту секторів для колес Alpa
│   └── sectorTextDefaults.scss  # Дефолтні позиції тексту секторів (viewBox)
├── AlpaWheelLight/
│   ├── config.ts
│   ├── theme.scss
│   ├── images/
│   └── styles/
│       ├── _animations.scss
│       └── _tokens.scss
├── AlpaWheelPro/
│   ├── config.ts
│   ├── theme.scss
│   ├── images/
│   └── styles/
│       ├── _animations.scss
│       └── _tokens.scss
├── AlpaWheelMax/            # Структура ідентична
├── AlpaWheelMart/           # Структура ідентична
├── KingWheel/
│   ├── config.ts
│   ├── theme.scss
│   ├── images/
│   └── styles/
│       ├── _animations.scss
│       └── _tokens.scss
└── ThorWheel/
    ├── config.ts
    ├── theme.scss
    ├── images/
    └── styles/
        ├── _animations.scss
        └── _tokens.scss
```

### Позиції тексту секторів

На кожному секторі рендеряться **три тексти**:

```
        ┌─────────────┐
        │ Bonus Prize │  ← .loot-box-prize-type (дуга по колу радіуса R)
        │             │
        │     500     │  ← .loot-box-sum       (x, y у viewBox)
        │     USD     │  ← .loot-box-currency  (x, y у viewBox)
        └─────────────┘
             сектор
```

Кожен сектор — це `<g class="sector">` у SVG з `viewBox="0 0 100 100"`, повернутий на `index × 45°`. Координати задаються в **viewBox-одиницях** (0–100, де 50 = центр колеса, 100 = зовнішній край). Ніяких `px` і ніяких CSS `transform` для позиціонування `.loot-box-prize-type`, `.loot-box-sum` і `.loot-box-currency`. Єдиний виняток — декоративна тінь суми `.loot-box-sum-shadow` (див. розділ про промо).

#### Головний файл — тільки один

```
src/themes/<НазваТеми>/styles/_tokens.scss
```

Наприклад, для `AlpaWheelMart`:

```scss
[data-theme='AlpaWheelMart'] {
  /* ... кольори ... */

  --sector-label-radius: 42;   /* дуга «Bonus Prize» */
  --sector-sum-x: 87;          /* «500» — правий край (text-anchor="end") */
  --sector-sum-y: 52;          /* «500» — вертикаль */
  --sector-currency-x: 86.7;   /* «USD» — правий край */
  --sector-currency-y: 56;     /* «USD» — вертикаль */
}
```

**Правило:** менше значення → текст **ближче до центру** колеса, далі від зовнішнього краю. Більше → до краю.

Крок 1–2 одиниці viewBox — помітний, але невеликий зсув.

**Після правки збережи файл і натисни F5.** JS читає значення один раз при mount, HMR може не оновити SVG-атрибути.

#### Поточні значення по темах

| Тема | radius | sum-x | currency-x | Стан |
|---|---|---|---|---|
| `_shared/sectorTextDefaults.scss` (дефолт) | 37 | 89 | 88.7 | fallback |
| AlpaWheel Light / Pro / Max / Mart | 42 | 87 | 86.7 | можна крутити |
| KingWheel | 41 | 87 | 86.4 | **прод — не чіпати без QA** |
| ThorWheel | 42 | 87 | 86.4 | **прод — не чіпати без QA** |

#### Інфраструктура (для розуміння, не для правки)

Ланцюжок від файлу до пікселя на екрані:

```
_tokens.scss                    ← ★ тут значення
    ↓ (Vite build)
dist/themes/<Theme>/theme.css
    ↓ (bootstrap.js додає <link> і data-theme на <html> iframe)
:root / [data-theme='...']      ← CSS custom properties у DOM
    ↓ (getComputedStyle)
utils/sector-text-layout.ts     ← readSectorTextLayout() читає 5 змінних
    ↓ (Vue reactive)
App.vue                         ← :x, :y на <text>, :d на <path>
    ↓
SVG-рендер у браузері
```

Файли за ролями:

| Файл | Роль | Правити для підгонки? |
|---|---|---|
| `src/themes/<Theme>/styles/_tokens.scss` | Значення `--sector-*` для теми | **Так** |
| `src/themes/_shared/sectorTextDefaults.scss` | Дефолти (`:root`) | Тільки для нової теми |
| `src/utils/sector-text-layout.ts` | Читає CSS → числа для Vue | Ні |
| `src/App.vue` | SVG-розмітка, підставляє `:x`, `:y`, `:d` | Ні |
| `src/themes/<Theme>/theme.scss` | Збирає CSS теми (`@use`) | Ні для позицій |
| `public/js/bootstrap.js` | Ставить `data-theme`, вантажить `theme.css` | Ні |

#### Як перевірити в DevTools

1. Відкрити test-сторінку (`test-lootbox.html?style=AlpaWheelMart&active=true`, для King/Thor — `test-king-lootbox.html` / `test-thor-lootbox.html`)
2. В Elements знайти **iframe** віджета (не батьківську сторінку)
3. Всередині iframe вибрати `<html data-theme="...">`
4. Вкладка **Computed** → фільтр `sector` → побачиш `--sector-label-radius: 42` і т.д.
5. На конкретному `<text class="loot-box-sum">` перевір атрибути `x` і `y` — вони мають дорівнювати значенням зі змінних.

#### Обмеження (важливо)

- `x`, `y`, `r` на SVG-елементах **не можна** задавати через CSS (`.loot-box-sum { x: var(...) }`) — браузер інтерпретує їх як px, текст зникає з viewBox. Тому значення читає JS і ставить як SVG-атрибути.
- Для дуги «Bonus Prize» використовується `<path>` (не `<circle>`) — `textPath` рендериться тільки на `<path>`. Path будується функцією `buildLabelArcPath(radius)` у `sector-text-layout.ts`.
- Не додавай `transform: translate(...)` на `.loot-box-prize-type`, `.loot-box-sum`, `.loot-box-currency` — це старий спосіб зсуву, замінений на viewBox-змінні. Змішувати їх не можна.

#### Історія міграції

До рефактора зсув робили через CSS `transform: translate(Npx)` прямо в `theme.scss` кожної теми. Це давало неконсистентні значення (King: 4px, Thor: 5px, Alpa: 7px), не масштабувалось однаково і мало прихований підводний камінь: у SVG `translate(Npx)` = **N одиниць viewBox**, не CSS-пікселів.

Формула переносу у нові змінні:

```
label:    --sector-label-radius   = 37   + N   (translate(Npx) на підписі)
sum:      --sector-sum-x          = 89   − N   (translate(−Npx))
currency: --sector-currency-x     = 88.7 − N   (translate(−N%))
```

Звідси King = `37+4 = 41`, Thor = `37+5 = 42`, Alpa = `37+5 = 42`.

### Динамічне завантаження

- **Query-параметри**:
  - `?project=alpa` - вибір проекту (дефолтна тема проекту)
  - `?style=AlpaWheelPro` - вибір теми за назвою (не за числовим `styleId`)
  - `?sectors=100%20FS;50%20USD` - налаштування секторів
  - `?sectors_type=Free%20Spins;USD` - типи призів для секторів
- **Автоматична компіляція** SCSS в CSS
- **Попереднє завантаження** зображень теми
- **Запобігання FOUC** (Flash of Unstyled Content)

### Життєвий цикл завантаження застосунку

**Послідовність виконання:**

1. **index.html** завантажується. Ранній inline-скрипт у `<head>` визначає тему для прелоадера і фону (`window.__lootboxBoot`), а за `?project=` запускає FullStory (alpa, king). Google Fonts підключені неблокуючим `<link media="print" onload>`, тож старт від них не залежить.
2. **`themes/themes-config.js`** і **bootstrap.js** (`public/js/bootstrap.js`) виконуються ДО main.ts: вибір теми, завантаження CSS, прогрів зображень.
3. **main.ts** чекає готовності теми (`window.currentTheme.ready`) і монтує Vue.
4. **App.vue** чекає завантаження зображень колеса (до 15 с), ховає прелоадер і лише тоді надсилає сайту `lootboxReady`.

Якщо `themes/themes-config.js` або `theme.css` не завантажились, віджет не стартує: на `<html>` ставиться `data-theme-failed`, прелоадер лишається на екрані, Vue не монтується і `lootboxReady` не надсилається.

### Система попереднього завантаження ресурсів

**Архітектура завантаження**: Реалізована двоетапна система для запобігання FOUC (Flash of Unstyled Content) та забезпечення миттєвого відображення теми.

**Етап 1: Bootstrap (bootstrap.js)**

- Парсинг URL параметрів та вибір теми
- Завантаження CSS стилів теми
- Попереднє завантаження критичних зображень теми (до 6 секунд; зображення, які не встигли, не блокують старт)
- Шрифти: якщо CSS Google Fonts уже прийшов, bootstrap чекає файли шрифтів у межах того самого ліміту 6 с від старту; якщо ні — не чекає
- Встановлення `window.currentTheme` з готовими ресурсами

**Етап 2: Vue ініціалізація (main.ts)**

- Очікування готовності теми (`window.currentTheme.ready`)
- Запуск Vue додатку тільки після завантаження CSS теми та критичних зображень
- Якщо тема не готова за 6 секунд, у консоль виводиться попередження, а очікування триває далі (прелоадер лишається); якщо bootstrap.js повідомив про збій (`data-theme-failed`), додаток не запускається

```javascript
// bootstrap.js - завантаження ресурсів теми
const cssReady = loadThemeStylesheet(selectedTheme)
const criticalImages = pickPreloadImages(themeImageUrls, isPromo)
await waitForAllImages(criticalImages, IMAGE_LOAD_TIMEOUT_MS) // до 6 с
if (!(await cssReady)) throw new Error('не завантажився theme.css')

// main.ts - синхронізація з готовністю теми
async function waitThemeReady(): Promise<boolean> {
  while (!window.currentTheme?.ready) {
    if (document.documentElement.hasAttribute('data-theme-failed')) return false
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS))
  }
  return true
}
```

**Критичні зображення** — усі зображення теми, крім відкладених (`winanimation`, `promo-center-anim`) і, залежно від режиму промо, зайвих `promo-*` або їхніх класичних пар (див. розділ про промо).

**Переваги:**

- Запобігання FOUC (Flash of Unstyled Content)
- Попереднє завантаження CSS стилів теми
- Попереднє завантаження критичних зображень теми в кеш браузера
- Оптимізоване завантаження зображень з `fetchPriority: 'high'`
- Асинхронне декодування зображень без блокування UI
- Гарантована готовність теми перед рендерингом
- Синхронізація завантаження ресурсів з ініціалізацією Vue

### Приклад конфігурації теми

```typescript
// src/themes/AlpaWheelLight/config.ts
import type { ThemeConfig } from '../../types/theme'
import { alpaFontSizes } from '../_shared/alpaFontSizes'

export const config: ThemeConfig = {
  name: 'AlpaWheelLight',
  styleId: 1,
  project: 'alpa', // Належність до проекту
  isProjectDefault: true, // Дефолтна тема для проекту Alpa
  backgroundColor: '#000a12',
  timings: {
    spinDuration: 8000, // код не читає (див. «Поля, які код не читає»)
    timeToPopup: 9000,
    winAnimationOffset: 0,
  },
  logic: {
    numberOfSpins: 1, // код не читає
    winSection: 0, // код не читає
  },
  // Усі колеса Alpa мають однакові кеглі — конфіг винесено у src/themes/_shared
  fontSizes: alpaFontSizes,
}
```

```typescript
// src/themes/KingWheel/config.ts (скорочено)
import type { ThemeConfig } from '../../types/theme'

export const config: ThemeConfig = {
  name: 'KingWheel',
  styleId: 3,
  project: 'king', // Належність до проекту King
  isProjectDefault: true, // Дефолтна тема для проекту King
  backgroundColor: '#F8F7FA',
  timings: {
    spinDuration: 8000,
    timeToPopup: 9000,
    winAnimationOffset: 2000, // На скільки мс раніше показувати win-анімацію
  },
  logic: {
    numberOfSpins: 1,
    winSection: 0,
  },
  // Період сезонного промо (див. розділ «Сезонне промо»)
  promoPeriod: {
    start: '2026-10-30T00:00:00+02:00',
    end: '2027-01-10T23:59:59+02:00',
  },
  // Кеглі тексту секторів на час промо (та сама структура, що fontSizes)
  promoFontSizes: { /* sum, currency, bonus */ },
  // Кастомні розміри шрифтів (опціонально)
  fontSizes: {
    sum: { short: '8', medium: '7', long: '6', veryLong: '5.5', extraLong: '4', max: '3' },
    currency: { short: '3.3', long: '2' },
    bonus: { default: '3.7', short: '3.7', medium: '3', long: '2' },
  },
}
```

**Обов'язкові поля конфігурації** (збірка падає, якщо їх немає або вони неправильного типу):

| Поле               | Тип     | Опис                                                                        |
| ------------------ | ------- | --------------------------------------------------------------------------- |
| `name`             | string  | Назва теми; має збігатися з назвою папки теми                               |
| `styleId`          | number  | Унікальний числовий ID (дублікат зупиняє збірку); за ним сортується реєстр  |
| `project`          | string  | Назва проекту (alpa, king, тощо), непорожня                                 |
| `isProjectDefault` | boolean | Рівно одна тема кожного проекту має `true`                                  |
| `timings`          | object  | `spinDuration`, `timeToPopup`, `winAnimationOffset` — числа                 |
| `logic`            | object  | `numberOfSpins`, `winSection` — числа                                       |

**Опціональні поля:**

| Поле              | Тип    | Опис                                                                                                             |
| ----------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| `fontSizes`       | object | Кастомні розміри шрифтів для секторів. Потрібен повний набір ключів (`sum`: short, medium, long, veryLong, extraLong, max; `currency`: short, long; `bonus`: default, short, medium, long), інакше збірка падає |
| `promoFontSizes`  | object | Кеглі на час промо; та сама структура і перевірка, що в `fontSizes`                                              |
| `backgroundColor` | string | Колір фону теми (див. «Поля, які код не читає»)                                                                  |
| `promoPeriod`     | object | `{ start, end }` — ISO-рядки з часовим поясом; `start` має бути раніше за `end`                                  |
| `seasons`         | array  | Сезони теми (див. розділ про сезони)                                                                             |

**Які поля керують поведінкою:**

| Поле                          | Що робить                                                                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `timings.timeToPopup`         | Відлік від зупинки колеса: `spinEnd` надсилається через `timeToPopup − 3000` мс (при 9000 — через 6 с після зупинки); win-анімація видима `timeToPopup` мс (останні 500 мс згасає); далі колесо ще 30 с тримає результат |
| `timings.winAnimationOffset`  | На скільки мс до зупинки колеса показати win-анімацію (0 — після зупинки)                                                                                                                         |
| `fontSizes`, `promoFontSizes` | Розміри шрифтів тексту секторів                                                                                                                                                                   |
| `promoPeriod`, `seasons`      | Автоматичне промо і сезони за датою                                                                                                                                                               |
| `name`, `project`, `isProjectDefault`, `styleId` | Вибір теми; `styleId` лише впорядковує реєстр                                                                                                                                  |

#### Поля, які код не читає

Ці поля присутні в конфігах і типі `ThemeConfig`, збірка вимагає їх наявність (крім `backgroundColor`), але під час роботи віджета вони нічого не змінюють. Їх не видалено:

| Поле                   | Як є насправді                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `timings.spinDuration` | Тривалість обертання задана в коді: цикли по 3 с без результату і 14 с сповільнення з результатом                       |
| `logic.numberOfSpins`  | Кількість обертів задана в коді                                                                                         |
| `logic.winSection`     | Виграшний сектор приходить повідомленням `winSector`                                                                    |
| `backgroundColor`      | Потрапляє в `window.currentTheme.backgroundColor`, але ніде не використовується; колір фону прелоадера береться з `themeBgColors` в `index.html` |

### Створення нової теми

#### Крок 1: Створіть папку теми

```
src/themes/YourThemeName/
├── config.ts           # Конфігурація теми
├── theme.scss          # Головний файл стилів
├── images/             # Зображення теми
│   ├── preloader.svg   # Обов'язково!
│   ├── wheelpointer.webp
│   └── ...
└── styles/
    ├── _animations.scss
    └── _tokens.scss
```

#### Крок 2: Створіть config.ts

```typescript
import type { ThemeConfig } from '../../types/theme'

export const config: ThemeConfig = {
  // === ІДЕНТИФІКАЦІЯ ===
  name: 'YourThemeName', // Унікальна назва теми (PascalCase)
  styleId: 8, // Унікальний числовий ID (дублікат зупиняє збірку; зараз зайняті 1, 2, 3, 4, 6, 7)

  // === НАЛЕЖНІСТЬ ДО ПРОЕКТУ ===
  project: 'yourproject', // Назва проекту (lowercase)
  isProjectDefault: true, // true = ця тема буде застосована якщо
  // передано ?project=yourproject без ?style=

  // === НАЛАШТУВАННЯ АНІМАЦІЇ ===
  timings: {
    spinDuration: 8000, // Обов'язкове за типом, але код не читає
    timeToPopup: 9000, // Відлік від зупинки: spinEnd через timeToPopup − 3000 мс, win-анімація видима timeToPopup мс
    winAnimationOffset: 0, // На скільки мс раніше показувати win-анімацію (0 = стандартно)
  },

  // === ЛОГІКА ГРИ (обов'язкове за типом, але код не читає) ===
  logic: {
    numberOfSpins: 1,
    winSection: 0,
  },

  // === ОПЦІОНАЛЬНО: кастомні розміри шрифтів ===
  // fontSizes: { ... }
}
```

**Пояснення полів project та isProjectDefault:**

| Поле               | Призначення                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project`          | Визначає до якого проекту належить тема. Використовується для валідації: якщо передано `?project=alpa&style=KingWheel`, віджет проігнорує тему King (бо вона належить проекту `king`, а не `alpa`) і застосує дефолтну тему для Alpa. |
| `isProjectDefault` | Якщо `true`, ця тема буде застосована коли передано тільки `?project=yourproject` без вказання конкретної теми. **Важливо:** Лише одна тема проекту може мати `isProjectDefault: true`.                                                     |

#### Крок 3: Оновіть index.html

Перший inline-скрипт у `<head>` резолвить активну тему ще до завантаження
`themes-config.js` і кладе результат у `window.__lootboxBoot`. Від нього залежать
`<link rel="preload">` для `preloader.svg`, колір фону та `src` прелоадера в `<body>`.
Preload генерується автоматично для однієї резолвленої теми, тож нічого додавати не треба.

Таблиці в `index.html` треба вести вручну, але збірка їх перевіряє: якщо вони не збігаються з конфігами тем, `npm run build` (і dev-сервер) падає з поясненням.

**3.1. Додати тему в `PROJECT_THEMES` (для будь-якої нової теми):**

```javascript
var PROJECT_THEMES = {
  alpa: ['AlpaWheelLight', 'AlpaWheelPro', 'AlpaWheelMax', 'AlpaWheelMart'],
  king: ['KingWheel'],
  thor: ['ThorWheel'],
  yourproject: ['YourThemeName'], // ← тема (або новий проект з темою)
}
```

**3.2. Якщо це новий проект — додати маппінг в `PROJECT_DEFAULTS`:**

```javascript
var PROJECT_DEFAULTS = {
  alpa: 'AlpaWheelLight',
  king: 'KingWheel',
  thor: 'ThorWheel',
  yourproject: 'YourThemeName', // ← Додати новий проект
}
```

> Значення мають збігатися з темами, у яких `isProjectDefault: true`.

**3.3. Додати колір фону теми в `themeBgColors`:**

```javascript
var themeBgColors = {
  AlpaWheelLight: '#000a12',
  // ...
  YourThemeName: '#000a12', // ← колір фону прелоадера
}
```

> Збірка перевіряє лише наявність запису для кожної теми. Якщо запису немає, збірка падає. Щоб прелоадер не відрізнявся від теми кольором, тримайте значення таким самим, як `backgroundColor` у `config.ts`.

**3.4. Якщо новий проект має FullStory — додати Org ID в `fsOrgMap`:**

```javascript
var fsOrgMap = {
  alpa: 'FWWXX',
  king: 'o-207RBN-na1',
  // yourproject: '<FullStory Org ID>', // ← без запису FullStory для проекту не вантажиться
}
```

FullStory вмикається за `?project=`. Проект без запису в `fsOrgMap` (зараз це thor) працює без FullStory.

**3.5. Якщо стару назву проекту/теми вже роздано на прод — додати аліас:**

```javascript
var LEGACY_PROJECTS = { rocket: 'alpa' }
var LEGACY_THEMES = {
  RocketWheelLite: 'AlpaWheelLight',
  RocketWheelPro: 'AlpaWheelPro',
  RocketWheelMAX: 'AlpaWheelMax',
}
```

Мапи аліасів задані в `index.html`; `bootstrap.js` читає їх із `window.__lootboxBoot`. У самому `bootstrap.js` лишилася запасна копія цих мап на випадок, коли скрипт підключено окремо від `index.html`, тож при зміні аліасів оновлюйте обидва місця.

**Змінна `FALLBACK_THEME`** (`AlpaWheelLight`) — тема, яку `index.html` бере для прелоадера, коли в URL немає відомого проекту й відомої теми; збірка перевіряє, що така тема існує.

#### Крок 4: Оновіть тестові сторінки (опціонально)

Додайте новий проект і тему в селекти тестових сторінок `public/test-*.html` (наприклад, `public/test-lootbox.html`):

```html
<select id="projectSelect" class="theme-select">
  <option value="">— Без проекту —</option>
  <option value="alpa">Alpa</option>
  <option value="king">King</option>
  <option value="thor">Thor</option>
  <option value="yourproject">YourProject</option>
  <!-- ← Додати -->
</select>
```

І нову тему:

```html
<select id="themeSelect" class="theme-select">
  <option value="">— Дефолт проекту —</option>
  <option value="AlpaWheelLight" data-project="alpa">AlpaWheelLight (Alpa)</option>
  <option value="AlpaWheelPro" data-project="alpa">AlpaWheelPro (Alpa)</option>
  <option value="AlpaWheelMax" data-project="alpa">AlpaWheelMax (Alpa)</option>
  <option value="AlpaWheelMart" data-project="alpa">AlpaWheelMart (Alpa)</option>
  <option value="KingWheel" data-project="king">KingWheel (King)</option>
  <option value="ThorWheel" data-project="thor">ThorWheel (Thor)</option>
  <option value="YourThemeName" data-project="yourproject">YourThemeName (YourProject)</option>
  <!-- ← Додати -->
</select>
```

---

### Додавання теми до існуючого проекту

Якщо потрібно додати ще одну тему для вже існуючого проекту (наприклад, `AlpaWheelDark` для проекту Alpa):

1. Створіть тему як описано вище
2. В `config.ts` вкажіть `project: 'alpa'` та `isProjectDefault: false`
3. В `index.html` додайте тему в `PROJECT_THEMES` і колір фону в `themeBgColors` (`PROJECT_DEFAULTS` оновлювати НЕ потрібно; preload будується автоматично)
4. Для використання вказуйте явно: `?project=alpa&style=AlpaWheelDark`

---

### Чеклист створення теми

- [ ] Створено папку `src/themes/YourThemeName/` (назва папки = `name` у `config.ts`)
- [ ] Створено `config.ts` з усіма обов'язковими полями
- [ ] Вказано правильний `project` (lowercase)
- [ ] Встановлено `isProjectDefault: true` якщо це єдина або дефолтна тема проекту (рівно одна на проект)
- [ ] Створено `theme.scss`
- [ ] Додано `preloader.svg` в `images/`
- [ ] Оновлено `index.html`: `PROJECT_THEMES`, `themeBgColors`; для нового проекту ще `PROJECT_DEFAULTS` і, якщо потрібен FullStory, `fsOrgMap`
- [ ] `npm run build` проходить без помилок
- [ ] Протестовано на `test-lootbox.html` (або `test-<проект>-lootbox.html`)

### SCSS структура

Тема стилізує фіксований набір класів з `App.vue` (`.loot-box-spin-wheel-container`, `.wheel-sectors`, `.wheel-sectors-mask`, `.wheel-frame`, `.wheel-pointer`, `.wheel-center`, `.lamps`, `.lamp`, `.win-frame`, `.win-animation`, `.sector`, `.loot-box-sum`, `.loot-box-currency`, `.loot-box-prize-type` та інші). Змінні теми живуть під селектором `[data-theme='<Назва>']`. Найнадійніше — скопіювати файли найближчої існуючої теми і змінювати їх.

```scss
// theme.scss
@use './styles/animations';
@use '../_shared/sectorTextDefaults';
@use './styles/tokens';

.loot-box-spin-wheel-container {
  position: relative;
  width: 100vmin;
  height: 100vmin;
}

// ... стилі класів з App.vue
```

```scss
// styles/_tokens.scss
[data-theme='YourThemeName'] {
  --color-primary-5: #ffffad;
  --color-warning: #fdd835;
  --color-primary-2: #ffbb42;
  --color-win-highlight: #ffa000;

  /* Позиції тексту секторів (одиниці viewBox) */
  --sector-label-radius: 42;
  --sector-sum-x: 87;
  --sector-sum-y: 52;
  --sector-currency-x: 86.7;
  --sector-currency-y: 56;
}
```

```scss
// styles/_animations.scss
@keyframes lampFlashes1 {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
```

Приклад скорочений: реальні `_animations.scss` містять ще `lampFlashes2` та анімації очікування колеса.

## 📋 Сезонне промо (KingWheel)

Тема `KingWheel` має два візуальні стани — **класика** і **сезонне промо**. Перемикання повністю автоматичне: у вказаний період `bootstrap.js` підмінює зображення та CSS-атрибут, Vue вмикає додаткові оверлеї (наприклад, анімацію поверх центру в момент виграшу, якщо вона є в промо). Жодних змін на батьківському сайті чи редеплою не потрібно — досить редагувати `promoPeriod` у `config.ts`. Новий сезон = нові файли `promo-*` + стилі `_promo.scss` + дати.

> **Чому хардкод саме `KingWheel`?** Промо запитувалось точково під цю тему. Якщо знадобиться універсальне промо для інших тем — узагальнити через прапорець у `config.ts` (наприклад, `promo.enabled`) + власний `data-attribute` та partial-стиль.
>
> Коли варіантів більше двох і міняються лише окремі зображення — це не промо, а **сезони**: див. розділ «Сезони VIP (AlpaWheelMax)».

### Період активності — `promoPeriod`

```typescript
// src/themes/KingWheel/config.ts
export const config: ThemeConfig = {
  name: 'KingWheel',
  // ...
  promoPeriod: {
    start: '2026-10-30T00:00:00+02:00',
    end: '2027-01-10T23:59:59+02:00',
  },
}
```

Поле опціональне; формат — ISO-рядок з тайм-зоною. Валідацію виконує `vite-plugin-themes.ts` (`assertThemeConfig`): якщо `start`/`end` не парсяться як дата — збірка падає з помилкою.

Зміщення пояса пишеться явно: Київ взимку `+02:00`, влітку `+03:00`. Кінець включно (`now <= end`). Промо рахується один раз при завантаженні iframe за годинником пристрою.

### QA-override через URL

| Параметр | Поведінка |
|----------|-----------|
| `?promo=force` | Промо завжди увімкнено, незалежно від дати |
| `?promo=disable` | Промо завжди вимкнено, навіть всередині `promoPeriod` |
| (відсутній) | Працює дата з `promoPeriod` |

Інші значення ігноруються. Логіка: `bootstrap.js → isPromoActive()`.

### Як працює перемикання на старті

`bootstrap.js` під час ініціалізації iframe:

1. Рахує `isPromoActive` (URL-override → `promoPeriod` → `false`).
2. У `true`-режимі ставить `<html data-king-promo="active">` → активуються стилі з `src/themes/KingWheel/styles/_promo.scss`.
3. Прокидає прапорець у `window.currentTheme.isPromoActive` → доступно у Vue (`App.vue`).
4. Підмінює мапу зображень (див. наступний пункт), щоб у Vue-шаблонах не було розгалуження.

### Конвенція іменування ассетів: `promo-X` → `X`

У промо-режимі `bootstrap.js → buildImageMap` робить **автоматичну підміну**: будь-який файл `promo-<name>.<ext>` записується під ключем `<name>`, а Vue звертається до зображення тільки за коротким ключем.

```
images/center.webp        →  themeImages.center        (поза промо)
images/promo-center.webp  →  themeImages.center        (у промо)
```

То ж щоб додати промо-варіант існуючого зображення, **достатньо** покласти файл `promo-<original-name>.<ext>` у `src/themes/KingWheel/images/`. Vue-шаблони редагувати не треба. Розширення може відрізнятися від класичного (`promo-lampsstate1.svg` замінює `lampsstate1.webp`) — підміна йде за іменем без розширення.

Так само можна додати шар, якого класика не показує: `promo-pointerShadow.webp` стає `themeImages.pointerShadow`, а `_promo.scss` вмикає `.wheel-pointer-shadow`.

### Шари промо на одному полотні

Усі промо-картинки зручно звести на одне полотно, рівне віджету (наприклад, 1755×1755 = `100vmin`), і перевести координати шарів у відсотки контейнера. Тоді позиції в `_promo.scss` — це прості числа з макета, а не підбір на око.

- Маска секторів (`.wheel-sectors-mask`) — коло, що закінчується під кільцем; картинки секторів (`.wheel-bg`) можуть бути більшими за маску, щоб розділювачі мали потрібну товщину.
- Якщо сектори в картинці вже розвернуті так, що сектор стоїть по центру зверху, у промо прибирається доворот `.wheel-bg { transform: none }`.
- Якщо колби ламп намальовані на самій рамі, `.lamps` у промо піднімається над рамою (`z-index: 6`), інакше світіння сховається під рамою.

### Кеглі тексту в промо — `promoFontSizes`

Тексти секторів задаються в одиницях viewBox диска секторів. Якщо промо-диск іншого розміру, ніж класичний, ті самі кеглі виглядатимуть більшими чи меншими. Для цього в `config.ts` є `promoFontSizes` (та сама структура, що `fontSizes`): у промо `bootstrap.js` віддає їх замість `fontSizes`. Позиції текстів (`--sector-*`) перевизначаються в `_promo.scss`.

### Тінь суми — `.loot-box-sum-shadow`

Під кожною сумою в `App.vue` є другий `<text class="loot-box-sum-shadow">` з тим самим текстом. За замовчуванням він прихований (`display: none` у стилях `App.vue`); тема вмикає його, фарбує й зсуває у своїх стилях (`transform: translate(0, 0.5px)` — у одиницях viewBox), щоб отримати об'ємну тінь цифр.

### Promo-only ассети (без класичного аналога)

Якщо асет існує **тільки** у промо (наприклад, анімація поверх центру в момент виграшу), він залишається доступним **під повним ключем** `promo-<name>` — без підміни. Файл `promo-center-anim` необов'язковий: якщо його немає, оверлей не рендериться. Цей whitelist захардкоджений у `bootstrap.js → buildImageMap`:

```js
if (key.startsWith('promo-') && key !== 'promo-center-anim') {
  // підміна на короткий ключ
}
```

У шаблоні `App.vue` такий асет береться явно під повним ім'ям:

```vue
<img :src="themeImages['promo-center-anim']" ... />
```

**Якщо додаєте новий promo-only ассет:**

- [ ] Додати ім'я у виняток `buildImageMap` (інакше зʼявиться зайвий ключ типу `center-anim`)
- [ ] У шаблоні використовувати `themeImages['promo-<name>']` (повне ім'я з префіксом)
- [ ] Обернути у `v-if="isPromoActive && ..."` — щоб поза промо взагалі не рендерилось

### Відкладене завантаження важких асетів

Деякі асети не потрібні на старті — лише після виграшу. Їх винесено з критичного прелоаду в `bootstrap.js`, щоб не блокувати перший рендер колеса:

```js
// public/js/bootstrap.js
const DEFERRED_IMAGE_KEYS = new Set(['winanimation', 'promo-center-anim'])
```

Вони підвантажуються **у фоні з `App.vue → onMounted`** вже після появи колеса:

| Асет | Як підвантажується | Мета |
|------|--------------------|------|
| `winanimation` | `useWinAnimationPreloader` — Blob URL, потрібен щоб `@keyframes` у SVG перезапускались на кожному виграші | Кешований blob + унікальний URL |
| `promo-center-anim` | `new Image()` з `fetchPriority: 'low'` — звичайний warm-up HTTP-кешу | Animated WebP до win-стану вже в кеші |

**Якщо додаєте ще один важкий промо-асет:** додайте його ключ у `DEFERRED_IMAGE_KEYS` і пропишіть warm-up в `App.vue → onMounted`, симетрично з `promo-center-anim`.

### Vue-сторона: оверлей у момент виграшу

Промо може показувати додатковий шар поверх центру колеса лише у `showWinAnimation`-стані:

```vue
<!-- src/App.vue -->
<img
  v-if="isPromoActive && showWinAnimation && themeImages['promo-center-anim']"
  :src="themeImages['promo-center-anim']"
  class="wheel-center-sheep"
  alt=""
  @load="isSheepReady = true"
/>
```

`isPromoActive` приходить з `window.currentTheme.isPromoActive`; `showWinAnimation` керується анімацією колеса.

### Анти-блік патерн (важливо!)

**Контекст:** статичний центр колеса (`.wheel-center`) — окреме зображення `promo-center.webp` (у промо воно може бути й анімованим). Поверх нього при виграші зʼявляється `<img class="wheel-center-sheep">` з animated WebP. Якщо просто сховати статику синхронно з появою оверлею (`v-if` створює `<img>` → CSS `:has()` ховає статику), браузер ще не встиг декодувати перший кадр animated WebP — на 1–2 кадри видно **порожнечу** (блік).

**Рішення:** статика ховається лише після того, як `<img>` оверлею викликав `@load`. Це гарантує, що перший кадр анімації вже відмальовано в момент приховання статики.

```typescript
// src/App.vue (спрощено)
const isSheepReady = ref(false)

watch(showWinAnimation, show => {
  if (show) isSheepReady.value = false   // скидаємо для повторних спінів
})
```

```vue
<!-- Статика ховається тільки коли overlay GOTовий до показу -->
<img
  :src="themeImages.center"
  class="wheel-center"
  :class="{ 'wheel-center--hidden': isPromoActive && showWinAnimation && isSheepReady }"
/>
```

**Якщо додаєте ще один promo-only animated overlay:**

- [ ] Не скривайте підлеглий шар одразу за `v-if` — чекайте на `@load`
- [ ] Скидайте `isReady`-флаг при початку нового win-стану (інакше при повторному спіні шар приховається ще до завантаження)

### CSS-конвенція

- Всі промо-стилі живуть у `src/themes/KingWheel/styles/_promo.scss` під селектором `:root[data-king-promo='active']` — поза промо вони не застосовуються.
- Модифікатор `.wheel-center--hidden` визначений саме там (тільки `visibility: hidden`, без `display: none` — щоб не зʼїдати місце і не ламати layout).
- Класи `.wheel-center` (з `theme.scss`) і `.wheel-center-sheep` (з `_promo.scss`) мають збігатися за **шириною та `top`-позицією**, інакше overlay буде на пару відсотків вужчим за статику і виглядатиме як зменшений диск.

### Чеклист: тестування промо локально

- [ ] `npm run dev`
- [ ] Відкрити `test-king-lootbox.html`, обрати **KingWheel**, увімкнути **force promo** чекбоксом (це додає `?promo=force` до iframe)
- [ ] Зробити спін → переконатися, що лампи, розмиття, затемнення, рамка виграшного сектора і підсвітка суми працюють з промо-графікою
- [ ] Якщо в промо є `promo-center-anim` — переконатися, що:
  - оверлей зʼявляється на win-стані без бліку,
  - статичний центр прихований рівно під оверлеєм,
  - після зникнення win-frame статичний центр повертається,
  - повторний спін працює так само (без «миттєвого» приховання статики до завантаження)
- [ ] Перевірити Network: у критичному прелоаді лише промо-файли та класичні без промо-заміни; `promo-center-anim` (якщо є) грузиться у фоні після `onMounted`
- [ ] `?promo=disable` — класичне колесо без змін
- [ ] Перевірити на iOS Safari — артефактів масштабування не повинно бути (саме тому ассет використовується як прямий `<img src="…webp">`, а не загорнутим у SVG)

## 📋 Сезони VIP (AlpaWheelMax)

У темі `AlpaWheelMax` (RocketWheel Max) разом із VIP-сезоном міняється колір кристала у двох місцях: **поінтер** (`wheelpointer`) і **центр колеса** (`centerbg`). Решта колеса не змінюється. Перемикання автоматичне, за датою — редеплой на кожен сезон не потрібен.

Механізм загальний: будь-яка тема може оголосити `seasons`. Теми без `seasons` проходять крізь нього без змін.

### Розклад — `seasons`

```typescript
// src/themes/AlpaWheelMax/config.ts
seasons: [
  { id: 'milky-way', start: '2026-10-02T00:00:00Z' },
  { id: 'orion-nebula', start: '2027-01-04T10:01:00Z' },
  { id: 'eagle-nebula', start: '2027-03-01T10:01:00Z' },
  { id: 'andromeda', start: '2027-05-02T10:01:00Z', end: '2027-08-02T10:00:00Z' },
],
```

| Сезон | Початок (UTC) | Колір | Файли |
|---|---|---|---|
| `milky-way` | 02.10.2026 00:00 | синій | `wheelpointer--milky-way.webp`, `centerbg--milky-way.webp` |
| `orion-nebula` | 04.01.2027 10:01 | фіолетовий | `…--orion-nebula.webp` |
| `eagle-nebula` | 01.03.2027 10:01 | зелений | `…--eagle-nebula.webp` |
| `andromeda` | 02.05.2027 10:01 (до 02.08.2027 10:00) | рожевий | власних немає — базові `wheelpointer.webp`, `centerbg.webp` |

Правила:

- **Час — тільки UTC.** Дати пишуться з `Z` (`2027-01-04T10:01:00Z`); збірка падає, якщо `Z` немає. Рядок без зони `Date.parse` читає як місцевий час пристрою, і межа сезону зсунулась би на зміщення поясу.
- **Порівнюються абсолютні моменти часу** (`Date.now()` проти `Date.parse(start)`), тож сезон перемикається в одну мить для всіх гравців незалежно від часового поясу пристрою.
- **Сезон триває від свого `start` до `start` наступного.** У задачі сезони записані як «до 10:00» і «з 10:01» — хвилина між ними лишається за попереднім сезоном, базовий вигляд не блимає.
- **`end`** (не включно) потрібен лише там, де після сезону нічого не йде.
- **До першого сезону і після останнього** — базові зображення (`season = null`).
- Сезон обчислюється **один раз при завантаженні iframe** за годинником пристрою. Вкладка, відкрита в момент зміни сезону, покаже новий колір після перезавантаження.

### Конвенція іменування: `<ключ>--<id сезону>`

Сезонний файл лежить поруч із базовим у `images/`:

```
wheelpointer.webp              ← базовий
wheelpointer--milky-way.webp   ← сезон milky-way
centerbg.webp
centerbg--milky-way.webp
```

В активному сезоні `bootstrap.js` кладе сезонний файл під базовий ключ, тому `App.vue` без жодних умов бере `themeImages.wheelpointer` і `themeImages.centerbg`. Якщо для сезону файлу немає — лишається базовий (так працює `andromeda`).

- Полотно сезонного файлу має збігатися з базовим (поінтер 1020×785, центр 300×300) — тоді CSS правити не треба.
- Збірка перевіряє імена: суфікс після `--` має бути оголошеним сезоном, а частина до `--` — наявним базовим зображенням. Одруківка (`wheelpointer--milkyway.webp`) зупиняє збірку, а не показує мовчки базову картинку.
- WebP від дизайнера приходять майже без стиснення — пережати в q=90, як решту ассетів Alpa.

### Прелоад

У критичний прелоад потрапляють лише файли активного сезону: зображення інших сезонів і базові файли, які сезон перекриває, не завантажуються. Кількість і вага критичних зображень не змінюються.

### Override через URL

| Параметр | Дія |
|---|---|
| `?season=<id>` | примусово показати сезон (QA або батьківський сайт, який знає сезон гравця) |
| `?season=none` | примусово базовий вигляд |
| `?season_at=<ISO UTC>` | підставити «зараз» для перевірки меж (тільки QA), напр. `season_at=2027-01-04T10:01:00Z` |

`season` має пріоритет над `season_at`. Невідомий `season` або нечитабельний `season_at` → `console.warn` і звичайна логіка за датою. На темах без `seasons` параметри нічого не роблять.

Активний сезон видно в `window.currentTheme.season` та в атрибуті `<html data-season="…">`.

### Як додати наступний сезон

1. Покласти `wheelpointer--<id>.webp` і `centerbg--<id>.webp` у `src/themes/AlpaWheelMax/images/`.
2. Додати рядок `{ id, start }` у `seasons` (у порядку зростання дат, час у UTC з `Z`).
3. `npm run build`.

### Чеклист: перевірка сезонів локально

- [ ] `npm run dev` → `test-alpa-lootbox.html`, тема **AlpaWheelMax**
- [ ] Список **VIP сезон**: кожен сезон показує свій колір поінтера й центру; `andromeda` і `none` — рожевий
- [ ] Поле дати: `2027-01-04T10:00:30Z` → ще `milky-way`, `2027-01-04T10:01:00Z` → `orion-nebula`
- [ ] Network: у сезоні є лише два файли `--<сезон>`, базових `wheelpointer.webp` / `centerbg.webp` немає
- [ ] Спін: обертання і згасання кристала в центрі як раніше
- [ ] Інші теми (Light / Pro / Mart, KingWheel, ThorWheel) з `?season=milky-way` не змінюються

## 📋 Конфігурація через URL

### Підтримувані параметри

Проект підтримує такі параметри:

- **`project`** - назва проекту (string, наприклад: `alpa`, `king`, `thor`)
- **`style`** - назва теми (string, наприклад: `AlpaWheelLight`, `KingWheel`); це назва, а не числовий `styleId`
- **`ab`** - активація A/B тестування (boolean, `true` для активації; працює лише з `project` і без `style`)
- **`sectors`** - список з 8 призів, розділених `;`; кожен приз — «значення пробіл валюта»
- **`sectors_type`** - типи призів для кожного сектора, розділені `;`; обов'язковий
- **`active`** - активність лутбокса (boolean, за замовчуванням true)
- **`user_id`** - ID користувача: впливає на A/B варіант, додається до кожної події аналітики (string, опціонально)
- **`no_analytics`** - наявність параметра вимикає події (GA4 і FullStory) та завантаження FullStory
- **`fps`** - `true` показує FPS-монітор (діагностика)
- **`promo`** - QA-override сезонного промо KingWheel: `force` / `disable` (інші значення ігноруються). Деталі — у розділі «Сезонне промо (KingWheel)»
- **`season`** - примусовий VIP-сезон теми AlpaWheelMax: id сезону або `none` (опціонально; без параметра сезон обирається за датою в UTC). Деталі — у розділі «Сезони VIP (AlpaWheelMax)»
- **`season_at`** - QA-override поточного часу для перевірки меж сезонів (ISO-8601 у UTC, напр. `2027-01-04T10:01:00Z`)

> **Примітка про `sectors`:** колесо має рівно 8 секторів, тож потрібно 8 призів. Приз без пробілу (`JACKPOT`, `150%`) показується цілим як значення, з порожньою валютою. Якщо призів менше 8, частина секторів лишається порожньою; менше 2 чи більше 8 — список вважається некоректним, і всі сектори порожні. Без `sectors_type` список призів порожній.

> **Примітка про `vip_level`:** віджет цей параметр не читає. Тестові сторінки додають його до URL, але на колесо й аналітику він не впливає.

> **FullStory:** параметра `fs_org` немає. FullStory вмикається за `?project=` через таблицю `fsOrgMap` в `index.html` (зараз `alpa` і `king`); для `thor` і для запитів без `?project=` FullStory не завантажується. `?no_analytics` вимикає його теж.

### Логіка вибору теми

Пріоритети вибору теми:

1. **`?style=` без `?project=`** — використовується вказана тема (зворотна сумісність), A/B вимкнено
2. **`?project=` + `?style=`** — валідація належності теми до проекту, A/B вимкнено:
   - Якщо тема належить проекту — використовується вказана тема
   - Якщо тема **НЕ належить** проекту — ігнорується `style`, використовується дефолт проекту + console.warn
3. **`?project=` + `?ab=true`** (без `?style=`) — A/B тестування:
   - Якщо для проекту налаштовано A/B тест — тема обирається автоматично на основі варіанту користувача
   - Якщо A/B тест не налаштовано — використовується дефолтна тема проекту
4. **`?project=` без `?style=` та без `?ab=true`** — використовується дефолтна тема проекту, A/B вимкнено
5. **Fallback** — тема, яку обрав `index.html` для прелоадера (`AlpaWheelLight`):
   - невідомий `project` — `console.error` і ця тема;
   - невідома `style` без `project` — `console.warn` і ця тема.

Старі назви (`project=rocket`, `RocketWheel*`) перед вибором приводяться до нових (`alpa`, `AlpaWheel*`).

**Приклад валідації:**

```
?project=alpa&style=KingWheel
// ⚠️ KingWheel належить проекту "king", не "alpa"
// Результат: AlpaWheelLight (дефолт для alpa) + warning в консоль
```

### Приклади використання

Приклади скорочені: у реальному URL потрібні 8 призів у `sectors` і `sectors_type`.

```
# Використання дефолтної теми проекту (без A/B)
?project=king&sectors=100%20FS;5,000%20USD

# Використання конкретної теми проекту (A/B вимкнено)
?project=alpa&style=AlpaWheelPro&sectors=500%20USD

# Зворотна сумісність (без project)
?style=AlpaWheelLight&sectors=100%20FS

# A/B тестування (тема обирається автоматично)
?project=alpa&ab=true&sectors=500%20USD;1,000%20USD

# Повний приклад з A/B тестуванням та user_id
?project=alpa&ab=true&user_id=12345&sectors=500%20USD;1,000%20USD&sectors_type=Bonus%20Prize;Bonus%20Prize

# Без аналітики та FullStory (превʼю, тести)
?project=alpa&no_analytics&sectors=500%20USD;1,000%20USD&sectors_type=Bonus%20Prize;Bonus%20Prize
```

## 📋 A/B тестування

Віджет підтримує A/B тестування для порівняння різних тем в межах одного проекту. Система автоматично призначає користувачам варіант теми та відстежує конверсії через аналітику.

### Принцип роботи

1. **Ідентифікація користувача**: береться `user_id` з URL; якщо його немає, генерується випадковий `ab_user_id` (UUID) і зберігається в `localStorage`. Якщо сховище заблоковане, id генерується заново при кожному завантаженні, тож варіант може змінюватись. Для стабільного варіанту передавайте `user_id`
2. **Детерміністичне хешування**: рядок `userId + ':' + testId` хешується алгоритмом FNV-1a (32-бітне множення через `Math.imul`) для отримання стабільного числа
3. **Розподіл за вагою**: `хеш % 100` порівнюється з накопичуваними вагами варіантів (наприклад, 50/50)
4. **Прозорість**: Результат A/B тесту доступний в `window.currentTheme.abTest` та автоматично додається до всіх аналітичних подій
5. **Умова запуску**: лише з `?ab=true&project=…` і без `?style=` (див. «Коли A/B тест застосовується»)

### Конфігурація A/B тестів

Конфігурація знаходиться в `src/ab/config.ts`:

```typescript
// src/ab/config.ts
export interface ABVariant {
  id: string      // Ідентифікатор варіанту (A, B, C...)
  theme: string   // Назва теми для цього варіанту
  weight: number  // Вага (відсоток користувачів)
}

export interface ABTest {
  testId: string           // Унікальний ID тесту
  variants: ABVariant[]    // Масив варіантів
}

export type ABTestsConfig = Record<string, ABTest>

export const abTests: ABTestsConfig = {
  alpa: {
    testId: 'alpa_theme_v2',
    variants: [
      { id: 'A', theme: 'AlpaWheelLight', weight: 50 },
      { id: 'B', theme: 'AlpaWheelPro', weight: 50 },
    ],
  },
}
```

### Як працює вибір варіанту

```javascript
// bootstrap.js - спрощена логіка
function resolveABVariant(themesConfig, project, urlUserId) {
  const test = themesConfig.abTests[project]
  if (!test) return null

  const userId = urlUserId || getOrCreateABUserId()  // user_id з URL або id з localStorage
  const hash = fnv1aHash(userId + ':' + test.testId)  // детерміністичний хеш
  const variant = pickVariant(test.variants, hash)    // hash % 100 проти накопичених ваг

  return {
    testId: test.testId,
    variantId: variant.id,
    theme: findTheme(variant.theme)
  }
}
```

### Коли A/B тест застосовується

A/B тестування **вмикається** тільки якщо:

- Явно передано параметр `?ab=true`
- Вказано `?project=` (назва проекту)
- НЕ вказано `?style=` (конкретна тема)
- Для проекту налаштовано A/B тест в `config.ts`

**Приклад URL з A/B тестуванням:**
```
?project=alpa&ab=true&sectors=500%20USD;1000%20USD
```

### Коли A/B тест НЕ застосовується

A/B тестування **вимикається** якщо:

- Не передано параметр `?ab=true`
- Явно вказано параметр `?style=` — користувач/розробник обрав конкретну тему (навіть якщо передано `?ab=true`)
- Для проекту не налаштовано A/B тест в `config.ts`
- Тема з варіанту не знайдена в реєстрі тем
- Не вказано `?project=` (без проекту тест не визначається)
- Визначення варіанту завершилось помилкою — у консоль виводиться `console.error`, і показується тема без тесту

### Доступ до результату A/B тесту

```javascript
// В консолі браузера
window.currentTheme.abTest
// { testId: 'alpa_theme_v2', variantId: 'A' } або null
```

### Додавання нового A/B тесту

1. Відкрийте `src/ab/config.ts`
2. Додайте новий тест для потрібного проекту:

```typescript
export const abTests: ABTestsConfig = {
  alpa: {
    testId: 'alpa_theme_v2',
    variants: [
      { id: 'A', theme: 'AlpaWheelLight', weight: 50 },
      { id: 'B', theme: 'AlpaWheelPro', weight: 50 },
    ],
  },
  // Новий тест для проекту king
  king: {
    testId: 'king_theme_v1',
    variants: [
      { id: 'control', theme: 'KingWheel', weight: 80 },
      { id: 'experiment', theme: 'KingWheelNew', weight: 20 },
    ],
  },
}
```

3. Переконайтеся, що всі теми з варіантів існують в `src/themes/`
4. Перезапустіть dev-сервер для оновлення `themes-config.js`

### Тестування A/B функціоналу

```javascript
// Перевірити поточний варіант
console.log(window.currentTheme.abTest)

// Перевірити user ID
console.log(localStorage.getItem('ab_user_id'))

// Скинути user ID для отримання нового варіанту
localStorage.removeItem('ab_user_id')
location.reload()
```

### Сторінка тестування `test-ab.html`

Локальна сторінка для демонстрації та перевірки A/B логіки без деплою. Дозволяє візуально переконатися, як працює розподіл варіантів та передача даних в аналітику.

#### Структура сторінки

| Секція | Призначення |
|--------|-------------|
| **1. Попередній перегляд варіантів** | Два iframe (варіанти A і B) з назвами тем |
| **2. Симуляція реальних user_id** | Toggle + таблиця mock-користувачів для емуляції продового сценарію |
| **3. Живий A/B тест** | iframe з віджетом, інформація про поточного користувача, розподіл після скидань, кнопки керування (спін, скидання) |
| **4. Аналітичні події** | Лог подій на сторінці (не GA4-події, а внутрішній лог тестової сторінки) |

#### Режим симуляції user_id

При увімкненні toggle "Симуляція user_id" активується режим емуляції реальних користувачів:

- **Таблиця mock-користувачів**: 10 захардкоджених ID (`user_001`...`user_010`) з передбаченим варіантом A/B
- **Передбачення варіанту**: розраховується за тією ж логікою FNV-1a хешування, що й у `bootstrap.js`
- **Кнопка "Вибрати"**: встановлює `localStorage.ab_user_id` та перезавантажує iframe з `?user_id=<id>&ab=true`
- **"Скинути користувача"**: в режимі симуляції бере наступний ID з масиву циклічно

```javascript
// Mock-користувачі (test-ab.html)
const MOCK_USERS = [
  'user_001', 'user_002', 'user_003', 'user_004', 'user_005',
  'user_006', 'user_007', 'user_008', 'user_009', 'user_010'
]
```

#### Передача user_id в Google Analytics 4

| Режим | user_id в GA4 |
|-------|---------------|
| **Без симуляції** | Не передається (випадковий `ab_user_id` навмисно не відправляється) |
| **З симуляцією** | Передається: `?user_id=` → `window.currentTheme.userId` → GA4 |
| **На проді** | Передається реальний ID з фронтенду платформи |

Ланцюжок передачі:
1. `test-ab.html` додає `?user_id=user_003` до URL iframe
2. `bootstrap.js` парсить параметр → зберігає в `window.currentTheme.userId`
3. `useAnalytics.ts` включає `user_id` в кожну подію (`Widget Loaded`, `Lootbox View`, `Spin Started`, `Spin Ended`)

## 📋 Аналітика

Віджет інтегрований з FullStory та Google Analytics 4 для відстеження взаємодій користувачів та аналізу конверсій A/B тестів.

### Провайдери аналітики

| Провайдер | Призначення | Активація |
|-----------|-------------|-----------|
| **FullStory** | Запис сесій, heatmaps | За `?project=` через `fsOrgMap` в `index.html` (alpa, king); для thor не завантажується |
| **Google Analytics 4** | Конверсії, A/B аналіз | Завжди активний, якщо немає `?no_analytics` |

`?no_analytics` вимикає і відправку подій, і завантаження FullStory.

### Відстежувані події

| Подія | Коли відправляється | Параметри |
|-------|---------------------|-----------|
| `Widget Loaded` | Коли колесо готове: CSS теми та зображення завантажені, прелоадер прихований (разом з `lootboxReady`) | `theme`, `project` |
| `Lootbox View` | Одразу після `Widget Loaded` | `theme`, `project` |
| `Spin Started` | Коли колесо справді починає обертатися; `startSpin` під час обертання ігнорується і подію не створює | `theme`, `project` |
| `Spin Ended` | У момент відправки `spinEnd` (через `timeToPopup − 3000` мс після зупинки) | `prize`, `sector`, `theme`, `project`, `prize_type`, `prize_value`, `prize_currency` |

### Автоматичні параметри

До кожної події автоматично додаються:

```typescript
{
  session_id: string,      // UUID сесії (sessionStorage)
  host: string,            // Домен батьківського сайту (document.referrer)
  env: 'dev' | 'prod',     // Середовище
  active: 'true' | 'false', // Значення ?active (false — сторінка «спін уже використано»)
  user_id?: string,        // ?user_id з URL (якщо передано)
  ab_test_id?: string,     // ID A/B тесту (якщо активний)
  ab_variant?: string,     // Варіант A/B тесту (якщо активний)
}
```

Якщо сховище браузера заблоковане, `session_id` і ідентифікатор клієнта GA4 генеруються один раз на завантаження і зберігаються в памʼяті.

### GA4 інтеграція

Google Analytics 4 інтегрований через Cloudflare Worker проксі для обходу блокувальників реклами. Адреса проксі задана константою `GA_WORKER_URL` у `src/composables/useAnalytics.ts`; ідентифікатор вимірювання (measurement id) у віджеті не зберігається. Імена подій у GA4 перетворюються в snake_case (`Spin Ended` → `spin_ended`).

### Аналіз A/B конверсій в GA4

1. Відкрийте **Google Analytics** → **Explore** → **Free Form**
2. Додайте вимір: `ab_variant`
3. Додайте метрики: `Event count` для подій `lootbox_view`, `spin_started`, `spin_ended`
4. Порівняйте конверсію між варіантами A та B

### Використання в коді

```typescript
import { useAnalytics } from '@/composables/useAnalytics'

const { track } = useAnalytics()

// Відправка події
track('Custom Event', {
  custom_param: 'value'
})
// A/B параметри додаються автоматично
```

## 📋 Оптимізації

### Vue 3 + Composition API

**Переваги:**

- Краща продуктивність
- Tree-shaking
- TypeScript підтримка
- Модульна архітектура з винесенням важкої логіки в composables

## 📋 Система анімації

### Технічна реалізація

**requestAnimationFrame замість GSAP:**

```typescript
const handleAnimationFrame = (start: number, startAngle: number) => {
  const now = performance.now()
  const t = Math.min(1, (now - start) / duration)
  // Плавна анімація з easing
}
```

**Переваги:**

- Менший розмір бандла (без GSAP)
- Краща продуктивність на мобільних пристроях
- Повний контроль над анімацією
- Асинхронне декодування зображень

### Двофазна логіка роботи

1. **Фаза 1**: Обертання без результату (3s, linear): запускається командою `startSpin` і повторюється циклами по 3 с, поки не прийде результат. Команди «зупинитися» немає
2. **Фаза 2**: Spin to win (14s, ease-out): стартує, коли відомий виграшний сектор

**Динамічне переключення**: Якщо результат (`winSector`) прийшов посеред циклу, колесо зберігає поточну швидкість і сповільнюється 14 с від цього моменту (без стрибка кута). Якщо результат відомий уже на старті (`winSector` надіслано до `startSpin`) — 14 с від старту.

**Після зупинки:**

1. Win-анімація показується `timeToPopup` мс (9 с; останні 500 мс згасає)
2. `spinEnd` надсилається через `timeToPopup − 3000` мс після зупинки (6 с)
3. Колесо ще 30 с тримає результат, потім за 2 с плавно повертається в покачування очікування

Зупинка і `spinEnd` дублюються таймером, тому відбуваються вчасно і у фоновій вкладці (де `requestAnimationFrame` стоїть). Новий спін скасовує всі таймери попереднього виграшу, тож «застарілий» `spinEnd` не приходить. `startSpin` під час обертання ігнорується.

**Результат до `startSpin` і після зупинки**: `winSector`, надісланий до `startSpin` або після зупинки колеса, зберігається і використовується наступним спіном.

### Константи анімації

```typescript
const SPIN_WITHOUT_WIN_DURATION = 3000 // 3 секунди
const SPIN_WITH_WIN_DURATION = 14000 // 14 секунд
const SWITCH_EFFECTS_THRESHOLD = 0.7 // 70% прогресу
const RESET_DELAY = 30000 // утримання результату після win-анімації (30 с)
const RETURN_TO_WAITING_DURATION = 2000 // плавне повернення в покачування (2 с)
```

### Easing функції

```typescript
// Лінійна анімація для звичайного обертання
t = t

// Ease-out для виграшної анімації
t = 1 - Math.pow(1 - t, 4)
```

### Оптимізація продуктивності

- **requestAnimationFrame** для плавної анімації
- **Динамічне переключення** ефектів
- **Асинхронне декодування** зображень
- **Оптимізовані easing** функції

## 📋 PostMessage API

### Вхідні повідомлення

Віджет приймає повідомлення лише від батьківського вікна (`event.source === window.parent`).

```typescript
// Від батьківського сайту
{
  type: 'startSpin'
}
{
  type: 'winSector',
  data: 5 // індекс сектора: число 0..7
}
```

**`winSector`**: `data` — Number, індекс сектора в списку `sectors` (0 — перший приз). Числовий рядок (`"5"`) приводиться до числа і приймається. Некоректне значення (`null`, `""`, `true`, `8`, `-1`, `5.5`, `"abc"`) ігнорується з `console.error`: колесо продовжує крутитися і чекає коректного номера. Верхня межа — кількість призів мінус 1 (7, якщо список призів порожній).

### Вихідні повідомлення

Віджет надсилає їх у батьківське вікно з `targetOrigin = '*'`.

```typescript
// До батьківського сайту
{
  type: 'lootboxReady'
}
{
  type: 'spinEnd',
  data: { prize: '1000 USD', timestamp: 1234567890 }
}
```

Повідомлення `winSector` віджет сайту **не надсилає**: цей тип лише вхідний. `lootboxReady` не має даних. `prize` у `spinEnd` — «значення пробіл валюта» (порожній рядок, якщо для сектора немає даних).

### Безпека: як сайту приймати повідомлення

Оскільки `targetOrigin` дорівнює `'*'`, сайт має сам перевіряти відправника: приймати повідомлення лише коли `event.source === iframe.contentWindow` і `event.origin` дорівнює origin колеса. Приз для нарахування береться з відповіді бекенда: `prize` у `spinEnd` призначений лише для показу.

### Інтеграція для розробників

#### 1. Підключення iframe

```html
<iframe
  src="https://lootbox.example.com/?project=alpa&sectors=500%20USD;1000%20USD;10%20FS;20%20FS;35%20FS;25%20USD;100%20USD;250%20USD&sectors_type=Bonus%20Prize;Bonus%20Prize;Free%20Spins;Free%20Spins;Free%20Spins;Bonus%20Prize;Bonus%20Prize;Bonus%20Prize"
  id="lootbox-iframe"
>
</iframe>
```

> **Примітка:** адреса iframe має починатися з `https://`: на https-сайтах браузер блокує iframe з `http://`.

#### 2. Запуск анімації

```javascript
const iframe = document.getElementById('lootbox-iframe')
iframe.contentWindow.postMessage({ type: 'startSpin' }, '*')
```

#### 3. Встановлення виграшного сектора

```javascript
// Надсилаємо сектор, коли бекенд його повернув (після startSpin; ранній сектор теж зберігається)
iframe.contentWindow.postMessage(
  {
    type: 'winSector',
    data: 5, // індекс сектора: число 0..7
  },
  '*'
)
```

#### 4. Обробка результатів

```javascript
const WHEEL_ORIGIN = 'https://lootbox.example.com'

window.addEventListener('message', event => {
  if (event.source !== iframe.contentWindow) return
  if (event.origin !== WHEEL_ORIGIN) return
  if (!event.data || typeof event.data !== 'object') return

  if (event.data.type === 'spinEnd') {
    console.log('Приз для показу:', event.data.data.prize)
  }
})
```

### Типи повідомлень

**lootboxReady** - відправляється коли лутбокс готовий до роботи (CSS теми та зображення завантажені). Якщо `themes-config.js` або `theme.css` не завантажились, не надсилається.

**startSpin** - запускає анімацію обертання колеса; ігнорується, якщо колесо вже крутиться.

**winSector** - встановлює виграшний сектор (відправляється з батьківського сайту).

**spinEnd** - повідомляє про завершення анімації з призом і міткою часу.

## 📋 Тестування

### Прототип інтеграції

Тестові сторінки лежать у `public/`: `test-lootbox.html`, `test-alpa-lootbox.html`, `test-king-lootbox.html`, `test-thor-lootbox.html` та `test-ab.html`. Вхідні повідомлення від колеса сторінки приймають лише від власного iframe (`event.source === iframe.contentWindow`).

`test-lootbox.html` демонструє:

- Запуск анімації з батьківського сайту
- Встановлення виграшного сектора через dropdown
- Отримання результатів
- Динамічну зміну конфігурації
- Управління активністю лутбокса
- Логування з префіксами [WIDGET]/[PARENT]

### Запуск тестування

#### 1. Запустити dev сервер

```bash
npm run dev
```

#### 2. Відкрити тестовий файл

```
http://localhost:5173/test-lootbox.html
```

## 📋 Збірка та деплой

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
```

- `dist/` містить готові файли
- `themes-config.js` з конфігураціями всіх тем
- Зображення та стилі

`npm run build` складається з двох кроків: спочатку перевірка типів (`vue-tsc`), потім `vite build`. Помилка типів зупиняє збірку до її початку.

### Перевірки під час збірки

Теки в `src/themes`, назва яких починається з `_` або `.`, пропускаються; теки без `config.ts` теж (однаково в dev і в build). Збірка (і dev-сервер) падає з поясненням, якщо:

- `name` у конфігу не збігається з назвою папки теми;
- `project` порожній, або не задані повні `fontSizes`/`promoFontSizes`;
- `promoPeriod.start` не раніше за `promoPeriod.end`;
- повторюється `styleId` або `name`;
- у проекту не рівно одна тема з `isProjectDefault: true`;
- таблиці `index.html` (`PROJECT_DEFAULTS`, `PROJECT_THEMES`, `themeBgColors`, `FALLBACK_THEME`) не збігаються з конфігами тем;
- тема має `.scss`, а пакет `sass` не встановлено;
- файл `src/ab/config.ts` існує, але його не вдалося прочитати.

Нова тема потребує записів у таблицях `index.html` (а для нового проекту з FullStory — ще й у `fsOrgMap`); див. «Створення нової теми». Preload для `preloader.svg` будується автоматично.

### Розміщення на статичному хостингу

Проект адаптований для роботи як в корені сайту, так і в підпапках:

- **Корінь сайту**: `https://example.com/` - працює без змін
- **Підпапка**: `https://example.com/subfolder/` - працює без змін

Всі ресурси (CSS, зображення, скрипти) використовують відносні шляхи завдяки:

- `base: './'` у `vite.config.ts`
- Відносні шляхи у `bootstrap.js` та генерованих конфігураціях
- Відносні шляхи у `index.html`

Просто завантажте вміст папки `dist/` на ваш статичний хостинг в будь-яку директорію.
