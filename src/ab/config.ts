/**
 * Конфігурація A/B-тестів лутбоксів
 *
 * Визначає варіанти тем для кожного проекту.
 * Розподіл користувачів відбувається в bootstrap.js на основі хешу userId.
 * A/B вмикається лише з `?ab=true&project=…` і без `?style=` в URL iframe.
 *
 * Щоб додати новий тест:
 * 1. Додай запис з ключем = назва проекту
 * 2. Вкажи унікальний testId (для аналітики)
 * 3. Опиши варіанти з темами та вагами (сума ваг = 100)
 */

export interface ABVariant {
  id: string
  theme: string
  weight: number
}

export interface ABTest {
  testId: string
  variants: ABVariant[]
}

export type ABTestsConfig = Record<string, ABTest>

export const abTests: ABTestsConfig = {
  // Ключ = нормалізована назва проекту. Старий ?project=rocket приводиться
  // до 'alpa' у bootstrap.js, тож старі посилання теж потрапляють у цей тест.
  //
  // testId оновлено (rocket_theme_v1 → alpa_theme_v1) навмисно: теми повністю
  // перемальовані під нові сегменти, тому попередні заміри незіставні, а нова
  // сіль хешу заново перерозподіляє користувачів між варіантами.
  //
  // alpa_theme_v1 → alpa_theme_v2: хеш розподілу виправлено (Math.imul у bootstrap.js),
  // частки стали 50/50 замість 51,5/48,5 — користувачі перерозподілені, заміри v1 незіставні.
  alpa: {
    testId: 'alpa_theme_v2',
    variants: [
      { id: 'A', theme: 'AlpaWheelLight', weight: 50 },
      { id: 'B', theme: 'AlpaWheelPro', weight: 50 },
    ],
  },
  // Приклад для іншого проекту:
  // king: {
  //   testId: 'king_theme_v1',
  //   variants: [
  //     { id: 'A', theme: 'KingWheel', weight: 70 },
  //     { id: 'B', theme: 'KingWheelV2', weight: 30 },
  //   ],
  // },
}
