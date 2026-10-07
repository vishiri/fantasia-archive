import type { I_ref } from 'app/types/I_vueCompositionShims'

export function createUseGlobalWindowButtons (deps: {
  getMode: () => string | undefined
  hasFaWindowControlBridge: () => boolean
  checkWindowMaximized: () => Promise<boolean>
  clearInterval: (id: number) => void
  onMounted: (hook: () => void | Promise<void>) => void
  onUnmounted: (hook: () => void | Promise<void>) => void
  ref: <T>(value: T) => I_ref<T>
  runFaAction: (
    id: 'closeApp' | 'minimizeApp' | 'resizeApp',
    payload: undefined
  ) => void
  setInterval: (handler: () => void, ms: number) => number
  shouldPollMaximized: (mode: string | undefined, hasBridge: boolean) => boolean
}): () => {
    isMaximized: I_ref<boolean>
    minimizeWindow: () => void
    resizeWindowThenRefreshMaximized: () => void
    tryCloseWindow: () => void
  } {
  return function useGlobalWindowButtons () {
    const isMaximized = deps.ref(true)

    let checkerInterval: number | undefined
    let maximizedCheckSerial = 0

    const minimizeWindow = (): void => {
      deps.runFaAction('minimizeApp', undefined)
    }

    const resizeWindowThenRefreshMaximized = (): void => {
      deps.runFaAction('resizeApp', undefined)
    }

    const tryCloseWindow = (): void => {
      deps.runFaAction('closeApp', undefined)
    }

    async function checkIfWindowMaximized (): Promise<void> {
      const shouldPoll = deps.shouldPollMaximized(
        deps.getMode(),
        deps.hasFaWindowControlBridge()
      )
      if (!shouldPoll) {
        return
      }
      maximizedCheckSerial += 1
      const serial = maximizedCheckSerial
      const maximized = await deps.checkWindowMaximized()
      if (serial !== maximizedCheckSerial) {
        return
      }
      isMaximized.value = maximized
    }

    deps.onMounted(async () => {
      if (checkerInterval !== undefined) {
        deps.clearInterval(checkerInterval)
      }

      await checkIfWindowMaximized()

      checkerInterval = deps.setInterval(() => {
        void checkIfWindowMaximized()
      }, 100)
    })

    deps.onUnmounted(async () => {
      maximizedCheckSerial += 1
      if (checkerInterval !== undefined) {
        deps.clearInterval(checkerInterval)
        checkerInterval = undefined
      }
    })

    return {
      isMaximized,
      minimizeWindow,
      resizeWindowThenRefreshMaximized,
      tryCloseWindow
    }
  }
}
