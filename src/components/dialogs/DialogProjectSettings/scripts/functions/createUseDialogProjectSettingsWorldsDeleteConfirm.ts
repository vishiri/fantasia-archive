import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

export function createUseDialogProjectSettingsWorldsDeleteConfirm (deps: {
  clearInterval: (handle: ReturnType<typeof setInterval>) => void
  computed: <T>(fn: () => T) => I_computedRef<T>
  confirmDelaySec: number
  onUnmounted: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  setInterval: (handler: () => void, timeout: number) => ReturnType<typeof setInterval>
}): () => {
    closeMenu: () => void
    confirmDeleteDisabled: I_computedRef<boolean>
    menuOffset: I_computedRef<[number, number]>
    menuOpen: I_ref<boolean>
    onMenuHide: () => void
    onMenuShow: () => void
    onConfirmDelete: (onConfirm: () => void) => void
    secondsRemaining: I_ref<number>
  } {
  return function useDialogProjectSettingsWorldsDeleteConfirm () {
    const menuOpen = deps.ref(false)
    const secondsRemaining = deps.ref(deps.confirmDelaySec)
    let intervalId: ReturnType<typeof deps.setInterval> | null = null

    function clearCountdownInterval (): void {
      if (intervalId !== null) {
        deps.clearInterval(intervalId)
        intervalId = null
      }
    }

    function resetCountdown (): void {
      clearCountdownInterval()
      secondsRemaining.value = deps.confirmDelaySec
    }

    function startCountdown (): void {
      resetCountdown()
      intervalId = deps.setInterval(() => {
        if (secondsRemaining.value > 1) {
          secondsRemaining.value -= 1
        } else {
          secondsRemaining.value = 0
          clearCountdownInterval()
        }
      }, 1000)
    }

    function onMenuShow (): void {
      startCountdown()
    }

    function onMenuHide (): void {
      resetCountdown()
    }

    function closeMenu (): void {
      menuOpen.value = false
    }

    function onConfirmDelete (onConfirm: () => void): void {
      if (secondsRemaining.value > 0) {
        return
      }
      onConfirm()
      closeMenu()
    }

    const confirmDeleteDisabled = deps.computed(() => secondsRemaining.value > 0)

    const menuOffset = deps.computed(() => [0, 4] as [number, number])

    deps.onUnmounted(() => {
      clearCountdownInterval()
    })

    return {
      closeMenu,
      confirmDeleteDisabled,
      menuOffset,
      menuOpen,
      onMenuHide,
      onMenuShow,
      onConfirmDelete,
      secondsRemaining
    }
  }
}
