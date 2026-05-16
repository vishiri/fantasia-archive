import { computed, nextTick, ref, watch } from 'vue'

import type { ComputedRef, Ref } from 'vue'

import { getMonacoKeybindHelpItems } from 'app/src/components/floatingWindows/WindowAppStyling/scripts/windowAppStylingKeybindHelp'
import { getFaColorCustomPropertyNamesForHelpPanel } from 'app/src/scripts/faTheme/faThemeCustomPropertyNames'

/**
 * Builds Monaco help chords and lazily refreshes the FA CSS variable inventory when the help menu opens.
 */
export function useWindowProjectStylingHelpPanel (
  helpKeybindMenuOpen: Ref<boolean | undefined>
): {
    faThemeCustomPropertyNames: Ref<readonly string[]>
    monacoKeybindHelpItems: ComputedRef<ReturnType<typeof getMonacoKeybindHelpItems>>
  } {
  const monacoKeybindHelpItems = computed(() => getMonacoKeybindHelpItems())

  const faThemeCustomPropertyNames = ref<readonly string[]>(
    getFaColorCustomPropertyNamesForHelpPanel()
  )

  watch(helpKeybindMenuOpen, (open): void => {
    if (open !== true) {
      return
    }
    void nextTick(() => {
      faThemeCustomPropertyNames.value = getFaColorCustomPropertyNamesForHelpPanel()
    })
  })

  return {
    faThemeCustomPropertyNames,
    monacoKeybindHelpItems
  }
}
