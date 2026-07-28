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
│   └── js/
│       └── bootstrap.js     # Ранній рантайм + A/B тестування
├── src/
│   ├── ab/                   # A/B тестування
│   │   └── config.ts         # Конфігурація A/B тестів
│   ├── composables/          # Перевикористовувана логіка
│   │   ├── useWheelAnimation.ts    # Анімація колеса
│   │   ├── usePostMessageBus.ts    # PostMessage комунікація
│   │   ├── useAnalytics.ts         # Аналітика (FullStory, GA4)
│   │   ├── useImagePreloader.ts    # Попереднє завантаження зображень
│   │   └── useWinAnimationPreloader.ts # Прелоад win-анімації
│   ├── types/               # TypeScript типи
│   ├── utils/               # Утиліти (парсинг секторів)
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
└── test-lootbox.html        # Тестовий прототип
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
- Копіює зображення в `dist/themes/`
- Створює готову структуру для розподілу

**Bootstrap.js** (`public/js/bootstrap.js`):

- **Ранній рантайм** - виконується ДО main.ts
- **Парсинг URL параметрів** для вибору теми
- **Динамічне завантаження** CSS стилів теми
- **Попереднє завантаження** всіх зображень теми
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
- **Єдиний збірочний пайплайн**: SCSS компілюється, зображення оптимізуються, ресурси автоматично копіюються у `dist/`
- **Керованість та версіонування**: теми версіонуються разом із кодом, зміни легко відслідковуються та відкочуються
- **Автоматизацію**: спеціальний Vite-плагін генерує `themes-config.js` без ручного втручання

### Структура теми

```
src/themes/
├── _shared/                 # Не тема: директорії з "_" плагін ігнорує
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

Кожен сектор — це `<g class="sector">` у SVG з `viewBox="0 0 100 100"`, повернутий на `index × 45°`. Координати задаються в **viewBox-одиницях** (0–100, де 50 = центр колеса, 100 = зовнішній край). Ніяких `px` і ніяких CSS `transform` на тексті.

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

Звідси King = `37+4 = 41`, Thor = `37+5 = 42`, Alpa = `35+7 = 42`.

### Динамічне завантаження

- **Query-параметри**:
  - `?style=1` - вибір теми за ID (default, crown, тощо)
  - `?sectors=100%20FS;50%20USD` - налаштування секторів
  - `?sectors_type=Free%20Spins;USD` - типи призів для секторів
- **Автоматична компіляція** SCSS в CSS
- **Попереднє завантаження** зображень теми
- **Запобігання FOUC** (Flash of Unstyled Content)

### Життєвий цикл завантаження приложения

**Послідовність виконання:**

1. **index.html** завантажується
2. **bootstrap.js** (`public/js/bootstrap.js`) виконується ДО main.ts
3. **main.ts** чекає готовності теми (`window.currentTheme.ready`)
4. **Vue додаток** ініціалізується тільки після повного завантаження ресурсів

### Система попереднього завантаження ресурсів

**Архітектура завантаження**: Реалізована двоетапна система для запобігання FOUC (Flash of Unstyled Content) та забезпечення миттєвого відображення теми.

**Етап 1: Bootstrap (bootstrap.js)**

- Парсинг URL параметрів та вибір теми
- Завантаження CSS стилів теми
- Попереднє завантаження всіх зображень теми
- Встановлення `window.currentTheme` з готовими ресурсами

**Етап 2: Vue ініціалізація (main.ts)**

- Очікування готовності теми (`window.currentTheme.ready`)
- Запуск Vue додатку тільки після повного завантаження ресурсів
- Fallback механізм з таймаутом (6 сек)

```javascript
// bootstrap.js - завантаження ресурсів теми
const cssReady = loadThemeStylesheet(selectedTheme)
await waitForAllImages(selectedTheme.images, IMAGE_LOAD_TIMEOUT_MS)
await cssReady

// main.ts - синхронізація з готовністю теми
async function waitThemeReady(): Promise<void> {
  while (!window.currentTheme?.ready) {
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS))
  }
}
await waitThemeReady() // Vue ініціалізація
```

**Переваги:**

- Запобігання FOUC (Flash of Unstyled Content)
- Попереднє завантаження CSS стилів теми
- Попереднє завантаження всіх зображень теми в кеш браузера
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
    spinDuration: 8000,
    timeToPopup: 9000,
    winAnimationOffset: 0,
  },
  logic: {
    numberOfSpins: 1,
    winSection: 0,
  },
  // Усі колеса Alpa мають однакові кеглі — конфіг винесено у src/themes/_shared
  fontSizes: alpaFontSizes,
}
```

