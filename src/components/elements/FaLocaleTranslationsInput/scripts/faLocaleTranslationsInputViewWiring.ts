import type { ComponentPublicInstance, ComputedRef, Ref } from 'vue'

import { FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES } from 'app/i18n/faUserSettingsLanguageDisplayNames'
import { faUserSettingsLanguageCodeToNamesKey } from 'app/types/faUserSettingsLanguageRegistry'
import { FA_LOCALE_TRANSLATIONS_INPUT_DEFAULT_TEXTAREA_ROWS } from 'app/types/I_faLocaleTranslationsInput'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type { QInput } from 'quasar'

import { resolveFaLocaleSingularPluralMissingTranslationWarning } from 'app/src/scripts/localeTranslations/faLocaleSingularPluralTranslations_manager'
import { formatFaLocaleSingularPluralMissingTranslationWarningTooltip } from 'app/src/scripts/localeTranslations/functions/formatFaLocaleSingularPluralMissingTranslationWarningTooltip'

export function createFaLocaleTranslationsInputViewWiring (deps: {
  computed: typeof import('vue').computed
  emitModelValue: (value: I_faLocaleStringTranslations) => void
  preferredLanguageInputRef: Ref<QInput | null>
  readRows: () => number | undefined
  readTriggerElement: () => HTMLElement | null
}): {
    emitUpdate: (value: I_faLocaleStringTranslations) => void
    readPreferredLanguageInputFocus: () => (() => void) | null
    readTriggerElement: () => HTMLElement | null
    resolvedTextareaRows: ComputedRef<number>
    setPreferredLanguageInputRef: (component: Element | ComponentPublicInstance | null) => void
  } {
  function emitUpdate (value: I_faLocaleStringTranslations): void {
    deps.emitModelValue(value)
  }

  function readPreferredLanguageInputFocus (): (() => void) | null {
    if (typeof deps.preferredLanguageInputRef.value?.focus === 'function') {
      return () => {
        deps.preferredLanguageInputRef.value?.focus()
      }
    }
    return null
  }

  function setPreferredLanguageInputRef (
    component: Element | ComponentPublicInstance | null
  ): void {
    deps.preferredLanguageInputRef.value = component as QInput | null
  }

  const resolvedTextareaRows = deps.computed(() => {
    return deps.readRows() ?? FA_LOCALE_TRANSLATIONS_INPUT_DEFAULT_TEXTAREA_ROWS
  })

  return {
    emitUpdate,
    readPreferredLanguageInputFocus,
    readTriggerElement: deps.readTriggerElement,
    resolvedTextareaRows,
    setPreferredLanguageInputRef
  }
}

export function createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip (deps: {
  computed: typeof import('vue').computed
  readCurrentLanguageCode: () => T_faUserSettingsLanguageCode
  readModelValue: () => I_faLocaleSingularPluralTranslations
  translate: (key: string, params?: Record<string, string>) => string
}): ComputedRef<string> {
  return deps.computed(() => {
    const warning = resolveFaLocaleSingularPluralMissingTranslationWarning(
      deps.readModelValue(),
      deps.readCurrentLanguageCode()
    )
    if (warning === null) {
      return ''
    }
    return formatFaLocaleSingularPluralMissingTranslationWarningTooltip({
      activeLanguageCode: deps.readCurrentLanguageCode(),
      readFallbackLanguageName: (languageCode) => {
        return FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES[faUserSettingsLanguageCodeToNamesKey(languageCode)]
      },
      translate: deps.translate,
      warning
    })
  })
}

export function createFaLocaleTranslationsInputFallbackWarningTooltip (deps: {
  computed: typeof import('vue').computed
  readResolvedLanguageCode: () => T_faUserSettingsLanguageCode | null
  translate: (key: string, params: { fallbackLanguageName: string }) => string
}): ComputedRef<string> {
  return deps.computed(() => {
    const fallbackLanguageCode = deps.readResolvedLanguageCode()
    if (fallbackLanguageCode === null) {
      return ''
    }
    const fallbackLanguageName =
      FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES[faUserSettingsLanguageCodeToNamesKey(fallbackLanguageCode)]
    return deps.translate('faLocaleTranslationsInput.fallbackWarningTooltip', {
      fallbackLanguageName
    })
  })
}
