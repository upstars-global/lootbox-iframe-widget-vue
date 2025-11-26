<template>
  <div class="loot-box-spin-wheel-container">
    <img :src="themeImages.wheelouterglow" class="wheel-outer-glow" alt="" />
    <div class="lamps">
      <img
        :src="themeImages.lampsstate1"
        class="lamp"
        :class="[
          running ? 'lamp-spin-animation-1' : 'lamp-waiting-animation-1',
          active ? 'will-change-opacity' : '',
        ]"
        alt=""
      />
      <img
        :src="themeImages.lampsstate2"
        class="lamp"
        :class="[
          running ? 'lamp-spin-animation-2' : 'lamp-waiting-animation-2',
          active ? 'will-change-opacity' : '',
        ]"
        alt=""
      />
      <img :src="themeImages.lampsholders" class="lamp-holders" alt="" />
    </div>
    <img :src="themeImages.wheelframe" class="wheel-frame" alt="" />
    <div class="wheel-sectors-mask">
      <div
        class="wheel-sectors"
        :style="wheelSectorsStyles"
        id="wheel_sectors"
        :class="{
          'waiting-spin-animation': !running && !winAnimationStarted,
          'will-change-transform': running || (!running && !winAnimationStarted && active),
        }"
      >
        <img :src="themeImages.wheelsectorsbg" class="wheel-bg" alt="" />
        <svg class="bonus-type" viewBox="0 0 100 100" width="100" height="100">
          <defs>
            <path id="circle" d=" M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
          </defs>
          <g
            v-for="(section, index) in sectionsData"
            :key="index"
            class="sector"
            :style="sectorTransform(index)"
            :class="{
              ...winnerClass(index),
              'will-change-transform': running && active,
            }"
          >
            <text class="loot-box-prize-type" :font-size="getFontSize(section.type, 'bonus')">
              <textPath xlink:href="#circle" startOffset="50%" text-anchor="middle">
                {{ section.type }}
              </textPath>
            </text>
            <text
              class="loot-box-sum"
              :x="SUM_PRIZE_POSITION_X"
              :y="SUM_PRIZE_POSITION_Y"
              :font-size="getFontSize(section.prizeText, 'sum')"
              text-anchor="end"
            >
              {{ section.prizeText }}
            </text>
            <text
              class="loot-box-currency"
              :x="CURRENCY_POSITION_X"
              :y="CURRENCY_POSITION_Y"
              :font-size="getFontSize(section.prizeText, 'currency')"
              text-anchor="end"
            >
              {{ section.prizeCurrency }}
            </text>
          </g>
        </svg>
        <img
          :src="themeImages.wheelsectorsblurred"
          class="wheel-bg wheel-blurred"
          alt=""
          :style="{ opacity: `${motionBlurOpacity}` }"
        />
        <img :src="themeImages.sectorborder" class="sector-border" alt="" />
      </div>
      <img
        :src="themeImages.wheelmask"
        class="wheel-mask"
        :class="{ 'will-change-transform': running && active }"
        alt=""
        :style="{
          opacity: `${maskOpacity}`,
          transform: `rotate(${randomAngle}deg)`,
        }"
      />
    </div>
    <img :src="themeImages.pointerShadow" class="wheel-pointer-shadow" alt="" />
    <img :src="themeImages.wheelpointer" class="wheel-pointer" alt="" />
    <img :src="themeImages.center" class="wheel-center" alt="" />
    <div class="center-frame">
      <img
        :src="themeImages.centerbg"
        class="center-bg"
        :class="{
          'center-bg-animation-pause': maskOpacity > CENTER_BG_PAUSE_THRESHOLD,
          'will-change-transform': maskOpacity <= CENTER_BG_PAUSE_THRESHOLD && active,
        }"
        :style="{ opacity: `${1 - maskOpacity + OPACITY_OFFSET}` }"
        alt=""
      />
      <img
        v-if="!running && !winAnimationStarted"
        :src="themeImages.centerflashes"
        class="center-flashes"
        alt=""
      />
    </div>
    <img
      v-if="showWinAnimation"
      :src="themeImages.winframe"
      class="win-frame"
      alt=""
      :style="{ transform: `rotate(${randomAngle}deg)` }"
    />
    <img
      v-if="showWinAnimation"
      :src="themeImages.winanimation"
      class="win-animation"
      alt=""
      :style="{ opacity: winAnimationOpacity }"
    />
    <img
      v-if="!running && !winAnimationStarted"
      :src="themeImages.purplewave"
      class="purple-wave"
      alt=""
    />
    <div class="preload">
      <img v-if="running" :src="themeImages.winframe" alt="" />
      <img v-if="running" :src="themeImages.wheelmask" alt="" />
    </div>
  </div>
  <FpsMonitor />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { usePostMessageBus } from './composables/usePostMessageBus'