```typescript
// src/themes/KingWheel/config.ts
import type { ThemeConfig } from '../../types/theme'

export const config: ThemeConfig = {
  name: 'KingWheel',
  styleId: 3,
  project: 'king', // Належність до проекту King
  isProjectDefault: true, // Дефолтна тема для проекту King
  timings: {
    spinDuration: 8000,
    timeToPopup: 9000,
    winAnimationOffset: 2000, // На скільки мс раніше показувати win-анімацію
  },
  logic: {
    numberOfSpins: 1,
    winSection: 0,
  },
  // Кастомні розміри шрифтів (опціонально)
  fontSizes: {
    sum: { short: '8', medium: '7', long: '6', veryLong: '5.5', extraLong: '4', max: '3' },
    currency: { short: '3.3', long: '2' },
    bonus: { default: '3.7', short: '3.7', medium: '3', long: '2' },
  },
}
```

**Обов'язкові поля конфігурації:**

| Поле               | Тип     | Опис                               |
| ------------------ | ------- | ---------------------------------- |
| `name`             | string  | Унікальна назва теми               |
| `styleId`          | number  | Унікальний числовий ID             |
| `project`          | string  | Назва проекту (alpa, king, тощо) |
| `isProjectDefault` | boolean | Чи є ця тема дефолтною для проекту |
| `timings`          | object  | Налаштування часу анімацій         |
| `logic`            | object  | Логіка гри                         |

**Опціональні поля:**

