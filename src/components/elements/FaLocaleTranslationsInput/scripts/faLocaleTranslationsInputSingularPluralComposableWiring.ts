import type {
  I_faLocaleTranslationsInputSingularPluralComposableApi,
  I_faLocaleTranslationsInputSingularPluralComposableOptions
} from 'app/types/I_faLocaleTranslationsInputComposable'
import type { I_faLocaleTranslationsInputComposableDeps } from 'app/types/I_faLocaleTranslationsInputComposable'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { T_faLocaleSingularPluralMissingForm } from 'app/types/I_faLocaleSingularPluralMissingTranslationWarning'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { createFaLocaleTranslationsInputMenuState } from './functions/createFaLocaleTranslationsInputMenuState'
import { createFaLocaleTranslationsInputSingularPluralDisplayState } from './functions/createFaLocaleTranslationsInputSingularPluralDisplayState'

export const createUseFaLocaleTranslationsInputSingularPlural = (
  deps: I_faLocaleTranslationsInputComposableDeps & {
    resolveFaLocaleSingularPluralDisplayTranslation: (
      translations: I_faLocaleSingularPluralTranslations,
      preferredLanguageCode: T_faUserSettingsLanguageCode
    ) => string
    resolveFaLocaleSingularPluralDisplayTranslationLanguageCode: (
      translations: I_faLocaleSingularPluralTranslations,
      preferredLanguageCode: T_faUserSettingsLanguageCode
    ) => T_faUserSettingsLanguageCode | null
    resolveFaLocaleSingularPluralMissingFormsForLanguage: (
      translations: I_faLocaleSingularPluralTranslations,
      languageCode: T_faUserSettingsLanguageCode
    ) => T_faLocaleSingularPluralMissingForm | null
  }
): ((
    options: I_faLocaleTranslationsInputSingularPluralComposableOptions
  ) => I_faLocaleTranslationsInputSingularPluralComposableApi) => {
  return function useFaLocaleTranslationsInputSingularPlural (options) {
    const displayState = createFaLocaleTranslationsInputSingularPluralDisplayState(deps, options)
    const pluralOnlyModelValue = deps.computed(() => options.modelValue.value.plural)
    const menuState = createFaLocaleTranslationsInputMenuState(deps, {
      currentLanguageCode: options.currentLanguageCode,
      emitModelValue: (value) => {
        options.emitModelValue({
          plural: value,
          singular: { ...options.modelValue.value.singular }
        })
      },
      inputMode: options.inputMode,
      ...(options.maxLength !== undefined ? { maxLength: options.maxLength } : {}),
      modelValue: pluralOnlyModelValue,
      readPreferredLanguageInputFocus: options.readPreferredLanguageInputFocus,
      readTriggerElement: options.readTriggerElement,
      requestAnimationFrame: options.requestAnimationFrame
    })

    const isSingularPluralMode = deps.computed(() => true)

    return {
      ...displayState,
      ...menuState,
      isSingularPluralMode
    }
  }
}