import { useWheelAnimation } from './composables/useWheelAnimation'
import FpsMonitor from './components/FpsMonitor.vue'

import type { LootboxMessages, Sector } from './types'
import { processSectorsFromUrl } from './utils/sectors-parser'

// Позиціонування тексту в секторах (SVG координати)
const SUM_PRIZE_POSITION_X = 89
const SUM_PRIZE_POSITION_Y = 52
const CURRENCY_POSITION_X = 88.7
const CURRENCY_POSITION_Y = 56
const SECTOR_ANGLE: number = 45

// Пороги для анімаційних ефектів
const CENTER_BG_PAUSE_THRESHOLD: number = 0.3
const OPACITY_OFFSET: number = 0.4
const PRELOADER_FADE_DELAY: number = 500

// Адаптивні розміри шрифтів залежно від довжини тексту
const FONT_SIZES = {
  SUM: {
    SHORT: '10',
    MEDIUM: '8',
    LONG: '7',
    VERY_LONG: '6',
    EXTRA_LONG: '4',
    MAX: '3',
  },
  CURRENCY: {
    SHORT: '3',
    LONG: '2',
  },
  BONUS_TYPE: {
    DEFAULT: '3.7',
    SHORT: '3.7',
    MEDIUM: '3',
    LONG: '2',
  },
} as const

// Конфігурація теми з bootstrap.js (завантажується динамічно)
const themeTimings = window.currentTheme?.timings

// Стан анімації колеса
const running = ref<boolean>(false)
const winAnimationStarted = ref<boolean>(false)
const showWinAnimation = ref<boolean>(false)
const angle = ref<number>(0)
const randomAngle = ref<number>(0)
const motionBlurOpacity = ref<number>(0)
const maskOpacity = ref<number>(0)
const winAnimationOpacity = ref<number>(1)
const animationId = ref<number | null>(null)

// Таймінги анімації (можуть бути перевизначені з теми)
const spinDuration = ref<number>(8000)
const timeToPopup = ref<number>(4000)
const preloaderTime = ref<number>(1500)

// Переможний сектор (встановлюється ззовні через postMessage)
const winnerSection = ref<number | null>(null)
const hasWinSection = computed(() => winnerSection.value !== null)

// Зображення теми (завантажуються динамічно)
const themeImages = window.currentTheme?.images ?? {}

// Активність лутбокса з URL параметрів
const active = window.currentTheme?.isActive ?? true

// Парсинг секторів з URL параметрів з валідацією
// Виконується один раз при ініціалізації для оптимізації продуктивності
const sectionsData = ((): Sector[] => {
  if (!window.currentTheme?.sectors || !window.currentTheme?.sectorsType) return []

  // Обробляємо сектори з URL параметрів після маунту компонента:
  // парсинг, валідація кількості, створення структурованих об'єктів
  const sectors = processSectorsFromUrl(
    window.currentTheme.sectors,
    window.currentTheme.sectorsType
  )
  if (sectors && sectors.isValid) {
    return sectors.sectors
  }
  return []
})()

// Класи для переможного сектора
const winnerClass = computed(() => {
  return (index: number) => ({
    winSector:
      winnerSection.value !== null && index === winnerSection.value && winAnimationStarted.value,
  })
})

