import type {
  I_faLocaleTranslationsInputComposableApi,
  I_faLocaleTranslationsInputComposableDeps,
  I_faLocaleTranslationsInputComposableOptions
} from 'app/types/I_faLocaleTranslationsInputComposable'

import { createFaLocaleTranslationsInputDisplayState } from './functions/createFaLocaleTranslationsInputDisplayState'
import { createFaLocaleTranslationsInputMenuState } from './functions/createFaLocaleTranslationsInputMenuState'

export const createUseFaLocaleTranslationsInput = (
  deps: I_faLocaleTranslationsInputComposableDeps
): ((options: I_faLocaleTranslationsInputComposableOptions) => I_faLocaleTranslationsInputComposableApi) => {
  return function useFaLocaleTranslationsInput (options) {
    const displayState = createFaLocaleTranslationsInputDisplayState(deps, options)
    const menuState = createFaLocaleTranslationsInputMenuState(deps, options)

    return {
      ...displayState,
      ...menuState
    }
  }
}
