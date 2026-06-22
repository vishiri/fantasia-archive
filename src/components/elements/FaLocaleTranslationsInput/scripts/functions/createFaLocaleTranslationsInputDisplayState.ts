import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { I_faLocaleTranslationsInputLocaleRow } from 'app/types/I_faLocaleTranslationsInput'
import type {
  I_faLocaleTranslationsInputComposableDeps,
  I_faLocaleTranslationsInputComposableOptions
} from 'app/types/I_faLocaleTranslationsInputComposable'
import type {
  I_computedRef
} from 'app/types/I_vueCompositionShims'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

export function createFaLocaleTranslationsInputDisplayState (
  deps: I_faLocaleTranslationsInputComposableDeps,
  options: I_faLocaleTranslationsInputComposableOptions
): {
    isMultilineInput: I_computedRef<boolean>
    localeRows: I_computedRef<I_faLocaleTranslationsInputLocaleRow[]>
    readLocaleValue: (languageCode: T_faUserSettingsLanguageCode) => string
    resolvedLanguageCode: I_computedRef<T_faUserSettingsLanguageCode | null>
    resolvedValue: I_computedRef<string>
    showFallbackWarning: I_computedRef<boolean>
    updateLocaleValue: (
      languageCode: T_faUserSettingsLanguageCode,
      value: string | number | null
    ) => void
  } {
  const resolvedValue = deps.computed(() => {
    return deps.resolveFaLocaleStringTranslation(
      options.modelValue.value,
      options.currentLanguageCode.value
    )
  })

  const resolvedLanguageCode = deps.computed(() => {
    return deps.resolveFaLocaleStringTranslationLanguageCode(
      options.modelValue.value,
      options.currentLanguageCode.value
    )
  })

  const showFallbackWarning = deps.computed(() => {
    return deps.isFaLocaleStringTranslationUsingFallback({
      currentLanguageCode: options.currentLanguageCode.value,
      resolveLanguageCode: deps.resolveFaLocaleStringTranslationLanguageCode,
      translations: options.modelValue.value
    })
  })

  const localeRows = deps.computed(() => {
    return deps.buildLocaleRows(options.currentLanguageCode.value)
  })

  const isMultilineInput = deps.computed(() => options.inputMode.value === 'multiline')

  function readLocaleValue (languageCode: T_faUserSettingsLanguageCode): string {
    return options.modelValue.value[languageCode] ?? ''
  }

  function updateLocaleValue (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ): void {
    let nextValue = value === null || value === undefined ? '' : String(value)
    const maxLength = options.maxLength?.value
    if (maxLength !== undefined) {
      nextValue = nextValue.slice(0, maxLength)
    }
    const nextTranslations: I_faLocaleStringTranslations = {
      ...options.modelValue.value
    }
    if (nextValue.trim().length === 0) {
      delete nextTranslations[languageCode]
    } else {
      nextTranslations[languageCode] = nextValue
    }
    options.emitModelValue(nextTranslations)
  }

  return {
    isMultilineInput,
    localeRows,
    readLocaleValue,
    resolvedLanguageCode,
    resolvedValue,
    showFallbackWarning,
    updateLocaleValue
  }
}