// Стилі обертання колеса
const wheelSectorsStyles = computed(() => ({
  transform: `rotate(${angle.value}deg)`,
}))

// Розрахунок позиції сектора в градусах
const sectorTransform = (index: number): { transform: string } => {
  return {
    transform: `rotate(${index * SECTOR_ANGLE}deg)`,
  }
}

/**
 * Адаптивний розмір шрифту залежно від довжини тексту
 * Запобігає переповненню тексту в секторах
 */
const getFontSize = (text: string | undefined, type: 'sum' | 'currency' | 'bonus'): string => {
  if (!text) return FONT_SIZES.BONUS_TYPE.DEFAULT

  const length = text.length

  switch (type) {
    case 'sum':
      if (length < 3) return FONT_SIZES.SUM.SHORT
      if (length < 5) return FONT_SIZES.SUM.MEDIUM
      if (length < 8) return FONT_SIZES.SUM.LONG
      if (length < 10) return FONT_SIZES.SUM.VERY_LONG
      if (length < 12) return FONT_SIZES.SUM.EXTRA_LONG
      return FONT_SIZES.SUM.MAX

    case 'currency':
      return length < 9 ? FONT_SIZES.CURRENCY.SHORT : FONT_SIZES.CURRENCY.LONG

    case 'bonus':
      if (length < 15) return FONT_SIZES.BONUS_TYPE.SHORT
      if (length < 20) return FONT_SIZES.BONUS_TYPE.MEDIUM
      return FONT_SIZES.BONUS_TYPE.LONG
  }
}

/**
 * Валідація переможного сектора від бекенда
 * Захист від некорректних даних та fallback на сектор 0
 */
const validateWinnerSection = (value: number): number => {
  if (value >= 0 && value <= 7 && Number.isInteger(value)) {
    return value
  }
  console.error('Невірний winnerSection від бекенда:', value)
  return 0
}

// Комунікація з батьківським вікном через postMessage
const { postToParent } = usePostMessageBus<LootboxMessages>(
  {
    // Слухаємо: команда запуску колеса від сайту
    startSpin: () => {
      runWheel()
    },

    // Слухаємо: команда відправки виграшного сектора
    winSector: sector => {
      winnerSection.value = validateWinnerSection(sector)
    },
  },
  {
    onlyParent: true, // Безпека: приймаємо тільки від батьківського вікна
  }
)

// Анімація колеса з двофазною логікою
const { runWheel, setSpinEndCallback } = useWheelAnimation(
  {
    running,
    winAnimationStarted,
    showWinAnimation,
    angle,
    randomAngle,
    motionBlurOpacity,
    maskOpacity,
    winAnimationOpacity,
    animationId,
    winnerSection,
    hasWinSection,
  },
  spinDuration,
  timeToPopup,
  sectionsData
)

// Callback після завершення анімації
setSpinEndCallback(prize => {
  // Відправляємо у parent сайт: деталі призу (після зупинки)
  postToParent('spinEnd', { prize, timestamp: Date.now() })
})

// Ініціалізація компонента
onMounted(() => {
  // Завантаження конфігурації теми (якщо доступна)
  if (themeTimings) {
    preloaderTime.value = themeTimings.preloaderTime
    spinDuration.value = themeTimings.spinDuration
    timeToPopup.value = themeTimings.timeToPopup
  }

  // Плавне приховування прелоадера
  setTimeout(() => {
    const preloaderBg = document.querySelector('#preloader-bg') as HTMLElement
    if (preloaderBg) {
      preloaderBg.style.opacity = '0'
      setTimeout(() => {
        preloaderBg.style.display = 'none'
      }, PRELOADER_FADE_DELAY)
    }
  }, preloaderTime.value)

  running.value = false
  postToParent('lootboxReady') // Сигнал готовності до батьківського вікна
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})
</script>

<style>
/*
  Стилі завантажуються динамічно з теми (з URL параметрів ?style=N) через bootstrap.js для запобігання FOUC
  Архітектура:
  - index.html (базові)
  - bootstrap.js (завантаження) → themes/{theme}/theme.css
*/
</style>
