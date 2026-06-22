import type {
  I_faLocaleTranslationsInputRootEmit,
  I_faLocaleTranslationsInputRootProps,
  T_useFaLocaleTranslationsInputRoot
} from 'app/types/I_faLocaleTranslationsInputRoot'

import {
  createFaLocaleTranslationsInputRootBindingsState,
  createFaLocaleTranslationsInputRootModelWiring
} from './faLocaleTranslationsInputRootModelWiring'

export function createUseFaLocaleTranslationsInputRoot (deps: {
  computed: typeof import('vue').computed
  createFaLocaleTranslationsInputFallbackWarningTooltip: typeof import('./faLocaleTranslationsInputViewWiring').createFaLocaleTranslationsInputFallbackWarningTooltip
  createFaLocaleTranslationsInputPresentationWiring: typeof import('./faLocaleTranslationsInputPresentationWiring').createFaLocaleTranslationsInputPresentationWiring
  createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip: typeof import('./faLocaleTranslationsInputViewWiring').createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip
  createFaLocaleTranslationsInputViewWiring: typeof import('./faLocaleTranslationsInputViewWiring').createFaLocaleTranslationsInputViewWiring
  nextTick: typeof import('vue').nextTick
  onMounted: typeof import('vue').onMounted
  ref: typeof import('vue').ref
  toRef: typeof import('vue').toRef
  useFaLocaleTranslationsInput: typeof import('./faLocaleTranslationsInput_manager').useFaLocaleTranslationsInput
  useFaLocaleTranslationsInputSingularPlural: typeof import('./faLocaleTranslationsInputSingularPlural_manager').useFaLocaleTranslationsInputSingularPlural
  useI18n: typeof import('vue-i18n').useI18n
}): T_useFaLocaleTranslationsInputRoot {
  return function useFaLocaleTranslationsInputRoot (
    props: I_faLocaleTranslationsInputRootProps,
    emit: I_faLocaleTranslationsInputRootEmit
  ) {
    const { t } = deps.useI18n()
    const modelWiring = createFaLocaleTranslationsInputRootModelWiring({
      computed: deps.computed,
      createFaLocaleTranslationsInputViewWiring: deps.createFaLocaleTranslationsInputViewWiring,
      emit,
      props,
      ref: deps.ref,
      toRef: deps.toRef,
      useFaLocaleTranslationsInput: deps.useFaLocaleTranslationsInput,
      useFaLocaleTranslationsInputSingularPlural: deps.useFaLocaleTranslationsInputSingularPlural
    })
    const bindingsState = createFaLocaleTranslationsInputRootBindingsState({
      activeComposable: modelWiring.activeComposable,
      computed: deps.computed,
      createFaLocaleTranslationsInputFallbackWarningTooltip: deps.createFaLocaleTranslationsInputFallbackWarningTooltip,
      createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip:
        deps.createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip,
      isSingularPluralForms: modelWiring.isSingularPluralForms,
      props,
      resolvedTextareaRows: modelWiring.resolvedTextareaRows,
      setPreferredLanguageInputRef: modelWiring.setPreferredLanguageInputRef,
      singularPluralModelValueRef: modelWiring.singularPluralModelValueRef,
      translate: (key, params) => t(key, params ?? {})
    })
    const presentationWiring = deps.createFaLocaleTranslationsInputPresentationWiring({
      computed: deps.computed,
      nextTick: deps.nextTick,
      readPreferredLanguageInputFocus: modelWiring.readPreferredLanguageInputFocus,
      readPresentation: () => props.presentation ?? 'field'
    })
    deps.onMounted(() => {
      void deps.nextTick(() => {
        if (presentationWiring.isMenuPanelPresentation.value) {
          return
        }
        modelWiring.activeComposable.value.syncMenuAnchorTarget()
      })
    })
    const focusPreferredLanguageInput = presentationWiring.focusPreferredLanguageInput
    const isMenuPanelPresentation = presentationWiring.isMenuPanelPresentation
    const openTranslationsMenu = modelWiring.activeComposable.value.openTranslationsMenu
    const translationsMenuOpen = modelWiring.activeComposable.value.translationsMenuOpen
    const isSingularPluralForms = modelWiring.isSingularPluralForms
    const menuPanelBindings = bindingsState.menuPanelBindings
    const summaryFieldBindings = bindingsState.summaryFieldBindings
    return {
      focusPreferredLanguageInput,
      isMenuPanelPresentation,
      isSingularPluralForms,
      menuPanelBindings,
      openTranslationsMenu,
      summaryFieldBindings,
      translationsMenuOpen
    }
  }
}
