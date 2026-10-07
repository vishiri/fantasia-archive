import type {
  I_faSelectInputObjectItem,
  I_faSelectInputUseDeps,
  I_faSelectInputUseInput,
  T_faSelectInputLabelHighlightSegment,
  T_faSelectInputModelValue,
  T_faSelectInputOption
} from 'app/types/I_faSelectInput'
import type { I_ref } from 'app/types/I_vueCompositionShims'

type T_faSelectInputQSelectRef = {
  focus?: () => void
  getOptionIndex?: () => number
  hidePopup?: () => void
  moveOptionSelection?: (offset: number, skipInputValue?: boolean) => void
  setOptionIndex?: (index: number) => void
  showPopup?: () => void
  updateInputValue?: (value: string) => void
}

type T_faSelectInputFilterUpdate = (
  callbackFn: () => void,
  afterFn?: (selectRef: T_faSelectInputQSelectRef) => void
) => void

type T_faSelectInputNewValueDoneMode = 'add' | 'add-unique' | 'toggle'
type T_faSelectInputNewValueDone = (
  value?: string | I_faSelectInputObjectItem,
  mode?: T_faSelectInputNewValueDoneMode
) => void

function highlightFirstOption (
  select: T_faSelectInputQSelectRef | null | undefined,
  optionCount: number
): void {
  if (
    select == null ||
    optionCount <= 0 ||
    typeof select.setOptionIndex !== 'function' ||
    typeof select.moveOptionSelection !== 'function'
  ) {
    return
  }
  select.setOptionIndex(-1)
  select.moveOptionSelection(1, true)
}

function createFaSelectInputFilterCore (
  deps: I_faSelectInputUseDeps,
  input: I_faSelectInputUseInput,
  selectRef: I_ref<T_faSelectInputQSelectRef | null>
) {
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
    update(
      () => {
        refreshFilteredOptions(needle)
      },
      () => {
        highlightFirstOption(selectRef.value, filteredOptions.value.length)
      }
    )
  }

  function getFilterNeedle (): string {
    return filterNeedle.value
  }

  return {
    filteredOptions,
    getFilterNeedle,
    onFilter,
    optionLabelHighlightSegments,
    refreshFilteredOptions
  }
}

function createFaSelectInputModelHandlers (
  deps: I_faSelectInputUseDeps,
  input: I_faSelectInputUseInput,
  selectRef: I_ref<T_faSelectInputQSelectRef | null>
) {
  function maybeClearSearchInputAfterSelect (): void {
    if (!input.getClearInputOnSelect()) {
      return
    }
    void deps.nextTick(() => {
      selectRef.value?.updateInputValue?.('')
    })
  }

  function emitModelAndChange (nextValue: T_faSelectInputModelValue): void {
    const previousValue = input.getModelValue()
    input.emitModelValue(nextValue)
    input.emitChange(deps.createFaSelectInputChangePayload(
      previousValue,
      nextValue,
      input.getMultiple()
    ))
  }

  function onUpdateModelValue (value: T_faSelectInputModelValue): void {
    emitModelAndChange(value)
    maybeClearSearchInputAfterSelect()
  }

  function onNewValue (typedText: string, done?: T_faSelectInputNewValueDone): void {
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
    emitModelAndChange(deps.appendFaSelectInputCreatedValue(
      input.getModelValue(),
      created,
      input.getMultiple()
    ))
    input.emitNewValue(created)
    maybeClearSearchInputAfterSelect()
    done?.()
  }

  function clearIsNewFlags (ids: readonly string[]): void {
    const nextValue = deps.clearFaSelectInputIsNewFlags(input.getModelValue(), ids)
    if (nextValue === input.getModelValue()) {
      return
    }
    emitModelAndChange(nextValue)
  }

  return {
    clearIsNewFlags,
    onNewValue,
    onUpdateModelValue
  }
}

/** Level-1 FaSelectInput API (filter, highlight, create-new, openPopup, Enter activate). */
export function createFaSelectInputApi (
  deps: I_faSelectInputUseDeps,
  input: I_faSelectInputUseInput
) {
  const selectRef = deps.ref<T_faSelectInputQSelectRef | null>(null)
  const isObjectMode = deps.computed(() => deps.isFaSelectInputObjectMode(input.getMode()))
  const filterCore = createFaSelectInputFilterCore(deps, input, selectRef)
  const modelHandlers = createFaSelectInputModelHandlers(deps, input, selectRef)

  function openPopup (): void {
    const select = selectRef.value
    // Quasar showPopup + onFilter requires the field focused; focus() may be deferred
    // when focus-manager wait flags are set (e.g. after another QSelect hidePopup).
    select?.focus?.()
    void deps.nextTick(() => {
      selectRef.value?.showPopup?.()
    })
  }

  function hidePopup (): void {
    selectRef.value?.hidePopup?.()
  }

  function onFocus (): void {
    input.emitRequestOptions()
  }

  function onPopupShow (): void {
    input.emitRequestOptions()
    filterCore.refreshFilteredOptions(filterCore.getFilterNeedle())
    highlightFirstOption(selectRef.value, filterCore.filteredOptions.value.length)
  }

  function onSelectKeyup (e: { key?: string, keyCode?: number }): void {
    if (e.key === 'Tab' || e.keyCode === 9) {
      openPopup()
    }
  }

  function onSelectKeydown (e: {
    isComposing?: boolean
    key?: string
    keyCode?: number
    preventDefault?: () => void
  }): void {
    if (e.key !== 'Enter' && e.keyCode !== 13) {
      return
    }
    if (!deps.shouldActivateFaSelectInputOnEnter(e)) {
      return
    }
    const opt = deps.resolveFaSelectInputEnterActivateOption({
      filteredOptions: filterCore.filteredOptions.value,
      getOptionIndex: selectRef.value?.getOptionIndex,
      modelValue: input.getModelValue()
    })
    if (opt === undefined) {
      return
    }
    if (input.getActivateOnly()) {
      e.preventDefault?.()
    }
    input.emitOptionActivate(opt)
  }

  function chipColorForOption (opt: T_faSelectInputOption): string {
    if (typeof opt !== 'string' && opt.isNew === true) {
      return deps.newChipColor
    }
    return deps.defaultChipColor
  }

  function resolveOptionIcon (opt: T_faSelectInputOption): string | null {
    return deps.resolveFaSelectInputOptionIcon(
      opt,
      input.getMode(),
      deps.emptyDocumentTemplateIcon
    )
  }

  const {
    clearIsNewFlags,
    onNewValue,
    onUpdateModelValue
  } = modelHandlers
  const {
    filteredOptions,
    getFilterNeedle,
    onFilter,
    optionLabelHighlightSegments
  } = filterCore
  return {
    chipColorForOption,
    clearIsNewFlags,
    filteredOptions,
    getFilterNeedle,
    hidePopup,
    isObjectMode,
    onFilter,
    onFocus,
    onNewValue,
    onPopupShow,
    onSelectKeydown,
    onSelectKeyup,
    onUpdateModelValue,
    openPopup,
    optionLabelHighlightSegments,
    resolveOptionIcon,
    selectRef
  }
}
