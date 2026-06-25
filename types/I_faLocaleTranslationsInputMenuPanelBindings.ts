import type { I_faLocaleTranslationsInputLocaleRow } from 'app/types/I_faLocaleTranslationsInput'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

export type I_faLocaleTranslationsInputMenuPanelBindings = {
  autogrow: boolean
  isMultilineInput: boolean
  isSingularPluralMode?: boolean | undefined
  localeRows: I_faLocaleTranslationsInputLocaleRow[]
  maxLength?: number | undefined
  pinnedAsideLabel?: string | undefined
  pinnedAsideTestLocator?: string | undefined
  pinnedAsideTooltip?: string | undefined
  pinnedAsideValue?: string | undefined
  pluralColumnLabel?: string | undefined
  readLocaleValue: (languageCode: T_faUserSettingsLanguageCode) => string
  readPluralLocaleValue?: (languageCode: T_faUserSettingsLanguageCode) => string
  readSingularLocaleValue?: (languageCode: T_faUserSettingsLanguageCode) => string
  rows: number
  setPreferredLanguageInputRef: (
    component: import('vue').ComponentPublicInstance | Element | null
  ) => void
  singularColumnLabel?: string | undefined
  testLocator: string
  updateLocaleValue: (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ) => void
  updatePluralLocaleValue?: (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ) => void
  updateSingularLocaleValue?: (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ) => void
}

export type I_faLocaleTranslationsInputSummaryFieldBindings = {
  autogrow: boolean
  color: string
  dark: boolean
  dense: boolean
  error: boolean
  errorMessage?: string | undefined
  fallbackWarningTooltip: string
  hideBottomSpace: boolean
  isMenuPresentationLocked: boolean
  isMultilineInput: boolean
  isSingularPluralMode?: boolean | undefined
  localeRows: I_faLocaleTranslationsInputLocaleRow[]
  lockedMenuContentStyle: Record<string, string> | undefined
  maxLength?: number | undefined
  menuOffset: [number, number]
  menuPinnedAsideLabel?: string | undefined
  menuPinnedAsideTestLocator?: string | undefined
  menuPinnedAsideTooltip?: string | undefined
  menuPinnedAsideValue?: string | undefined
  menuTarget: HTMLElement | undefined
  onTranslationsMenuBeforeShow: () => void
  onTranslationsMenuHide: () => void
  onTranslationsMenuShow: () => void
  openTranslationsMenu: () => void
  pluralColumnLabel?: string | undefined
  readLocaleValue: (languageCode: T_faUserSettingsLanguageCode) => string
  readPluralLocaleValue?: (languageCode: T_faUserSettingsLanguageCode) => string
  readSingularLocaleValue?: (languageCode: T_faUserSettingsLanguageCode) => string
  resolvedLanguageCode: T_faUserSettingsLanguageCode | null
  resolvedTextareaRows: number
  resolvedValue: string
  setPreferredLanguageInputRef: (
    component: import('vue').ComponentPublicInstance | Element | null
  ) => void
  showFallbackWarning: boolean
  singularColumnLabel?: string | undefined
  testLocator: string
  translateButtonTooltip: string
  updateLocaleValue: (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ) => void
  updatePluralLocaleValue?: (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ) => void
  updateSingularLocaleValue?: (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ) => void
}
