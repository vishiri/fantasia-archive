import type {
  I_faLocaleTranslationsInputRootProps,
  T_faLocaleTranslationsInputActiveComposableApi
} from 'app/types/I_faLocaleTranslationsInputRoot'
import type {
  I_faLocaleTranslationsInputMenuPanelBindings,
  I_faLocaleTranslationsInputSummaryFieldBindings
} from 'app/types/I_faLocaleTranslationsInputMenuPanelBindings'
import type {
  I_faLocaleTranslationsInputComposableApi,
  I_faLocaleTranslationsInputSingularPluralComposableApi
} from 'app/types/I_faLocaleTranslationsInputComposable'

function assignDefinedOptionalFields<T extends Record<string, unknown>> (
  target: T,
  source: Partial<T>
): void {
  for (const key of Object.keys(source) as Array<keyof T>) {
    const value = source[key]

    if (value !== undefined) {
      target[key] = value
    }
  }
}

export function buildFaLocaleTranslationsInputMenuPanelBindings (params: {
  activeComposable: T_faLocaleTranslationsInputActiveComposableApi
  isSingularPluralForms: boolean
  pluralColumnLabel: string
  props: I_faLocaleTranslationsInputRootProps
  resolvedTextareaRows: number
  setPreferredLanguageInputRef: (component: import('vue').ComponentPublicInstance | Element | null) => void
  singularColumnLabel: string
}): I_faLocaleTranslationsInputMenuPanelBindings {
  const baseBindings = {
    autogrow: params.props.autogrow ?? false,
    isMultilineInput: params.activeComposable.isMultilineInput.value,
    isSingularPluralMode: params.isSingularPluralForms,
    localeRows: params.activeComposable.localeRows.value,
    pluralColumnLabel: params.pluralColumnLabel,
    rows: params.resolvedTextareaRows,
    setPreferredLanguageInputRef: params.setPreferredLanguageInputRef,
    singularColumnLabel: params.singularColumnLabel,
    testLocator: params.props.testLocator
  } satisfies Omit<
    I_faLocaleTranslationsInputMenuPanelBindings,
    | 'maxLength'
    | 'pinnedAsideLabel'
    | 'pinnedAsideTestLocator'
    | 'pinnedAsideTooltip'
    | 'pinnedAsideValue'
    | 'readLocaleValue'
    | 'readPluralLocaleValue'
    | 'readSingularLocaleValue'
    | 'updateLocaleValue'
    | 'updatePluralLocaleValue'
    | 'updateSingularLocaleValue'
  >

  const optionalBindings: Partial<I_faLocaleTranslationsInputMenuPanelBindings> = {}
  assignDefinedOptionalFields(optionalBindings, {
    maxLength: params.props.maxLength,
    pinnedAsideLabel: params.props.menuPinnedAsideLabel,
    pinnedAsideTestLocator: params.props.menuPinnedAsideTestLocator,
    pinnedAsideTooltip: params.props.menuPinnedAsideTooltip,
    pinnedAsideValue: params.props.menuPinnedAsideValue
  })

  if (params.isSingularPluralForms) {
    const singularPluralComposable = params.activeComposable as I_faLocaleTranslationsInputSingularPluralComposableApi
    return {
      ...baseBindings,
      ...optionalBindings,
      readLocaleValue: () => '',
      readPluralLocaleValue: singularPluralComposable.readPluralLocaleValue,
      readSingularLocaleValue: singularPluralComposable.readSingularLocaleValue,
      updateLocaleValue: () => {},
      updatePluralLocaleValue: singularPluralComposable.updatePluralLocaleValue,
      updateSingularLocaleValue: singularPluralComposable.updateSingularLocaleValue
    }
  }
  const singleComposable = params.activeComposable as I_faLocaleTranslationsInputComposableApi
  return {
    ...baseBindings,
    ...optionalBindings,
    readLocaleValue: singleComposable.readLocaleValue,
    updateLocaleValue: singleComposable.updateLocaleValue
  }
}

