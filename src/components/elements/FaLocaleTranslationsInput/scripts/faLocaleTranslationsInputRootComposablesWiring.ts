import type { ComputedRef, Ref } from 'vue'
import type { QInput } from 'quasar'

import type {
  I_faLocaleTranslationsInputRootEmit,
  I_faLocaleTranslationsInputRootProps
} from 'app/types/I_faLocaleTranslationsInputRoot'
import type { T_faLocaleTranslationsInputMode } from 'app/types/I_faLocaleTranslationsInput'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_faLocaleTranslationsInputActiveComposableApi } from 'app/types/I_faLocaleTranslationsInputRoot'

import type FaLocaleTranslationsInputSummaryField from '../FaLocaleTranslationsInputSummaryField.vue'

export function createFaLocaleTranslationsInputRootActiveComposable (deps: {
  computed: typeof import('vue').computed
  createFaLocaleTranslationsInputViewWiring: typeof import('./faLocaleTranslationsInputViewWiring').createFaLocaleTranslationsInputViewWiring
  emit: I_faLocaleTranslationsInputRootEmit
  isSingularPluralForms: ComputedRef<boolean>
  preferredLanguageInputRef: Ref<QInput | null>
  props: I_faLocaleTranslationsInputRootProps
  singularPluralModelValueRef: ComputedRef<I_faLocaleSingularPluralTranslations>
  singleModelValueRef: ComputedRef<I_faLocaleStringTranslations>
  summaryFieldRef: Ref<InstanceType<typeof FaLocaleTranslationsInputSummaryField> | null>
  toRef: typeof import('vue').toRef
  useFaLocaleTranslationsInput: typeof import('./faLocaleTranslationsInput_manager').useFaLocaleTranslationsInput
  useFaLocaleTranslationsInputSingularPlural: typeof import('./faLocaleTranslationsInputSingularPlural_manager').useFaLocaleTranslationsInputSingularPlural
}): {
    activeComposable: ComputedRef<T_faLocaleTranslationsInputActiveComposableApi>
    readPreferredLanguageInputFocus: () => (() => void) | null
    resolvedTextareaRows: ComputedRef<number>
    setPreferredLanguageInputRef: (component: import('vue').ComponentPublicInstance | Element | null) => void
  } {
  const currentLanguageCodeRef = deps.toRef(deps.props, 'currentLanguageCode')
  const inputModeRef = deps.computed((): T_faLocaleTranslationsInputMode => deps.props.inputMode ?? 'singleLine')
  const maxLengthRef = deps.toRef(deps.props, 'maxLength')
  const singleViewWiring = deps.createFaLocaleTranslationsInputViewWiring({
    computed: deps.computed,
    emitModelValue: (value) => {
      deps.emit('update:modelValue', value)
    },
    preferredLanguageInputRef: deps.preferredLanguageInputRef,
    readRows: () => deps.props.rows,
    readTriggerElement: () => deps.summaryFieldRef.value?.readTranslationsButtonElement() ?? null
  })
  const singularPluralViewWiring = deps.createFaLocaleTranslationsInputViewWiring({
    computed: deps.computed,
    emitModelValue: (value) => {
      deps.emit('update:modelValue', {
        plural: value,
        singular: { ...deps.singularPluralModelValueRef.value.singular }
      })
    },
    preferredLanguageInputRef: deps.preferredLanguageInputRef,
    readRows: () => deps.props.rows,
    readTriggerElement: () => deps.summaryFieldRef.value?.readTranslationsButtonElement() ?? null
  })
  const singleComposable = deps.useFaLocaleTranslationsInput({
    currentLanguageCode: currentLanguageCodeRef,
    emitModelValue: singleViewWiring.emitUpdate,
    inputMode: inputModeRef,
    maxLength: maxLengthRef,
    modelValue: deps.singleModelValueRef,
    readPreferredLanguageInputFocus: singleViewWiring.readPreferredLanguageInputFocus,
    readTriggerElement: singleViewWiring.readTriggerElement,
    requestAnimationFrame: (callback) => window.requestAnimationFrame(callback)
  })
  const singularPluralComposable = deps.useFaLocaleTranslationsInputSingularPlural({
    currentLanguageCode: currentLanguageCodeRef,
    emitModelValue: (value) => {
      deps.emit('update:modelValue', value)
    },
    inputMode: inputModeRef,
    maxLength: maxLengthRef,
    modelValue: deps.singularPluralModelValueRef,
    readPreferredLanguageInputFocus: singularPluralViewWiring.readPreferredLanguageInputFocus,
    readTriggerElement: singularPluralViewWiring.readTriggerElement,
    requestAnimationFrame: (callback) => window.requestAnimationFrame(callback)
  })
  const activeComposable = deps.computed(() => {
    return deps.isSingularPluralForms.value ? singularPluralComposable : singleComposable
  })
  function readPreferredLanguageInputFocus (): (() => void) | null {
    if (deps.isSingularPluralForms.value) {
      return singularPluralViewWiring.readPreferredLanguageInputFocus()
    }
    return singleViewWiring.readPreferredLanguageInputFocus()
  }
  const resolvedTextareaRows = deps.computed(() => {
    if (deps.isSingularPluralForms.value) {
      return singularPluralViewWiring.resolvedTextareaRows.value
    }
    return singleViewWiring.resolvedTextareaRows.value
  })
  function setPreferredLanguageInputRef (
    component: import('vue').ComponentPublicInstance | Element | null
  ): void {
    if (deps.isSingularPluralForms.value) {
      singularPluralViewWiring.setPreferredLanguageInputRef(component)
      return
    }
    singleViewWiring.setPreferredLanguageInputRef(component)
  }
  return {
    activeComposable,
    readPreferredLanguageInputFocus,
    resolvedTextareaRows,
    setPreferredLanguageInputRef
  }
}
