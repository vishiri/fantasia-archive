import type {
  I_faLocaleTranslationsInputMenuPanelBindings,
  I_faLocaleTranslationsInputSummaryFieldBindings
} from 'app/types/I_faLocaleTranslationsInputMenuPanelBindings'
import type {
  T_faLocaleTranslationsInputMode,
  T_faLocaleTranslationsInputPresentation,
  T_faLocaleTranslationsInputTranslationForms
} from 'app/types/I_faLocaleTranslationsInput'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import type {
  I_faLocaleTranslationsInputComposableApi,
  I_faLocaleTranslationsInputSingularPluralComposableApi
} from 'app/types/I_faLocaleTranslationsInputComposable'

export type T_faLocaleTranslationsInputActiveComposableApi =
  | I_faLocaleTranslationsInputComposableApi
  | I_faLocaleTranslationsInputSingularPluralComposableApi

export type I_faLocaleTranslationsInputRootProps = {
  autogrow?: boolean | undefined
  color?: string | undefined
  currentLanguageCode: T_faUserSettingsLanguageCode
  dark?: boolean | undefined
  dense?: boolean | undefined
  error?: boolean | undefined
  errorMessage?: string | undefined
  hideBottomSpace?: boolean | undefined
  inputMode?: T_faLocaleTranslationsInputMode | undefined
  maxLength?: number | undefined
  menuPinnedAsideLabel?: string | undefined
  menuPinnedAsideTestLocator?: string | undefined
  menuPinnedAsideTooltip?: string | undefined
  menuPinnedAsideValue?: string | undefined
  modelValue: I_faLocaleStringTranslations | I_faLocaleSingularPluralTranslations
  presentation?: T_faLocaleTranslationsInputPresentation | undefined
  rows?: number | undefined
  testLocator: string
  translationForms?: T_faLocaleTranslationsInputTranslationForms | undefined
}

export type I_faLocaleTranslationsInputRootEmit = (
  event: 'update:modelValue',
  value: I_faLocaleStringTranslations | I_faLocaleSingularPluralTranslations
) => void

export type T_useFaLocaleTranslationsInputRoot = (
  props: I_faLocaleTranslationsInputRootProps,
  emit: I_faLocaleTranslationsInputRootEmit
) => {
  focusPreferredLanguageInput: () => void
  isMenuPanelPresentation: import('vue').ComputedRef<boolean>
  isSingularPluralForms: import('vue').ComputedRef<boolean>
  menuPanelBindings: import('vue').ComputedRef<I_faLocaleTranslationsInputMenuPanelBindings>
  openTranslationsMenu: () => void
  summaryFieldBindings: import('vue').ComputedRef<I_faLocaleTranslationsInputSummaryFieldBindings>
  translationsMenuOpen: import('vue').Ref<boolean>
}
