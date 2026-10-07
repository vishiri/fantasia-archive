import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

function createFaDeleteConfirmCountdown (deps: {
  clearInterval: (handle: ReturnType<typeof setInterval>) => void
  confirmDelaySec: number
  ref: <T>(value: T) => I_ref<T>
  setInterval: (handler: () => void, timeout: number) => ReturnType<typeof setInterval>
}): {
    resetCountdown: () => void
    secondsRemaining: I_ref<number>
    startCountdown: () => void
    stopCountdown: () => void
  } {
  const secondsRemaining = deps.ref(deps.confirmDelaySec)
  let intervalId: ReturnType<typeof deps.setInterval> | null = null

  function stopCountdown (): void {
    if (intervalId !== null) {
      deps.clearInterval(intervalId)
      intervalId = null
    }
  }

  function resetCountdown (): void {
    stopCountdown()
    secondsRemaining.value = deps.confirmDelaySec
  }

  function startCountdown (): void {
    resetCountdown()
    intervalId = deps.setInterval(() => {
      if (secondsRemaining.value > 1) {
        secondsRemaining.value -= 1
      } else {
        secondsRemaining.value = 0
        stopCountdown()
      }
    }, 1000)
  }

  return {
    resetCountdown,
    secondsRemaining,
    startCountdown,
    stopCountdown
  }
}

export function createUseFaDeleteConfirmButton (deps: {
  clearInterval: (handle: ReturnType<typeof setInterval>) => void
  computed: <T>(fn: () => T) => I_computedRef<T>
  confirmDelaySec: number
  onUnmounted: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  setInterval: (handler: () => void, timeout: number) => ReturnType<typeof setInterval>
  watch: (
    source: I_ref<boolean>,
    callback: (isOpen: boolean) => void
  ) => void
}): (input: {
    isRemoveDisabled: () => boolean
  }) => {
    closeMenu: () => void
    confirmDeleteDisabled: I_computedRef<boolean>
    menuOffset: I_computedRef<[number, number]>
    menuOpen: I_ref<boolean>
    onMenuHide: () => void
    onMenuShow: () => void
    onConfirmDelete: (onConfirm: () => void) => void
    secondsRemaining: I_ref<number>
  } {
  return function useFaDeleteConfirmButton (input) {
    const menuOpen = deps.ref(false)
    const countdown = createFaDeleteConfirmCountdown(deps)

    function onMenuShow (): void {
      countdown.startCountdown()
    }

    function onMenuHide (): void {
      countdown.resetCountdown()
    }

    function closeMenu (): void {
      menuOpen.value = false
    }

    function onConfirmDelete (onConfirm: () => void): void {
      if (countdown.secondsRemaining.value > 0) {
        return
      }
      onConfirm()
      closeMenu()
    }

    const confirmDeleteDisabled = deps.computed(() => countdown.secondsRemaining.value > 0)
    const menuOffset = deps.computed(() => [0, 4] as [number, number])
    const removeDisabled = deps.computed(() => input.isRemoveDisabled())

    deps.watch(menuOpen, (isOpen) => {
      if (isOpen) {
        countdown.startCountdown()
      } else {
        countdown.resetCountdown()
      }
    })

    deps.watch(removeDisabled, (isDisabled) => {
      if (!isDisabled) {
        return
      }
      menuOpen.value = false
    })

    deps.onUnmounted(() => {
      countdown.stopCountdown()
    })

    const secondsRemaining = countdown.secondsRemaining
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
