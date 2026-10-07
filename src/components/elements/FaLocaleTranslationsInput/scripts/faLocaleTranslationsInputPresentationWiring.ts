import { ResultAsync } from 'neverthrow'
import type { ComputedRef } from 'vue'

import { scheduleFaLocaleTranslationsMenuInputFocus } from 'app/src/scripts/localeTranslations/functions/scheduleFaLocaleTranslationsMenuInputFocus'
import type { T_faLocaleTranslationsInputPresentation } from 'app/types/I_faLocaleTranslationsInput'

export function createFaLocaleTranslationsInputPresentationWiring (deps: {
  computed: typeof import('vue').computed
  nextTick: () => Promise<void>
  readPreferredLanguageInputFocus: () => (() => void) | null
  readPresentation: () => T_faLocaleTranslationsInputPresentation
}): {
    focusPreferredLanguageInput: (shouldFocus?: () => boolean) => void
    isMenuPanelPresentation: ComputedRef<boolean>
  } {
  const isMenuPanelPresentation = deps.computed(() => deps.readPresentation() === 'menuPanel')

  function focusPreferredLanguageInput (shouldFocus?: () => boolean): void {
    scheduleFaLocaleTranslationsMenuInputFocus({
      ResultAsync,
      focusMenuInput: () => {
        if (shouldFocus !== undefined && !shouldFocus()) {
          return
        }
        const focusFn = deps.readPreferredLanguageInputFocus()
        if (focusFn !== null) {
          focusFn()
        }
      },
      nextTick: deps.nextTick,
      requestAnimationFrame: (callback) => window.requestAnimationFrame(callback)
    })
  }

  return {
    focusPreferredLanguageInput,
    isMenuPanelPresentation
  }
}
