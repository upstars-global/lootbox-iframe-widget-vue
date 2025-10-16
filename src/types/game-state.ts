import type { Ref } from 'vue'

/**
 * GameState — стан колеса:
 * - running: чи зараз крутиться
 * - winAnimationStarted: чи показується win-анімація (також блокує waiting-spin-animation)
 * - showWinAnimation: чи відображається візуальна анімація виграшу (окремо від winAnimationStarted)
 * - angle/randomAngle: керують обертанням та маскою
 * - motionBlurOpacity/maskOpacity: прозорості ефектів
 * - winAnimationOpacity: прозорість анімації виграшу (для плавного зникнення)
 * - animationId: ref з requestAnimationFrame
 * - winnerSection: номер виграшного сектора (0-7) або null
 * - hasWinSection: чи є виграшний сектор
 */
export interface GameState {
  running: Ref<boolean>
  winAnimationStarted: Ref<boolean>
  showWinAnimation: Ref<boolean>
  angle: Ref<number>
  randomAngle: Ref<number>
  motionBlurOpacity: Ref<number>
  maskOpacity: Ref<number>
  winAnimationOpacity: Ref<number>
  animationId: Ref<number | null>
  winnerSection: Ref<number | null>
  hasWinSection: Ref<boolean>
}

/**
 * WheelAnimationCallbacks — callback'и для подій анімації:
 * - onSpinEnd: викликається після зупинки (деталі призу)
 */
export interface WheelAnimationCallbacks {
  onSpinEnd?: (prize: string) => void
}
