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
│       └── bootstrap.js     # Ранній рантайм
├── src/
│   ├── composables/          # Перевикористовувана логіка
│   │   ├── useWheelAnimation.ts
│   │   └── usePostMessageBus.ts
│   ├── types/               # TypeScript типи
│   ├── utils/               # Утиліти (парсинг секторів)
│   ├── themes/              # Теми дизайну
│   │   ├── default/
│   │   │   ├── config.ts
│   │   │   ├── theme.scss
│   │   │   ├── images/
│   │   │   └── styles/
│   │   │       ├── _animations.scss
│   │   │       └── _tokens.scss
│   │   └── crown/
│   │       ├── config.ts
│   │       ├── theme.scss
│   │       ├── images/
│   │       └── styles/
│   │           ├── _animations.scss
│   │           └── _tokens.scss
│   └── App.vue              # Головний компонент
├── vite/                    # Конфігурація збірки
│   └── plugins/
│       └── vite-plugin-themes.ts
├── dist/                    # Зібрані файли
│   ├── js/
│   │   └── bootstrap.js     # Копія з public/js/
│   └── themes/              # Генеровані файли тем (з src/themes/)
│       ├── themes-config.js # Конфігурація всіх тем
│       ├── default/
│       │   ├── theme.css    # Компільований CSS (з src/themes/default/theme.scss)
│       │   └── images/      # Копія зображень (з src/themes/default/images/)
│       │       ├── bg.webp, logo.svg, preloader.svg, wheelpointer.webp, ...
│       └── crown/
│           ├── theme.css    # Компільований CSS (з src/themes/crown/theme.scss)
│           └── images/      # Копія зображень (з src/themes/crown/images/)
│               ├── bg.webp, logo.svg, preloader.svg, wheelpointer.webp, ...
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

### Розміщення тем у src/, а не в public/

Усі конфіги, стилі та зображення тем зберігаються в `src/themes`. Це забезпечує:

- **Типобезпеку**: `config.ts` проходить перевірку TypeScript
- **Єдиний збірочний пайплайн**: SCSS компілюється, зображення оптимізуються, ресурси автоматично копіюються у `dist/`
- **Керованість та версіонування**: теми версіонуються разом із кодом, зміни легко відслідковуються та відкочуються
- **Автоматизацію**: спеціальний Vite-плагін генерує `themes-config.js` без ручного втручання

### Структура теми

```
src/themes/
├── default/
│   ├── config.ts
│   ├── theme.scss
│   ├── images/
│   └── styles/
│       ├── _animations.scss
│       └── _tokens.scss
├── crown/
│   ├── config.ts
│   ├── theme.scss
│   ├── images/
│   └── styles/
│       ├── _animations.scss
│       └── _tokens.scss
```

### Динамічне завантаження

- **Query-параметри**:
  - `?style=1` - вибір теми за ID (default, crown, тощо)
  - `?sectors=100%20FS,50%20USD` - налаштування секторів
  - `?sectors_type=Free%20Spins,USD` - типи призів для секторів
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
// src/themes/default/config.ts
export const defaultTheme = {
  id: 1,
  name: 'Default Theme',
  sectors: ['100 FS', '50 USD', '200 EUR'],
  sectorsType: ['Free Spins', 'USD', 'EUR'],
  images: {
    wheel: '/themes/default/images/wheel.png',
    background: '/themes/default/images/background.png',
  },
  styles: {
    primary: '#007bff',
    secondary: '#6c757d',
    accent: '#28a745',
  },
}
```

### Створення нової теми

1. Створіть папку `src/themes/your-theme/`
2. Додайте `config.ts` з конфігурацією
3. Створіть `theme.scss` зі стилями
4. Додайте зображення в папку `images/`
5. Налаштуйте анімації в `styles/_animations.scss`
6. Визначте токени в `styles/_tokens.scss`

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

## 📋 Конфігурація через URL

### Підтримувані параметри

Проект підтримує 4 основних параметри:

- **`style`** - ID теми (число)
- **`sectors`** - список секторів з призами
- **`sectors_type`** - типи призів для кожного сектора
- **`active`** - активність лутбокса (boolean, за замовчуванням true)

### Приклади використання

```
?style=2&sectors=100%20FS,50%20USD&sectors_type=Free%20Spins,USD
?style=1&sectors=500%20USD&sectors_type=Bonus%20Prize&active=false
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
<iframe src="https://lootbox.example.com/?sectors=100%20FS&style=default" id="lootbox-iframe">
</iframe>
```

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
