import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { T_faLocaleSingularPluralMissingForm } from 'app/types/I_faLocaleSingularPluralMissingTranslationWarning'
import type { I_faLocaleTranslationsInputLocaleRow } from 'app/types/I_faLocaleTranslationsInput'
import type {
  I_faLocaleTranslationsInputComposableDeps,
  I_faLocaleTranslationsInputSingularPluralComposableOptions
} from 'app/types/I_faLocaleTranslationsInputComposable'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

function updateFaLocaleTranslationsInputSingularPluralMapValue (
  options: Pick<
    I_faLocaleTranslationsInputSingularPluralComposableOptions,
    'emitModelValue' | 'maxLength' | 'modelValue'
  >,
  mapKey: 'singular' | 'plural',
  languageCode: T_faUserSettingsLanguageCode,
  value: string | number | null
): void {
  let nextValue = value === null || value === undefined ? '' : String(value)
  const maxLength = options.maxLength?.value
  if (maxLength !== undefined) {
    nextValue = nextValue.slice(0, maxLength)
  }
  const nextTranslations: I_faLocaleSingularPluralTranslations = {
    plural: { ...options.modelValue.value.plural },
    singular: { ...options.modelValue.value.singular }
  }
  const targetMap = mapKey === 'singular' ? nextTranslations.singular : nextTranslations.plural
  if (nextValue.trim().length === 0) {
    delete targetMap[languageCode]
  } else {
    targetMap[languageCode] = nextValue
  }
  options.emitModelValue(nextTranslations)
}

export function createFaLocaleTranslationsInputSingularPluralDisplayState (
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
  },
  options: I_faLocaleTranslationsInputSingularPluralComposableOptions
): {
    isMultilineInput: I_computedRef<boolean>
    localeRows: I_computedRef<I_faLocaleTranslationsInputLocaleRow[]>
    readPluralLocaleValue: (languageCode: T_faUserSettingsLanguageCode) => string
    readSingularLocaleValue: (languageCode: T_faUserSettingsLanguageCode) => string
    resolvedLanguageCode: I_computedRef<T_faUserSettingsLanguageCode | null>
    resolvedValue: I_computedRef<string>
    showFallbackWarning: I_computedRef<boolean>
    updatePluralLocaleValue: (
      languageCode: T_faUserSettingsLanguageCode,
      value: string | number | null
    ) => void
    updateSingularLocaleValue: (
      languageCode: T_faUserSettingsLanguageCode,
      value: string | number | null
    ) => void
  } {
  const resolvedValue = deps.computed(() => {
    return deps.resolveFaLocaleSingularPluralDisplayTranslation(
      options.modelValue.value,
      options.currentLanguageCode.value
    )
  })

  const resolvedLanguageCode = deps.computed(() => {
    return deps.resolveFaLocaleSingularPluralDisplayTranslationLanguageCode(
      options.modelValue.value,
      options.currentLanguageCode.value
    )
  })

  const showFallbackWarning = deps.computed(() => {
    return deps.resolveFaLocaleSingularPluralMissingFormsForLanguage(
      options.modelValue.value,
      options.currentLanguageCode.value
    ) !== null
  })

  const localeRows = deps.computed(() => {
    return deps.buildLocaleRows(options.currentLanguageCode.value)
  })

  const isMultilineInput = deps.computed(() => options.inputMode.value === 'multiline')

  function readSingularLocaleValue (languageCode: T_faUserSettingsLanguageCode): string {
    return options.modelValue.value.singular[languageCode] ?? ''
  }

  function readPluralLocaleValue (languageCode: T_faUserSettingsLanguageCode): string {
    return options.modelValue.value.plural[languageCode] ?? ''
  }

  function updateSingularLocaleValue (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ): void {
    updateFaLocaleTranslationsInputSingularPluralMapValue(options, 'singular', languageCode, value)
  }

  function updatePluralLocaleValue (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ): void {
    updateFaLocaleTranslationsInputSingularPluralMapValue(options, 'plural', languageCode, value)
  }

  return {
    isMultilineInput,
    localeRows,
    readPluralLocaleValue,
    readSingularLocaleValue,
    resolvedLanguageCode,
    resolvedValue,
    showFallbackWarning,
    updatePluralLocaleValue,
    updateSingularLocaleValue
  }
}