export function buildFaLocaleTranslationsInputSummaryFieldBindings (params: {
  activeComposable: T_faLocaleTranslationsInputActiveComposableApi
  fallbackWarningTooltip: string
  isSingularPluralForms: boolean
  pluralColumnLabel: string
  props: I_faLocaleTranslationsInputRootProps
  resolvedTextareaRows: number
  setPreferredLanguageInputRef: (component: import('vue').ComponentPublicInstance | Element | null) => void
  singularColumnLabel: string
  translateButtonTooltip: string
}): I_faLocaleTranslationsInputSummaryFieldBindings {
  const baseBindings = {
    autogrow: params.props.autogrow ?? false,
    color: params.props.color ?? 'primary-bright',
    dark: params.props.dark ?? true,
    dense: params.props.dense ?? true,
    error: params.props.error ?? false,
    fallbackWarningTooltip: params.fallbackWarningTooltip,
    hideBottomSpace: params.props.hideBottomSpace ?? true,
    isMenuPresentationLocked: params.activeComposable.isMenuPresentationLocked.value,
    isMultilineInput: params.activeComposable.isMultilineInput.value,
    isSingularPluralMode: params.isSingularPluralForms,
    localeRows: params.activeComposable.localeRows.value,
    lockedMenuContentStyle: params.activeComposable.lockedMenuContentStyle.value,
    menuOffset: params.activeComposable.menuOffset,
    menuTarget: params.activeComposable.menuTarget.value,
    onTranslationsMenuBeforeShow: params.activeComposable.onTranslationsMenuBeforeShow,
    onTranslationsMenuHide: params.activeComposable.onTranslationsMenuHide,
    onTranslationsMenuShow: params.activeComposable.onTranslationsMenuShow,
    openTranslationsMenu: params.activeComposable.openTranslationsMenu,
    pluralColumnLabel: params.pluralColumnLabel,
    resolvedLanguageCode: params.activeComposable.resolvedLanguageCode.value,
    resolvedTextareaRows: params.resolvedTextareaRows,
    resolvedValue: params.activeComposable.resolvedValue.value,
    setPreferredLanguageInputRef: params.setPreferredLanguageInputRef,
    showFallbackWarning: params.activeComposable.showFallbackWarning.value,
    singularColumnLabel: params.singularColumnLabel,
    testLocator: params.props.testLocator,
    translateButtonTooltip: params.translateButtonTooltip
  } satisfies Omit<
    I_faLocaleTranslationsInputSummaryFieldBindings,
    | 'errorMessage'
    | 'maxLength'
    | 'menuPinnedAsideLabel'
    | 'menuPinnedAsideTestLocator'
    | 'menuPinnedAsideTooltip'
    | 'menuPinnedAsideValue'
    | 'readLocaleValue'
    | 'readPluralLocaleValue'
    | 'readSingularLocaleValue'
    | 'updateLocaleValue'
    | 'updatePluralLocaleValue'
    | 'updateSingularLocaleValue'
  >

  const optionalBindings: Partial<I_faLocaleTranslationsInputSummaryFieldBindings> = {}
  assignDefinedOptionalFields(optionalBindings, {
    errorMessage: params.props.errorMessage,
    maxLength: params.props.maxLength,
    menuPinnedAsideLabel: params.props.menuPinnedAsideLabel,
    menuPinnedAsideTestLocator: params.props.menuPinnedAsideTestLocator,
    menuPinnedAsideTooltip: params.props.menuPinnedAsideTooltip,
    menuPinnedAsideValue: params.props.menuPinnedAsideValue
  })

  if (params.isSingularPluralForms) {
    const singularPluralComposable = params.activeComposable as I_faLocaleTranslationsInputSingularPluralComposableApi
    return {
      ...baseBindings,
      ...optionalBindings,
      readLocaleValue: () => '',
      readPluralLocaleValue: singularPluralComposable.readPluralLocaleValue,
      readSingularLocaleValue: singularPluralComposable.readSingularLocaleValue,
      updateLocaleValue: () => {},
      updatePluralLocaleValue: singularPluralComposable.updatePluralLocaleValue,
      updateSingularLocaleValue: singularPluralComposable.updateSingularLocaleValue
    }
  }
  const singleComposable = params.activeComposable as I_faLocaleTranslationsInputComposableApi
  return {
    ...baseBindings,
    ...optionalBindings,
    readLocaleValue: singleComposable.readLocaleValue,
    updateLocaleValue: singleComposable.updateLocaleValue
  }
}
