import type { I_ref } from 'app/types/I_vueCompositionShims'
export function createGlobalLanguageSelectorSpellcheckRefreshControl (deps: {
  nextTick: (fn?: () => void | Promise<void>) => Promise<void>
  onBeforeUnmount: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  runFaActionAwait: (id: 'refreshWebContentsAfterLanguage', payload: undefined) => Promise<boolean>
  watch: (
    source: () => boolean,
    effect: (visible: boolean) => void
  ) => void
}) {
  const spellcheckRefreshPopTransitionMs = 280
  const spellcheckRefreshTooltipAutoOpenBufferMs = 80

  function useGlobalLanguageSelectorSpellcheckRefreshControl (props: {
    show: boolean
  }): {
      tooltipOpen: I_ref<boolean>
    } {
    const tooltipOpen = deps.ref(false)

    let tooltipAutoOpenTimerId: ReturnType<typeof setTimeout> | undefined

    function clearTooltipAutoOpenTimer (): void {
      if (tooltipAutoOpenTimerId === undefined) {
        return
      }
      clearTimeout(tooltipAutoOpenTimerId)
      tooltipAutoOpenTimerId = undefined
    }

    deps.watch(
      () => props.show,
      (visible) => {
        clearTooltipAutoOpenTimer()
        if (!visible) {
          tooltipOpen.value = false
          return
        }
        void deps.nextTick(() => {
          tooltipAutoOpenTimerId = setTimeout(() => {
            tooltipAutoOpenTimerId = undefined
            tooltipOpen.value = true
          }, spellcheckRefreshPopTransitionMs + spellcheckRefreshTooltipAutoOpenBufferMs)
        })
      }
    )

    deps.onBeforeUnmount(() => {
      clearTooltipAutoOpenTimer()
    })

    return {
      tooltipOpen
    }
  }

  return {
    useGlobalLanguageSelectorSpellcheckRefreshControl
  }
}
