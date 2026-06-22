import type { I_faLocaleTranslationsInputLocaleRow } from 'app/types/I_faLocaleTranslationsInput'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

export type I_faLocaleTranslationsInputMenuPanelBindings = {
  autogrow: boolean
  isMultilineInput: boolean
  isSingularPluralMode?: boolean
  localeRows: I_faLocaleTranslationsInputLocaleRow[]
  maxLength?: number
  pinnedAsideLabel?: string
  pinnedAsideTestLocator?: string
  pinnedAsideTooltip?: string
  pinnedAsideValue?: string
  pluralColumnLabel?: string
  readLocaleValue: (languageCode: T_faUserSettingsLanguageCode) => string
  readPluralLocaleValue?: (languageCode: T_faUserSettingsLanguageCode) => string
  readSingularLocaleValue?: (languageCode: T_faUserSettingsLanguageCode) => string
  rows: number
  setPreferredLanguageInputRef: (
    component: import('vue').ComponentPublicInstance | Element | null
  ) => void
  singularColumnLabel?: string
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
  errorMessage?: string
  fallbackWarningTooltip: string
  hideBottomSpace: boolean
  isMenuPresentationLocked: boolean
  isMultilineInput: boolean
  isSingularPluralMode?: boolean
  localeRows: I_faLocaleTranslationsInputLocaleRow[]
  lockedMenuContentStyle: Record<string, string> | undefined
  maxLength?: number
  menuOffset: [number, number]
  menuPinnedAsideLabel?: string
  menuPinnedAsideTestLocator?: string
  menuPinnedAsideTooltip?: string
  menuPinnedAsideValue?: string
  menuTarget: HTMLElement | undefined
  onTranslationsMenuBeforeShow: () => void
  onTranslationsMenuHide: () => void
  onTranslationsMenuShow: () => void
  openTranslationsMenu: () => void
  pluralColumnLabel?: string
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
  singularColumnLabel?: string
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
