import type { I_faMonacoKeybindHelpItem } from 'app/types/I_faWindowStylingMonaco'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'
import type { T_vueWatch } from 'app/types/I_vueWatchInjected'

export function createWindowStylingColorPanel (deps: {
  computed: <T>(getter: () => T) => ComputedRef<T>
  getFaColorCustomPropertyNamesForHelpPanel: () => readonly string[]
  getMonacoKeybindHelpItems: () => I_faMonacoKeybindHelpItem[]
  nextTick: (fn?: () => void | Promise<void>) => Promise<void>
  ref: <T>(value: T) => Ref<T>
  watch: T_vueWatch
}): {
    useWindowStylingHelpPanel: (
      helpKeybindMenuOpen: Ref<boolean | undefined>
    ) => {
      faThemeCustomPropertyNames: Ref<readonly string[]>
      monacoKeybindHelpItems: ComputedRef<I_faMonacoKeybindHelpItem[]>
    }
  } {
  function useWindowStylingHelpPanel (
    helpKeybindMenuOpen: Ref<boolean | undefined>
  ): {
      faThemeCustomPropertyNames: Ref<readonly string[]>
      monacoKeybindHelpItems: ComputedRef<I_faMonacoKeybindHelpItem[]>
    } {
    const monacoKeybindHelpItems = deps.computed(() => deps.getMonacoKeybindHelpItems())

    const faThemeCustomPropertyNames = deps.ref<readonly string[]>(
      deps.getFaColorCustomPropertyNamesForHelpPanel()
    )

    deps.watch(() => helpKeybindMenuOpen.value, (open: boolean | undefined): void => {
      if (open !== true) {
        return
      }
      void deps.nextTick(() => {
        faThemeCustomPropertyNames.value = deps.getFaColorCustomPropertyNamesForHelpPanel()
      })
    })

    const faThemeCustomPropertyNamesOut = faThemeCustomPropertyNames
    const monacoKeybindHelpItemsOut = monacoKeybindHelpItems

    return {
      faThemeCustomPropertyNames: faThemeCustomPropertyNamesOut,
      monacoKeybindHelpItems: monacoKeybindHelpItemsOut
    }
  }

  const useWindowStylingHelpPanelOut = useWindowStylingHelpPanel

  return {
    useWindowStylingHelpPanel: useWindowStylingHelpPanelOut
  }
}