| Поле        | Тип    | Опис                                  |
| ----------- | ------ | ------------------------------------- |
| `fontSizes` | object | Кастомні розміри шрифтів для секторів |

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
  styleId: 4, // Унікальний числовий ID (не повторюється)

  // === НАЛЕЖНІСТЬ ДО ПРОЕКТУ ===
  project: 'yourproject', // Назва проекту (lowercase)
  isProjectDefault: true, // true = ця тема буде застосована якщо
  // передано ?project=yourproject без ?style=

  // === НАЛАШТУВАННЯ АНІМАЦІЇ ===
  timings: {
    spinDuration: 8000, // Тривалість обертання (мс)
    timeToPopup: 9000, // Час до показу попапу (мс)
    winAnimationOffset: 0, // На скільки мс раніше показувати win-анімацію (0 = стандартно)
  },

  // === ЛОГІКА ГРИ ===
  logic: {
    numberOfSpins: 1, // Кількість обертів
    winSection: 0, // Дефолтний виграшний сектор
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
Preload генерується динамічно для однієї резолвленої теми, тож нічого додавати не треба.

**3.1. Якщо це новий проект — додати маппінг в `PROJECT_DEFAULTS`:**

```javascript
var PROJECT_DEFAULTS = {
  alpa: 'AlpaWheelLight',
  king: 'KingWheel',
  thor: 'ThorWheel',
  yourproject: 'YourThemeName', // ← Додати новий проект
}
```

> Значення мають збігатися з темами, у яких `isProjectDefault: true`.

**3.2. Додати колір фону теми в `themeBgColors`:**

```javascript
var themeBgColors = {
  AlpaWheelLight: '#000a12',
  // ...
  YourThemeName: '#000a12', // ← має збігатися з backgroundColor у config.ts
}
```

**3.3. Якщо стару назву проекту/теми вже роздано на прод — додати аліас:**

```javascript
var LEGACY_PROJECTS = { rocket: 'alpa' }
var LEGACY_THEMES = {
  RocketWheelLite: 'AlpaWheelLight',
  RocketWheelPro: 'AlpaWheelPro',
  RocketWheelMAX: 'AlpaWheelMax',
}
```

Мапи живуть тільки в `index.html`; `bootstrap.js` читає їх із `window.__lootboxBoot`
і нормалізує URL-параметри перед вибором теми. Не дублюйте їх у інших місцях.

#### Крок 4: Оновіть test-lootbox.html (опціонально)

Додайте новий проект в селект для тестування:

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
3. В `index.html` додайте тільки preload (projectDefaults оновлювати НЕ потрібно)
4. Для використання вказуйте явно: `?project=alpa&style=AlpaWheelDark`

---

### Чеклист створення теми

- [ ] Створено папку `src/themes/YourThemeName/`
- [ ] Створено `config.ts` з усіма обов'язковими полями
- [ ] Вказано правильний `project` (lowercase)
- [ ] Встановлено `isProjectDefault: true` якщо це єдина або дефолтна тема проекту
- [ ] Створено `theme.scss`
- [ ] Додано `preloader.svg` в `images/`
- [ ] Оновлено `index.html` (preload + projectDefaults якщо новий проект)
- [ ] Протестовано на `test-lootbox.html`

### SCSS структура

```scss
// theme.scss
@import './styles/tokens';
@import './styles/animations';

.lootbox-theme {
  // Основні стилі теми
}
```

```scss
// _tokens.scss
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --border-radius: 4px;
}
```

```scss
// _animations.scss
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

## 📋 Сезонне промо (KingWheel)

Тема `KingWheel` має два візуальні стани — **класика** і **літнє промо**. Перемикання повністю автоматичне: у вказаний період `bootstrap.js` підмінює зображення та CSS-атрибут, Vue вмикає додаткові оверлеї (наприклад, анімовану овечку в момент виграшу). Жодних змін на батьківському сайті чи редеплою не потрібно — досить редагувати `promoPeriod` у `config.ts`.

> **Чому хардкод саме `KingWheel`?** Промо запитувалось точково під цю тему. Якщо знадобиться універсальне промо для інших тем — узагальнити через прапорець у `config.ts` (наприклад, `promo.enabled`) + власний `data-attribute` та partial-стиль.

### Період активності — `promoPeriod`

```typescript
// src/themes/KingWheel/config.ts
export const config: ThemeConfig = {
  name: 'KingWheel',
  // ...
  promoPeriod: {
    start: '2026-05-15T10:00:00+03:00',
    end: '2026-05-29T18:00:00+03:00',
  },
}
```

Поле опціональне; формат — ISO-рядок з тайм-зоною. Валідацію виконує `vite-plugin-themes.ts` (`assertThemeConfig`): якщо `start`/`end` не парсяться як дата — збірка падає з помилкою.

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

То ж щоб додати промо-варіант існуючого зображення, **достатньо** покласти файл `promo-<original-name>.<ext>` у `src/themes/KingWheel/images/`. Vue-шаблони редагувати не треба.

### Promo-only ассети (без класичного аналога)

Якщо асет існує **тільки** у промо (наприклад, анімація овечки), він залишається доступним **під повним ключем** `promo-<name>` — без підміни. Цей whitelist захардкоджений у `bootstrap.js → buildImageMap`:

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

**Якщо додаєте ще один важкий промо-асет:** додайте його ключ у `DEFERRED_IMAGE_KEYS` і пропишіть warm-up в `App.vue → onMounted`, симетрично з овечкою.

### Vue-сторона: оверлей у момент виграшу

Промо може показувати додатковий шар поверх центру колеса лише у `showWinAnimation`-стані:

```vue
<!-- src/App.vue -->
<img
  v-if="isPromoActive && showWinAnimation"
  :src="themeImages['promo-center-anim']"
  class="wheel-center-sheep"
  alt=""
  @load="isSheepReady = true"
/>
```

`isPromoActive` приходить з `window.currentTheme.isPromoActive`; `showWinAnimation` керується анімацією колеса.

### Анти-блік патерн (важливо!)

**Контекст:** статичний центр колеса (`.wheel-center`) — окреме зображення `promo-center.webp`, яке у промо теж анімоване (підморгування). Поверх нього при виграші зʼявляється `<img class="wheel-center-sheep">` з animated WebP. Якщо просто сховати статику синхронно з появою оверлею (`v-if` створює `<img>` → CSS `:has()` ховає статику), браузер ще не встиг декодувати перший кадр animated WebP — на 1–2 кадри видно **порожнечу** (блік).

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
- [ ] Зробити спін → переконатися, що:
  - овечка зʼявляється на win-стані без бліку,
  - статичний центр прихований рівно під оверлеєм,
  - після зникнення win-frame статичний центр повертається,
  - повторний спін працює так само (без «миттєвого» приховання статики до завантаження)
- [ ] Перевірити Network: `promo-center-anim.webp` НЕ повинен бути у критичному прелоаді (грузиться у фоні з low priority після `onMounted`)
- [ ] Перевірити на iOS Safari — артефактів масштабування не повинно бути (саме тому ассет використовується як прямий `<img src="…webp">`, а не загорнутим у SVG)

## 📋 Конфігурація через URL

### Підтримувані параметри

Проект підтримує 8 основних параметрів:

- **`project`** - назва проекту (string, наприклад: `alpa`, `king`)
- **`style`** - назва теми (string, наприклад: `AlpaWheelLight`, `KingWheel`)
- **`ab`** - активація A/B тестування (boolean, `true` для активації)
- **`sectors`** - список секторів з призами
- **`sectors_type`** - типи призів для кожного сектора
- **`active`** - активність лутбокса (boolean, за замовчуванням true)
- **`vip_level`** - VIP рівень гравця (число від 0 до максимального рівня на проекті, за замовчуванням 0)
- **`fs_org`** - FullStory Org ID для відстеження взаємодій в iframe (string, опціонально)
- **`user_id`** - ID користувача для передачі в Google Analytics (string, опціонально)
- **`promo`** - QA-override сезонного промо KingWheel: `force` / `disable` (інші значення ігноруються). Деталі — у розділі «Сезонне промо (KingWheel)»

> **Примітка:** Параметр `vip_level` зарезервований для майбутнього використання. Наразі він не впливає на відображення колеса, але в майбутніх версіях може використовуватись для кастомізації дизайну залежно від VIP статусу гравця.

> **FullStory:** Параметр `fs_org` активує запис сесій FullStory всередині iframe. Якщо параметр не передано — FullStory не завантажується.

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
5. **Fallback** — перша тема в списку

**Приклад валідації:**

```
?project=alpa&style=KingWheel
// ⚠️ KingWheel належить проекту "king", не "alpa"
// Результат: AlpaWheelLight (дефолт для alpa) + warning в консоль
```

### Приклади використання

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

# Приклад з FullStory інтеграцією
?project=alpa&fs_org=FWWXX&sectors=500%20USD;1,000%20USD&sectors_type=Bonus%20Prize;Bonus%20Prize
```

## 📋 A/B тестування

Віджет підтримує A/B тестування для порівняння різних тем в межах одного проекту. Система автоматично призначає користувачам варіант теми та відстежує конверсії через аналітику.

### Принцип роботи

1. **Стабільна ідентифікація користувача**: При першому завантаженні генерується унікальний `ab_user_id` (UUID) і зберігається в `localStorage`
2. **Детерміністичне хешування**: Комбінація `userId + testId` хешується алгоритмом FNV-1a для отримання стабільного числа
3. **Розподіл за вагою**: Хеш використовується для вибору варіанту згідно з налаштованими вагами (наприклад, 50/50)
4. **Прозорість**: Результат A/B тесту доступний в `window.currentTheme.abTest` та автоматично додається до всіх аналітичних подій

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
    testId: 'alpa_theme_v1',
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
function resolveABVariant(themesConfig, project) {
  const test = themesConfig.abTests[project]
  if (!test) return null

  const userId = getOrCreateABUserId()  // з localStorage або новий UUID
  const hash = fnv1aHash(userId + ':' + test.testId)  // детерміністичний хеш
  const variant = pickVariant(test.variants, hash % 100)  // вибір за вагою

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

### Доступ до результату A/B тесту

```javascript
// В консолі браузера
window.currentTheme.abTest
// { testId: 'alpa_theme_v1', variantId: 'A' } або null
```

### Додавання нового A/B тесту

1. Відкрийте `src/ab/config.ts`
2. Додайте новий тест для потрібного проекту:

```typescript
export const abTests: ABTestsConfig = {
  alpa: {
    testId: 'alpa_theme_v1',
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
| **1. Інформація** | Поточні параметри: тема, варіант A/B, user_id, статус готовності |
| **2. Симуляція реальних user_id** | Toggle + таблиця mock-користувачів для емуляції продового сценарію |
| **3. Живий A/B тест** | iframe з віджетом, кнопки керування (спін, скидання) |
| **4. Лог подій** | Лог дій на сторінці (не GA4-події, а внутрішній лог тестової сторінки) |

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
3. `useAnalytics.ts` включає `user_id` в кожну GA4-подію (`Widget Loaded`, `Spin Started`, `Spin Ended`)

## 📋 Аналітика

Віджет інтегрований з FullStory та Google Analytics 4 для відстеження взаємодій користувачів та аналізу конверсій A/B тестів.

### Провайдери аналітики

| Провайдер | Призначення | Активація |
|-----------|-------------|-----------|
| **FullStory** | Запис сесій, heatmaps | Параметр `?fs_org=XXXXX` |
| **Google Analytics 4** | Конверсії, A/B аналіз | Завжди активний |

### Відстежувані події

| Подія | Коли відправляється | Параметри |
|-------|---------------------|-----------|
| `Widget Loaded` | Після завантаження всіх зображень | `theme`, `project` |
| `Lootbox View` | При монтуванні компонента | `theme`, `project` |
| `Spin Started` | При отриманні `startSpin` від батьківського сайту | `theme`, `project` |
| `Spin Ended` | Після зупинки колеса (за 3 сек до приховання win-анімації) | `prize`, `sector`, `theme`, `project`, `prize_type`, `prize_value`, `prize_currency` |

### Автоматичні параметри

До кожної події автоматично додаються:

```typescript
{
  session_id: string,      // UUID сесії (sessionStorage)
  host: string,            // Домен батьківського сайту (document.referrer)
  env: 'dev' | 'prod',     // Середовище
  ab_test_id?: string,     // ID A/B тесту (якщо активний)
  ab_variant?: string,     // Варіант A/B тесту (якщо активний)
}
```

### GA4 інтеграція

Google Analytics 4 інтегрований через Cloudflare Worker проксі для обходу блокувальників реклами:

```typescript
// src/composables/useAnalytics.ts
const GA4_ENDPOINT = 'https://still-band-a01d.upstars-marbella.workers.dev'
const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX'
```

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

1. **Фаза 1**: Звичайне обертання (3s, linear) - запускається по команді з батьківського сайту
2. **Фаза 2**: Spin to win (14s, ease-out) - при отриманні winnerSection з бекенда

**Динамічне переключення**: Анімація може переключатися між фазами в реальному часі без перезапуску.

### Константи анімації

```typescript
const SPIN_WITHOUT_WIN_DURATION = 3000 // 3 секунди
const SPIN_WITH_WIN_DURATION = 14000 // 14 секунд
const SWITCH_EFFECTS_THRESHOLD = 0.7 // 70% прогресу
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

```typescript
// Від батьківського сайту
{
  type: 'startSpin'
}
{
  type: 'winSector',
  data: 5 // номер сектора (0-7)
}
```

### Вихідні повідомлення

```typescript
// До батьківського сайту
{
  type: 'lootboxReady'
}
{
  type: 'winSector',
  data: { sector: 5, timestamp: 1234567890 }
}
{
  type: 'spinEnd',
  data: { prize: '1000 USD', timestamp: 1234567890 }
}
```

### Інтеграція для розробників

#### 1. Підключення iframe

```html
<iframe
  src="https://lootbox.example.com/?sectors=100%20FS&style=default&vip_level=5"
  id="lootbox-iframe"
>
</iframe>
```

> **Примітка:** Параметр `vip_level` можна передати при підключенні iframe для майбутньої кастомізації досвіду залежно від VIP статусу гравця.

#### 2. Запуск анімації

```javascript
const iframe = document.getElementById('lootbox-iframe')
iframe.contentWindow.postMessage({ type: 'startSpin' }, '*')
```

#### 3. Встановлення виграшного сектора

```javascript
// Встановлюємо сектор після запуску анімації
iframe.contentWindow.postMessage(
  {
    type: 'winSector',
    data: 5, // номер сектора (0-7)
  },
  '*'
)
```

#### 4. Обробка результатів

```javascript
window.addEventListener('message', event => {
  if (event.data.type === 'spinEnd') {
    console.log('Приз:', event.data.data.prize)
  }
})
```

### Типи повідомлень

**lootboxReady** - відправляється коли лутбокс готовий до роботи.

**startSpin** - запускає анімацію обертання колеса.

**winSector** - встановлює виграшний сектор (відправляється з батьківського сайту).

**spinEnd** - повідомляє про завершення анімації з результатом.

## 📋 Тестування

### Прототип інтеграції

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

### Розміщення на статичному хостингу

Проект адаптований для роботи як в корені сайту, так і в підпапках:

- **Корінь сайту**: `https://example.com/` - працює без змін
- **Підпапка**: `https://example.com/subfolder/` - працює без змін

Всі ресурси (CSS, зображення, скрипти) використовують відносні шляхи завдяки:

- `base: './'` у `vite.config.ts`
- Відносні шляхи у `bootstrap.js` та генерованих конфігураціях
- Відносні шляхи у `index.html`

Просто завантажте вміст папки `dist/` на ваш статичний хостинг в будь-яку директорію.
