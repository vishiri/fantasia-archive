import type { ComputedRef } from 'vue'
import type { QInput } from 'quasar'

import type {
  I_faLocaleTranslationsInputRootEmit,
  I_faLocaleTranslationsInputRootProps,
  T_faLocaleTranslationsInputActiveComposableApi
} from 'app/types/I_faLocaleTranslationsInputRoot'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'

import type FaLocaleTranslationsInputSummaryField from '../FaLocaleTranslationsInputSummaryField.vue'

import type {
  I_faLocaleTranslationsInputMenuPanelBindings,
  I_faLocaleTranslationsInputSummaryFieldBindings
} from 'app/types/I_faLocaleTranslationsInputMenuPanelBindings'
import { createFaLocaleTranslationsInputRootActiveComposable } from './faLocaleTranslationsInputRootComposablesWiring'
import {
  buildFaLocaleTranslationsInputMenuPanelBindings,
  buildFaLocaleTranslationsInputSummaryFieldBindings
} from './faLocaleTranslationsInputRootBindingsWiring'

export function createFaLocaleTranslationsInputRootModelWiring (deps: {
  computed: typeof import('vue').computed
  createFaLocaleTranslationsInputViewWiring: typeof import('./faLocaleTranslationsInputViewWiring').createFaLocaleTranslationsInputViewWiring
  emit: I_faLocaleTranslationsInputRootEmit
  props: I_faLocaleTranslationsInputRootProps
  ref: typeof import('vue').ref
  toRef: typeof import('vue').toRef
  useFaLocaleTranslationsInput: typeof import('./faLocaleTranslationsInput_manager').useFaLocaleTranslationsInput
  useFaLocaleTranslationsInputSingularPlural: typeof import('./faLocaleTranslationsInputSingularPlural_manager').useFaLocaleTranslationsInputSingularPlural
}): {
    activeComposable: ComputedRef<T_faLocaleTranslationsInputActiveComposableApi>
    isSingularPluralForms: ComputedRef<boolean>
    readPreferredLanguageInputFocus: () => (() => void) | null
    resolvedTextareaRows: ComputedRef<number>
    setPreferredLanguageInputRef: (component: import('vue').ComponentPublicInstance | Element | null) => void
    singularPluralModelValueRef: ComputedRef<I_faLocaleSingularPluralTranslations>
  } {
  const isSingularPluralForms = deps.computed(() => deps.props.translationForms === 'singularPlural')
  const summaryFieldRef = deps.ref<InstanceType<typeof FaLocaleTranslationsInputSummaryField> | null>(null)
  const preferredLanguageInputRef = deps.ref<QInput | null>(null)
  const singleModelValueRef = deps.computed(
    () => deps.props.modelValue as I_faLocaleStringTranslations
  )
  const singularPluralModelValueRef = deps.computed({
    get: () => deps.props.modelValue as I_faLocaleSingularPluralTranslations,
    set: (value) => {
      deps.emit('update:modelValue', value)
    }
  })
  const composableWiring = createFaLocaleTranslationsInputRootActiveComposable({
    computed: deps.computed,
    createFaLocaleTranslationsInputViewWiring: deps.createFaLocaleTranslationsInputViewWiring,
    emit: deps.emit,
    isSingularPluralForms,
    preferredLanguageInputRef,
    props: deps.props,
    singularPluralModelValueRef,
    singleModelValueRef,
    summaryFieldRef,
    toRef: deps.toRef,
    useFaLocaleTranslationsInput: deps.useFaLocaleTranslationsInput,
    useFaLocaleTranslationsInputSingularPlural: deps.useFaLocaleTranslationsInputSingularPlural
  })
  return {
    activeComposable: composableWiring.activeComposable,
    isSingularPluralForms,
    readPreferredLanguageInputFocus: composableWiring.readPreferredLanguageInputFocus,
    resolvedTextareaRows: composableWiring.resolvedTextareaRows,
    setPreferredLanguageInputRef: composableWiring.setPreferredLanguageInputRef,
    singularPluralModelValueRef
  }
}

export function createFaLocaleTranslationsInputRootBindingsState (deps: {
  activeComposable: ComputedRef<T_faLocaleTranslationsInputActiveComposableApi>
  computed: typeof import('vue').computed
  createFaLocaleTranslationsInputFallbackWarningTooltip: typeof import('./faLocaleTranslationsInputViewWiring').createFaLocaleTranslationsInputFallbackWarningTooltip
  createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip: typeof import('./faLocaleTranslationsInputViewWiring').createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip
  isSingularPluralForms: ComputedRef<boolean>
  props: I_faLocaleTranslationsInputRootProps
  resolvedTextareaRows: ComputedRef<number>
  setPreferredLanguageInputRef: (component: import('vue').ComponentPublicInstance | Element | null) => void
  singularPluralModelValueRef: ComputedRef<I_faLocaleSingularPluralTranslations>
  translate: (key: string, params?: Record<string, unknown>) => string
}): {
    menuPanelBindings: ComputedRef<I_faLocaleTranslationsInputMenuPanelBindings>
    summaryFieldBindings: ComputedRef<I_faLocaleTranslationsInputSummaryFieldBindings>
  } {
  const fallbackWarningTooltip = deps.computed(() => {
    if (deps.isSingularPluralForms.value) {
      return deps.createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip({
        computed: deps.computed,
        readCurrentLanguageCode: () => deps.props.currentLanguageCode,
        readModelValue: () => deps.singularPluralModelValueRef.value,
        translate: (key, params) => deps.translate(key, params ?? {})
      }).value
    }
    return deps.createFaLocaleTranslationsInputFallbackWarningTooltip({
      computed: deps.computed,
      readResolvedLanguageCode: () => deps.activeComposable.value.resolvedLanguageCode.value,
      translate: (key, params) => deps.translate(key, params ?? {})
    }).value
  })
  const menuPanelBindings = deps.computed(() => {
    return buildFaLocaleTranslationsInputMenuPanelBindings({
      activeComposable: deps.activeComposable.value,
      isSingularPluralForms: deps.isSingularPluralForms.value,
      pluralColumnLabel: deps.translate('faLocaleTranslationsInput.pluralColumnLabel'),
      props: deps.props,
      resolvedTextareaRows: deps.resolvedTextareaRows.value,
      setPreferredLanguageInputRef: deps.setPreferredLanguageInputRef,
      singularColumnLabel: deps.translate('faLocaleTranslationsInput.singularColumnLabel')
    })
  })
  const summaryFieldBindings = deps.computed(() => {
    return buildFaLocaleTranslationsInputSummaryFieldBindings({
      activeComposable: deps.activeComposable.value,
      fallbackWarningTooltip: fallbackWarningTooltip.value,
      isSingularPluralForms: deps.isSingularPluralForms.value,
      pluralColumnLabel: deps.translate('faLocaleTranslationsInput.pluralColumnLabel'),
      props: deps.props,
      resolvedTextareaRows: deps.resolvedTextareaRows.value,
      setPreferredLanguageInputRef: deps.setPreferredLanguageInputRef,
      singularColumnLabel: deps.translate('faLocaleTranslationsInput.singularColumnLabel'),
      translateButtonTooltip: deps.translate('faLocaleTranslationsInput.translateButtonTooltip')
    })
  })
  return {
    menuPanelBindings,
    summaryFieldBindings
  }
}
