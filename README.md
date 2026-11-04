# lootbox-iframe-widget-vue

Незалежний Vue 3 iframe-віджет лутбокса з модульною системою тем, A/B тестуванням та аналітикою.

## Основні можливості

- **Мультипроектність** — підтримка проектів Alpa, King, Thor з окремими темами
- **A/B тестування** — розподіл користувачів між варіантами тем; вмикається лише з `?ab=true&project=…` і без `?style=`
- **Аналітика** — події у Google Analytics 4 та FullStory (FullStory вмикається за `?project=`); `?no_analytics` вимикає обидва
- **PostMessage API** — двостороння комунікація з батьківським сайтом: команди `startSpin` і `winSector` від сайту, повідомлення `lootboxReady` і `spinEnd` від колеса
- **Оптимізована анімація** — requestAnimationFrame без GSAP

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

`npm run build` спочатку перевіряє типи, і лише після цього збирає проект; помилка типів зупиняє збірку. Збірка також перевіряє конфіги тем і таблиці в `index.html` (деталі — у документації).

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Documentation

**[Повна документація проекту](DOCUMENTATION.md)** - детальний опис архітектури, системи тем, API, анімації та тестування

**[Гайд з інтеграції](INTEGRATION_GUIDE.md)** - як підключити віджет через iframe: повідомлення, query-параметри, перевірка відправника, аналітика
