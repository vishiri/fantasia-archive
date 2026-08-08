import type {
  I_faSelectInputObjectItem,
  I_faSelectInputUseDeps,
  I_faSelectInputUseInput,
  T_faSelectInputLabelHighlightSegment,
  T_faSelectInputModelValue,
  T_faSelectInputOption
} from 'app/types/I_faSelectInput'
import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

type T_faSelectInputQSelectRef = {
  hidePopup?: () => void
  updateInputValue?: (value: string) => void
}

type T_faSelectInputFilterUpdate = (callbackFn: () => void) => void

type T_faSelectInputNewValueDoneMode = 'add' | 'add-unique' | 'toggle'

type T_faSelectInputApi = {
  chipColorForOption: (opt: T_faSelectInputOption) => string
  clearIsNewFlags: (ids: readonly string[]) => void
  filteredOptions: I_ref<T_faSelectInputOption[]>
  isObjectMode: I_computedRef<boolean>
  onFilter: (needle: string, update: T_faSelectInputFilterUpdate) => void
  onFocus: () => void
  onNewValue: (
    typedText: string,
    done?: (
      value?: string | I_faSelectInputObjectItem,
      mode?: T_faSelectInputNewValueDoneMode
    ) => void
  ) => void
  onPopupShow: () => void
  onUpdateModelValue: (value: T_faSelectInputModelValue) => void
  optionLabelHighlightSegments: (
    opt: T_faSelectInputOption
  ) => T_faSelectInputLabelHighlightSegment[]
  selectRef: I_ref<T_faSelectInputQSelectRef | null>
}

function createFaSelectInputEmitAndClearHelpers (
  deps: I_faSelectInputUseDeps,
  input: I_faSelectInputUseInput,
  selectRef: I_ref<T_faSelectInputQSelectRef | null>
): {
    emitModelAndChange: (nextValue: T_faSelectInputModelValue) => void
    maybeClearSearchInputAfterSelect: () => void
  } {
  function clearSearchInput (): void {
    const selectApi = selectRef.value
    if (selectApi?.updateInputValue === undefined) {
      return
    }
    selectApi.updateInputValue('')
  }

  function maybeClearSearchInputAfterSelect (): void {
    if (!input.getClearInputOnSelect()) {
      return
    }
    void deps.nextTick(() => {
      clearSearchInput()
    })
  }

  function emitModelAndChange (nextValue: T_faSelectInputModelValue): void {
    const previousValue = input.getModelValue()
    const changePayload = deps.createFaSelectInputChangePayload(
      previousValue,
      nextValue,
      input.getMultiple()
    )
    input.emitModelValue(nextValue)
    input.emitChange(changePayload)
  }

  return {
    emitModelAndChange,
    maybeClearSearchInputAfterSelect
  }
}

function createFaSelectInputFilterHighlightHelpers (
  deps: I_faSelectInputUseDeps,
  input: I_faSelectInputUseInput
): {
    filteredOptions: I_ref<T_faSelectInputOption[]>
    onFilter: (needle: string, update: T_faSelectInputFilterUpdate) => void
    optionLabelHighlightSegments: (
      opt: T_faSelectInputOption
    ) => T_faSelectInputLabelHighlightSegment[]
    refreshFilteredOptions: (needle: string) => void
  } {
  const filterNeedle = deps.ref('')
  const filteredOptions = deps.ref<T_faSelectInputOption[]>(
    deps.normalizeFaSelectInputOptions(input.getMode(), input.getOptions())
  )

  function refreshFilteredOptions (needle: string): void {
    filterNeedle.value = needle
    const normalized = deps.normalizeFaSelectInputOptions(
      input.getMode(),
      input.getOptions()
    )
    const filterFn = input.getFilterFn() ?? deps.filterFaSelectInputOptionsByQuery
    filteredOptions.value = filterFn(needle, normalized)
  }

  function optionLabelHighlightSegments (
    opt: T_faSelectInputOption
  ): T_faSelectInputLabelHighlightSegment[] {
    const label = typeof opt === 'string' ? opt : opt.name
    return deps.splitFaSelectInputLabelForFilterHighlight(label, filterNeedle.value)
  }

  function onFilter (needle: string, update: T_faSelectInputFilterUpdate): void {
    update(() => {
      refreshFilteredOptions(needle)
    })
  }

  return {
    filteredOptions,
    onFilter,
    optionLabelHighlightSegments,
    refreshFilteredOptions
  }
}

function createFaSelectInputApi (
  deps: I_faSelectInputUseDeps,
  input: I_faSelectInputUseInput
): T_faSelectInputApi {
  const selectRef = deps.ref<T_faSelectInputQSelectRef | null>(null)
  const isObjectMode = deps.computed(() => {
    return deps.isFaSelectInputObjectMode(input.getMode())
  })
  const {
    emitModelAndChange,
    maybeClearSearchInputAfterSelect
  } = createFaSelectInputEmitAndClearHelpers(deps, input, selectRef)
  const {
    filteredOptions,
    onFilter,
    optionLabelHighlightSegments,
    refreshFilteredOptions
  } = createFaSelectInputFilterHighlightHelpers(deps, input)

  function onUpdateModelValue (value: T_faSelectInputModelValue): void {
    emitModelAndChange(value)
    maybeClearSearchInputAfterSelect()
  }

  function onNewValue (
    typedText: string,
    done?: (
      value?: string | I_faSelectInputObjectItem,
      mode?: T_faSelectInputNewValueDoneMode
    ) => void
  ): void {
    if (!input.getAllowCreateNew()) {
      done?.()
      return
    }
    const created = deps.createFaSelectInputNewItem(
      input.getMode(),
      typedText,
      deps.createId
    )
    if (created === null) {
      done?.()
      return
    }
    const nextValue = deps.appendFaSelectInputCreatedValue(
      input.getModelValue(),
      created,
      input.getMultiple()
    )
    emitModelAndChange(nextValue)
    input.emitNewValue(created)
    maybeClearSearchInputAfterSelect()
    // Call done with no value so Quasar clears filter without double-adding.
    done?.()
  }

  function onFocus (): void {
    input.emitRequestOptions()
  }

  function onPopupShow (): void {
    input.emitRequestOptions()
    refreshFilteredOptions('')
  }

  function clearIsNewFlags (ids: readonly string[]): void {
    const nextValue = deps.clearFaSelectInputIsNewFlags(input.getModelValue(), ids)
    if (nextValue === input.getModelValue()) {
      return
    }
    emitModelAndChange(nextValue)
  }

  function chipColorForOption (opt: T_faSelectInputOption): string {
    if (typeof opt !== 'string' && opt.isNew === true) {
      return deps.newChipColor
    }
    return deps.defaultChipColor
  }

  return {
    chipColorForOption,
    clearIsNewFlags,
    filteredOptions,
    isObjectMode,
    onFilter,
    onFocus,
    onNewValue,
    onPopupShow,
    onUpdateModelValue,
    optionLabelHighlightSegments,
    selectRef
  }
}

/**
 * Factory for FaSelectInput composable (filter, create-new, clear isNew, emits).
 */
export function createUseFaSelectInput (
  deps: I_faSelectInputUseDeps
): (input: I_faSelectInputUseInput) => T_faSelectInputApi {
  return function useFaSelectInput (input: I_faSelectInputUseInput): T_faSelectInputApi {
    return createFaSelectInputApi(deps, input)
  }
}
