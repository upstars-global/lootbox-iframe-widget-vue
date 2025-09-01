<template>
  <div v-if="visible" class="fps-widget">
    <div class="row">
      <span>FPS</span>
      <strong>{{ currentDisplay }}</strong>
    </div>
    <div class="row">
      <span>Avg</span>
      <strong>{{ avgDisplay }}</strong>
    </div>
    <div class="row">
      <span>Min</span>
      <strong>{{ minDisplay }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * FpsMonitor - модульний компонент для моніторингу продуктивності
 *
 * Метрики:
 * - Current: миттєвий FPS на кожному кадрі
 * - Avg: середній FPS від startSpin до поточного моменту
 * - Min: глобальний мінімум з моменту монтування
 *
 * Захист від некорректних значень:
 * - Ігнорування перших 5 кадрів (прогрів)
 * - Оновлення мінімуму тільки в активній вкладці
 * - Валідація delta time
 */

import { ref, computed, onMounted, onBeforeUnmount, watchEffect } from 'vue'

interface FpsMessage {
  type: 'startSpin'
  data?: unknown
}

// Видимість через URL параметр
const isEnabled = () => new URLSearchParams(location.search).get('fps') === 'true'
const visible = ref<boolean>(isEnabled())
const onUrlChange = () => {
  visible.value = isEnabled()
}

// Стан вимірювань
const countingAvg = ref(false)
const currentRaw = ref(0)
const avgRaw = ref<number | null>(null)
const minRaw = ref<number | null>(null)

// RAF цикл
let rafId: number | null = null
let lastTs = 0
let startedAt = 0
let framesSinceStart = 0

// Захист від аномальних кадрів
const WARMUP_FRAMES = 5
let warmedFrames = 0

function startAvg(): void {
  countingAvg.value = true
  startedAt = performance.now()
  framesSinceStart = 0
  avgRaw.value = 0
}

function resetAvg(): void {
  countingAvg.value = false
  startedAt = 0
  framesSinceStart = 0
  avgRaw.value = null
}

function tick(ts: number): void {
  if (lastTs) {
    const dt = ts - lastTs
    if (dt > 0) {
      const fps = 1000 / dt
      currentRaw.value = fps

      // Оновлюємо мінімум тільки в активній вкладці після прогріву
      const pageVisible = document.visibilityState === 'visible'
      if (pageVisible && warmedFrames >= WARMUP_FRAMES) {
        minRaw.value = minRaw.value == null ? fps : Math.min(minRaw.value, fps)
      } else if (pageVisible) {
        warmedFrames++
      }

      // Середній FPS від startSpin
      if (countingAvg.value) {
        framesSinceStart++
        const elapsed = (performance.now() - startedAt) / 1000
        if (elapsed > 0) {
          avgRaw.value = framesSinceStart / elapsed
        }
      }
    }
  }
  lastTs = ts
  rafId = requestAnimationFrame(tick)
}

function startLoop(): void {
  if (rafId != null) return
  lastTs = 0
  warmedFrames = 0
  rafId = requestAnimationFrame(tick)
}

function stopLoop(): void {
  if (rafId != null) cancelAnimationFrame(rafId)
  rafId = null
}

// Відображення метрик
const currentDisplay = computed<string | number>(() => Math.round(currentRaw.value))
const avgDisplay = computed<string | number>(() =>
  countingAvg.value && avgRaw.value !== null ? Math.round(avgRaw.value) : '—'
)
const minDisplay = computed<string | number>(() =>
  minRaw.value == null ? '—' : Math.floor(minRaw.value)
)

// Обробка повідомлень
function onMessage(e: MessageEvent<FpsMessage>): void {
  const { data } = e
  if (!data?.type) return

  if (data.type === 'startSpin') {
    startAvg()
  }
}

watchEffect(() => {
  if (visible.value) {
    startLoop()
  } else {
    stopLoop()
  }
})

onMounted(() => {
  window.addEventListener('message', onMessage, { passive: true })
  window.addEventListener('popstate', onUrlChange, { passive: true })
  window.addEventListener('hashchange', onUrlChange, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
  window.removeEventListener('popstate', onUrlChange)
  window.removeEventListener('hashchange', onUrlChange)
  stopLoop()
  resetAvg()
})
</script>

<style scoped>
.fps-widget {
  position: fixed;
  top: 8px;
  right: 8px;
  z-index: 1000;
  font:
    12px/1.2 ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    'Liberation Mono',
    'Courier New',
    monospace;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 8px 10px;
  border-radius: 10px;
  min-width: 120px;
  user-select: none;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(2px);
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
</style>
