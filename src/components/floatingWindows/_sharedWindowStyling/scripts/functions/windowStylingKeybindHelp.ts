import type { I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'
import type { I_faMonacoKeybindHelpItem } from 'app/types/I_faWindowStylingMonaco'
import type { T_injectedResult } from 'app/types/I_injectedNeverthrow'
import type { Ref } from 'app/types/I_vueCompositionRefs'

export function createWindowStylingKeybindHelp (deps: {
  Result: T_injectedResult
  buildMonacoKeybindHelpItems: (isMac: boolean) => I_faMonacoKeybindHelpItem[]
  faQTooltipDelayMs: number
  getFaKeybindsStore: () => { snapshot: I_faKeybindsSnapshot | null }
  onBeforeUnmount: (hook: () => void) => void
  ref: <T>(value: T) => Ref<T>
}): {
    getMonacoKeybindHelpItems: () => I_faMonacoKeybindHelpItem[]
    useWindowStylingHelpMenu: () => {
      helpKeybindMenuOpen: Ref<boolean>
      onHelpIconMouseEnter: () => void
      onHelpIconMouseLeave: () => void
    }
  } {
  function isMacPlatformForMonacoKeybindHelp (): boolean {
    const snapshot = deps.Result.fromThrowable(
      (): I_faKeybindsSnapshot | null => deps.getFaKeybindsStore().snapshot,
      (): null => null
    )().unwrapOr(null)
    if (snapshot !== null && snapshot.platform === 'darwin') {
      return true
    }

    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent
      if (typeof ua === 'string' && /Mac|iPhone|iPad/i.test(ua)) {
        return true
      }
    }
    return false
  }

  function getMonacoKeybindHelpItems (): I_faMonacoKeybindHelpItem[] {
    return deps.buildMonacoKeybindHelpItems(isMacPlatformForMonacoKeybindHelp())
  }

  function useWindowStylingHelpMenu (): {
    helpKeybindMenuOpen: Ref<boolean>
    onHelpIconMouseEnter: () => void
    onHelpIconMouseLeave: () => void
  } {
    const helpKeybindMenuOpen = deps.ref(false)
    let helpMenuHoverTimer: ReturnType<typeof setTimeout> | undefined

    function clearHelpMenuHoverTimer (): void {
      if (helpMenuHoverTimer === undefined) {
        return
      }
      clearTimeout(helpMenuHoverTimer)
      helpMenuHoverTimer = undefined
    }

    function onHelpIconMouseEnter (): void {
      clearHelpMenuHoverTimer()
      helpMenuHoverTimer = setTimeout(() => {
        helpMenuHoverTimer = undefined
        helpKeybindMenuOpen.value = true
      }, deps.faQTooltipDelayMs)
    }

    function onHelpIconMouseLeave (): void {
      clearHelpMenuHoverTimer()
    }

    deps.onBeforeUnmount(() => {
      clearHelpMenuHoverTimer()
    })

    const helpKeybindMenuOpenOut = helpKeybindMenuOpen
    const onHelpIconMouseEnterOut = onHelpIconMouseEnter
    const onHelpIconMouseLeaveOut = onHelpIconMouseLeave

    return {
      helpKeybindMenuOpen: helpKeybindMenuOpenOut,
      onHelpIconMouseEnter: onHelpIconMouseEnterOut,
      onHelpIconMouseLeave: onHelpIconMouseLeaveOut
    }
  }

  const getMonacoKeybindHelpItemsOut = getMonacoKeybindHelpItems
  const useWindowStylingHelpMenuOut = useWindowStylingHelpMenu

  return {
    getMonacoKeybindHelpItems: getMonacoKeybindHelpItemsOut,
    useWindowStylingHelpMenu: useWindowStylingHelpMenuOut
  }
}
