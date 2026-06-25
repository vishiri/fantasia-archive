import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type {
  I_faLocaleTranslationsInputLocaleRow,
  T_faLocaleTranslationsInputMode,
  T_faLocaleTranslationsInputTranslationForms
} from 'app/types/I_faLocaleTranslationsInput'
import type {
  I_computedRef,
  I_ref
} from 'app/types/I_vueCompositionShims'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

export type I_faLocaleTranslationsInputComposableDeps = {
  FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_HEIGHT_PX: number
  FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_WIDTH_PX: number
  FA_LOCALE_TRANSLATIONS_INPUT_MENU_MIN_WIDTH_PX: number
  FA_LOCALE_TRANSLATIONS_INPUT_MENU_OFFSET_Y_PX: number
  FA_LOCALE_TRANSLATIONS_INPUT_MENU_VIEWPORT_MARGIN_PX: number
  buildFaLocaleTranslationsMenuContentStyle: (input: {
    maxHeightPx: number
    widthPx: number
  }) => Record<string, string>
  buildLocaleRows: (
    currentLanguageCode: T_faUserSettingsLanguageCode
  ) => I_faLocaleTranslationsInputLocaleRow[]
  computed: <T>(fn: () => T) => I_computedRef<T>
  isFaLocaleStringTranslationUsingFallback: (input: {
    currentLanguageCode: T_faUserSettingsLanguageCode
    resolveLanguageCode: (
      translations: I_faLocaleStringTranslations,
      preferredLanguageCode: T_faUserSettingsLanguageCode
    ) => T_faUserSettingsLanguageCode | null
    translations: I_faLocaleStringTranslations
  }) => boolean
  nextTick: () => Promise<void>
  ref: <T>(value: T) => I_ref<T>
  resolveFaLocaleStringTranslation: (
    translations: I_faLocaleStringTranslations,
    preferredLanguageCode: T_faUserSettingsLanguageCode
  ) => string
  resolveFaLocaleStringTranslationLanguageCode: (
    translations: I_faLocaleStringTranslations,
    preferredLanguageCode: T_faUserSettingsLanguageCode
  ) => T_faUserSettingsLanguageCode | null
  resolveFaLocaleTranslationsMenuAnchorElement: (
    triggerElement: HTMLElement | null
  ) => HTMLElement | null
  resolveFaLocaleTranslationsMenuPresentation: (input: {
    anchorRect: DOMRectReadOnly
    maxHeightPx?: number | undefined
    maxWidthPx?: number | undefined
    minWidthPx?: number | undefined
    viewportHeightPx: number
    viewportMarginPx?: number | undefined
    viewportWidthPx: number
  }) => {
    maxHeightPx: number
    widthPx: number
  }
  scheduleFaLocaleTranslationsMenuInputFocus: (deps: {
    focusMenuInput: () => void
    nextTick: () => Promise<void>
    requestAnimationFrame: (callback: () => void) => number
  }) => void
}

export type I_faLocaleTranslationsInputSingularPluralComposableOptions = {
  currentLanguageCode: I_ref<T_faUserSettingsLanguageCode>
  emitModelValue: (value: I_faLocaleSingularPluralTranslations) => void
  inputMode: I_ref<T_faLocaleTranslationsInputMode>
  maxLength?: I_ref<number | undefined>
  modelValue: I_ref<I_faLocaleSingularPluralTranslations>
  readPreferredLanguageInputFocus: () => (() => void) | null
  readTriggerElement: () => HTMLElement | null
  requestAnimationFrame: (callback: () => void) => number
}

export type I_faLocaleTranslationsInputComposableOptions = {
  currentLanguageCode: I_ref<T_faUserSettingsLanguageCode>
  emitModelValue: (value: I_faLocaleStringTranslations) => void
  inputMode: I_ref<T_faLocaleTranslationsInputMode>
  maxLength?: I_ref<number | undefined>
  modelValue: I_ref<I_faLocaleStringTranslations>
  readPreferredLanguageInputFocus: () => (() => void) | null
  readTriggerElement: () => HTMLElement | null
  requestAnimationFrame: (callback: () => void) => number
  translationForms?: I_ref<T_faLocaleTranslationsInputTranslationForms> | undefined
}

export type I_faLocaleTranslationsInputComposableApi = {
  clearLockedMenuPresentation: () => void
  isMenuPresentationLocked: I_computedRef<boolean>
  isMultilineInput: I_computedRef<boolean>
  localeRows: I_computedRef<I_faLocaleTranslationsInputLocaleRow[]>
  lockMenuPresentation: () => void
  lockedMenuContentStyle: I_ref<Record<string, string> | undefined>
  menuOffset: [number, number]
  menuTarget: I_ref<HTMLElement | undefined>
  onTranslationsMenuBeforeShow: () => void
  onTranslationsMenuHide: () => void
  onTranslationsMenuShow: () => void
  openTranslationsMenu: () => void
  readLocaleValue: (languageCode: T_faUserSettingsLanguageCode) => string
  resolvedLanguageCode: I_computedRef<T_faUserSettingsLanguageCode | null>
  resolvedValue: I_computedRef<string>
  showFallbackWarning: I_computedRef<boolean>
  syncMenuAnchorTarget: () => void
  translationsMenuOpen: I_ref<boolean>
  updateLocaleValue: (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ) => void
}

export type I_faLocaleTranslationsInputSingularPluralComposableApi = {
  clearLockedMenuPresentation: () => void
  isMenuPresentationLocked: I_computedRef<boolean>
  isMultilineInput: I_computedRef<boolean>
  isSingularPluralMode: I_computedRef<boolean>
  localeRows: I_computedRef<I_faLocaleTranslationsInputLocaleRow[]>
  lockMenuPresentation: () => void
  lockedMenuContentStyle: I_ref<Record<string, string> | undefined>
  menuOffset: [number, number]
  menuTarget: I_ref<HTMLElement | undefined>
  onTranslationsMenuBeforeShow: () => void
  onTranslationsMenuHide: () => void
  onTranslationsMenuShow: () => void
  openTranslationsMenu: () => void
  readPluralLocaleValue: (languageCode: T_faUserSettingsLanguageCode) => string
  readSingularLocaleValue: (languageCode: T_faUserSettingsLanguageCode) => string
  resolvedLanguageCode: I_computedRef<T_faUserSettingsLanguageCode | null>
  resolvedValue: I_computedRef<string>
  showFallbackWarning: I_computedRef<boolean>
  syncMenuAnchorTarget: () => void
  translationsMenuOpen: I_ref<boolean>
  updatePluralLocaleValue: (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ) => void
  updateSingularLocaleValue: (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ) => void
}
