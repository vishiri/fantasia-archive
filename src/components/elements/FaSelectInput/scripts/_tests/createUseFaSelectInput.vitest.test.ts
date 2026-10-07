/** @vitest-environment jsdom */
import { computed, nextTick, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import {
  FA_SELECT_INPUT_DEFAULT_CHIP_COLOR,
  FA_SELECT_INPUT_NEW_CHIP_COLOR
} from 'app/types/I_faSelectInput'

import { shouldAcceptFaEnterOutsideIme } from 'app/src/scripts/dom/dom_manager'

import {
  appendFaSelectInputCreatedValue,
  clearFaSelectInputIsNewFlags,
  createFaSelectInputChangePayload,
  createFaSelectInputNewItem,
  filterFaSelectInputOptionsByQuery,
  isFaSelectInputObjectMode,
  normalizeFaSelectInputOptions,
  resolveFaSelectInputEnterActivateOption,
  resolveFaSelectInputOptionIcon,
  splitFaSelectInputLabelForFilterHighlight
} from 'app/src/scripts/faSelectInput/faSelectInput_manager'

import { createFaSelectInputApi } from '../functions/createFaSelectInputApi'
import { createUseFaSelectInput } from '../functions/createUseFaSelectInput'

function createTestUseFaSelectInput () {
  return createUseFaSelectInput({
    appendFaSelectInputCreatedValue,
    clearFaSelectInputIsNewFlags,
    computed,
    createFaSelectInputChangePayload,
    createFaSelectInputNewItem,
    createId: () => 'fixed-uuid',
    defaultChipColor: FA_SELECT_INPUT_DEFAULT_CHIP_COLOR,
    emptyDocumentTemplateIcon: 'mdi-file-outline',
    filterFaSelectInputOptionsByQuery,
    isFaSelectInputObjectMode,
    newChipColor: FA_SELECT_INPUT_NEW_CHIP_COLOR,
    nextTick,
    normalizeFaSelectInputOptions,
    ref,
    resolveFaSelectInputEnterActivateOption,
    resolveFaSelectInputOptionIcon,
    shouldActivateFaSelectInputOnEnter: shouldAcceptFaEnterOutsideIme,
    splitFaSelectInputLabelForFilterHighlight
  }, createFaSelectInputApi)
}

/**
 * createUseFaSelectInput
 * Emits model + change on update and clears search when opted in.
 */
test('Test that createUseFaSelectInput emits change and clears search on select when enabled', async () => {
  const useFaSelectInput = createTestUseFaSelectInput()
  const emitChange = vi.fn()
  const emitModelValue = vi.fn()
  const modelValue = ref<string[]>([])

  const api = useFaSelectInput({
    emitChange,
    emitModelValue,
    emitNewValue: vi.fn(),
    emitOptionActivate: vi.fn(),
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
    getActivateOnly: () => false,
    getClearInputOnSelect: () => true,
    getFilterFn: () => undefined,
    getMode: () => 'simple',
    getModelValue: () => modelValue.value,
    getMultiple: () => true,
    getOptions: () => ['test 1', 'test 2']
  })

  const updateInputValue = vi.fn()
  api.selectRef.value = { updateInputValue }

  api.onUpdateModelValue(['test 1'])
  expect(emitModelValue).toHaveBeenCalledWith(['test 1'])
  expect(emitChange).toHaveBeenCalledWith({
    action: 'add',
    value: ['test 1']
  })

  await nextTick()
  expect(updateInputValue).toHaveBeenCalledWith('')
})

/**
 * createUseFaSelectInput
 * Clear-input skip and no-op paths when API missing or flags unchanged.
 */
test('Test that createUseFaSelectInput handles clear-input and no-op create/clear paths', async () => {
  const useFaSelectInput = createTestUseFaSelectInput()
  const emitNewValue = vi.fn()
  const emitModelValue = vi.fn()

  const api = useFaSelectInput({
    emitChange: vi.fn(),
    emitModelValue,
    emitNewValue,
    emitOptionActivate: vi.fn(),
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
    getActivateOnly: () => false,
    getClearInputOnSelect: () => true,
    getFilterFn: () => undefined,
    getMode: () => 'simple',
    getModelValue: () => '',
    getMultiple: () => false,
    getOptions: () => ['a']
  })

  api.selectRef.value = {}
  api.onUpdateModelValue('a')
  await nextTick()

  api.onNewValue('ignored')
  expect(emitNewValue).not.toHaveBeenCalled()

  const allowCreateApi = useFaSelectInput({
    emitChange: vi.fn(),
    emitModelValue: vi.fn(),
    emitNewValue: vi.fn(),
    emitOptionActivate: vi.fn(),
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => true,
    getActivateOnly: () => false,
    getClearInputOnSelect: () => false,
    getFilterFn: () => undefined,
    getMode: () => 'simple',
    getModelValue: () => '',
    getMultiple: () => false,
    getOptions: () => []
  })
  allowCreateApi.onNewValue('   ')
  expect(allowCreateApi.filteredOptions.value).toEqual([])

  const modelValue = ref({
    id: '1',
    name: 'Doc'
  })
  const clearApi = useFaSelectInput({
    emitChange: vi.fn(),
    emitModelValue,
    emitNewValue: vi.fn(),
    emitOptionActivate: vi.fn(),
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
    getActivateOnly: () => false,
    getClearInputOnSelect: () => false,
    getFilterFn: () => undefined,
    getMode: () => 'document',
    getModelValue: () => modelValue.value,
    getMultiple: () => false,
    getOptions: () => []
  })
  emitModelValue.mockClear()
  clearApi.clearIsNewFlags(['1'])
  expect(emitModelValue).not.toHaveBeenCalled()
})

/**
 * createUseFaSelectInput
 * Create-new builds object with isNew and clearIsNewFlags strips it.
 */
test('Test that createUseFaSelectInput create-new and clearIsNewFlags work for object mode', () => {
  const useFaSelectInput = createTestUseFaSelectInput()
  const emitChange = vi.fn()
  const emitModelValue = vi.fn()
  const emitNewValue = vi.fn()
  const modelValue = ref<{ id: string, name: string, isNew?: boolean } | null>(null)

  const api = useFaSelectInput({
    emitChange,
    emitModelValue,
    emitNewValue,
    emitOptionActivate: vi.fn(),
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => true,
    getActivateOnly: () => false,
    getClearInputOnSelect: () => false,
    getFilterFn: () => undefined,
    getMode: () => 'document',
    getModelValue: () => modelValue.value,
    getMultiple: () => false,
    getOptions: () => []
  })

  api.onNewValue('Hero')
  expect(emitNewValue).toHaveBeenCalledWith({
    id: 'fixed-uuid',
    isNew: true,
    name: 'Hero'
  })
  expect(emitModelValue).toHaveBeenCalledWith({
    id: 'fixed-uuid',
    isNew: true,
    name: 'Hero'
  })
  expect(api.chipColorForOption({
    id: 'fixed-uuid',
    isNew: true,
    name: 'Hero'
  })).toBe(FA_SELECT_INPUT_NEW_CHIP_COLOR)

  expect(api.chipColorForOption('plain')).toBe(FA_SELECT_INPUT_DEFAULT_CHIP_COLOR)

  modelValue.value = {
    id: 'fixed-uuid',
    isNew: true,
    name: 'Hero'
  }
  api.clearIsNewFlags(['fixed-uuid'])
  expect(emitModelValue).toHaveBeenLastCalledWith({
    id: 'fixed-uuid',
    name: 'Hero'
  })
})

/**
 * createUseFaSelectInput
 * Tab keyup opens popup; focus only requests options (no click open/close race).
 */
test('Test that createUseFaSelectInput opens popup on Tab keyup not focus', async () => {
  const useFaSelectInput = createTestUseFaSelectInput()
  const emitRequestOptions = vi.fn()
  const showPopup = vi.fn()

  const api = useFaSelectInput({
    emitChange: vi.fn(),
    emitModelValue: vi.fn(),
    emitNewValue: vi.fn(),
    emitOptionActivate: vi.fn(),
    emitRequestOptions,
    getAllowCreateNew: () => false,
    getActivateOnly: () => false,
    getClearInputOnSelect: () => false,
    getFilterFn: () => undefined,
    getMode: () => 'simple',
    getModelValue: () => '',
    getMultiple: () => false,
    getOptions: () => ['a']
  })

  api.selectRef.value = { showPopup }
  api.onFocus()
  expect(emitRequestOptions).toHaveBeenCalledTimes(1)
  await nextTick()
  expect(showPopup).not.toHaveBeenCalled()

  api.onSelectKeyup({ key: 'Tab' })
  await nextTick()
  expect(showPopup).toHaveBeenCalledTimes(1)

  showPopup.mockClear()
  api.onSelectKeyup({ key: 'a' })
  expect(showPopup).not.toHaveBeenCalled()

  api.onPopupShow()
  expect(emitRequestOptions).toHaveBeenCalledTimes(2)
})

/**
 * createUseFaSelectInput
 * openPopup focuses then calls Quasar showPopup on nextTick; hidePopup closes menu.
 */
test('Test that createUseFaSelectInput openPopup focuses then showPopup and hidePopup closes', async () => {
  const useFaSelectInput = createTestUseFaSelectInput()
  const focus = vi.fn()
  const hidePopup = vi.fn()
  const showPopup = vi.fn()

  const api = useFaSelectInput({
    emitChange: vi.fn(),
    emitModelValue: vi.fn(),
    emitNewValue: vi.fn(),
    emitOptionActivate: vi.fn(),
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
    getActivateOnly: () => false,
    getClearInputOnSelect: () => false,
    getFilterFn: () => undefined,
    getMode: () => 'simple',
    getModelValue: () => '',
    getMultiple: () => false,
    getOptions: () => ['a', 'b']
  })

  api.selectRef.value = {
    focus,
    hidePopup,
    showPopup
  }
  api.openPopup()
  expect(focus).toHaveBeenCalledTimes(1)
  expect(showPopup).not.toHaveBeenCalled()
  await nextTick()
  expect(showPopup).toHaveBeenCalledTimes(1)

  api.hidePopup()
  expect(hidePopup).toHaveBeenCalledTimes(1)

  api.selectRef.value = null
  api.openPopup()
  await nextTick()
  expect(showPopup).toHaveBeenCalledTimes(1)
  api.hidePopup()
  expect(hidePopup).toHaveBeenCalledTimes(1)
})

/**
 * createUseFaSelectInput
 * Enter on focused option emits option-activate (Quasar skips same-value model update).
 */
test('Test that createUseFaSelectInput Enter emits option-activate for focused option', () => {
  const useFaSelectInput = createTestUseFaSelectInput()
  const emitOptionActivate = vi.fn()

  const api = useFaSelectInput({
    emitChange: vi.fn(),
    emitModelValue: vi.fn(),
    emitNewValue: vi.fn(),
    emitOptionActivate,
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
    getActivateOnly: () => false,
    getClearInputOnSelect: () => false,
    getFilterFn: () => undefined,
    getMode: () => 'simple',
    getModelValue: () => 'Venus',
    getMultiple: () => false,
    getOptions: () => ['Mars', 'Venus']
  })

  api.onPopupShow()
  api.selectRef.value = {
    getOptionIndex: () => 1
  }
  api.onSelectKeydown({ key: 'Enter' })
  expect(emitOptionActivate).toHaveBeenCalledWith('Venus')

  emitOptionActivate.mockClear()
  api.onSelectKeydown({
    isComposing: true,
    key: 'Enter'
  })
  api.onSelectKeydown({
    key: 'Enter',
    keyCode: 229
  })
  expect(emitOptionActivate).not.toHaveBeenCalled()

  emitOptionActivate.mockClear()
  api.onSelectKeydown({ key: 'ArrowDown' })
  expect(emitOptionActivate).not.toHaveBeenCalled()

  // Index cleared (Quasar same-value Enter) → fall back to current model in filtered options.
  api.selectRef.value = { getOptionIndex: () => -1 }
  api.onSelectKeydown({ key: 'Enter' })
  expect(emitOptionActivate).toHaveBeenCalledWith('Venus')
})

/**
 * createUseFaSelectInput
 * Enter with no resolvable option is a no-op (no option-activate).
 */
test('Test that createUseFaSelectInput Enter without resolvable option is no-op', () => {
  const useFaSelectInput = createTestUseFaSelectInput()
  const emitOptionActivate = vi.fn()

  const api = useFaSelectInput({
    emitChange: vi.fn(),
    emitModelValue: vi.fn(),
    emitNewValue: vi.fn(),
    emitOptionActivate,
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
    getActivateOnly: () => false,
    getClearInputOnSelect: () => false,
    getFilterFn: () => undefined,
    getMode: () => 'simple',
    getModelValue: () => null,
    getMultiple: () => false,
    getOptions: () => ['Mars', 'Venus']
  })

  api.selectRef.value = { getOptionIndex: () => -1 }
  api.onSelectKeydown({ key: 'Enter' })
  expect(emitOptionActivate).not.toHaveBeenCalled()

  api.onSelectKeydown({ keyCode: 13 })
  expect(emitOptionActivate).not.toHaveBeenCalled()
})

/**
 * createUseFaSelectInput
 * activateOnly Enter prevents Quasar default select/close.
 */
test('Test that createUseFaSelectInput activateOnly Enter prevents default', () => {
  const useFaSelectInput = createTestUseFaSelectInput()
  const emitOptionActivate = vi.fn()
  const preventDefault = vi.fn()

  const api = useFaSelectInput({
    emitChange: vi.fn(),
    emitModelValue: vi.fn(),
    emitNewValue: vi.fn(),
    emitOptionActivate,
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
    getActivateOnly: () => true,
    getClearInputOnSelect: () => false,
    getFilterFn: () => undefined,
    getMode: () => 'simple',
    getModelValue: () => null,
    getMultiple: () => false,
    getOptions: () => ['Mars', 'Venus']
  })

  api.onFilter('Ma', (callbackFn) => {
    callbackFn()
  })
  api.selectRef.value = {
    getOptionIndex: () => 0
  }
  api.onSelectKeydown({
    key: 'Enter',
    preventDefault
  })
  expect(preventDefault).toHaveBeenCalledTimes(1)
  expect(emitOptionActivate).toHaveBeenCalledWith('Mars')
})

/**
 * createUseFaSelectInput
 * popup-show keeps the current filter needle (no empty flash).
 */
test('Test that createUseFaSelectInput popup-show preserves filter needle', () => {
  const useFaSelectInput = createTestUseFaSelectInput()
  const api = useFaSelectInput({
    emitChange: vi.fn(),
    emitModelValue: vi.fn(),
    emitNewValue: vi.fn(),
    emitOptionActivate: vi.fn(),
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
    getActivateOnly: () => false,
    getClearInputOnSelect: () => false,
    getFilterFn: () => undefined,
    getMode: () => 'simple',
    getModelValue: () => '',
    getMultiple: () => false,
    getOptions: () => ['Mars', 'Venus']
  })

  api.onFilter('af 1', (callbackFn) => {
    callbackFn()
  })
  expect(api.getFilterNeedle()).toBe('af 1')
  api.onPopupShow()
  expect(api.getFilterNeedle()).toBe('af 1')
})

/**
 * createUseFaSelectInput
 * popup-show and filter afterFn keyboard-highlight the first option.
 */
test('Test that createUseFaSelectInput highlights first option on popup show and filter', () => {
  const useFaSelectInput = createTestUseFaSelectInput()
  const setOptionIndex = vi.fn()
  const moveOptionSelection = vi.fn()

  const api = useFaSelectInput({
    emitChange: vi.fn(),
    emitModelValue: vi.fn(),
    emitNewValue: vi.fn(),
    emitOptionActivate: vi.fn(),
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
    getActivateOnly: () => false,
    getClearInputOnSelect: () => false,
    getFilterFn: () => undefined,
    getMode: () => 'simple',
    getModelValue: () => '',
    getMultiple: () => false,
    getOptions: () => ['Heroes', 'Places']
  })

  api.selectRef.value = {
    moveOptionSelection,
    setOptionIndex,
    showPopup: vi.fn()
  }

  api.onPopupShow()
  expect(setOptionIndex).toHaveBeenCalledWith(-1)
  expect(moveOptionSelection).toHaveBeenCalledWith(1, true)

  setOptionIndex.mockClear()
  moveOptionSelection.mockClear()

  api.onFilter('pla', (callbackFn, afterFn) => {
    callbackFn()
    afterFn?.(api.selectRef.value as never)
  })
  expect(api.filteredOptions.value).toEqual(['Places'])
  expect(setOptionIndex).toHaveBeenCalledWith(-1)
  expect(moveOptionSelection).toHaveBeenCalledWith(1, true)
})

/**
 * createUseFaSelectInput
 * Filter needle drives option label highlight segments.
 */
test('Test that createUseFaSelectInput highlights option labels from filter needle', () => {
  const useFaSelectInput = createTestUseFaSelectInput()

  const api = useFaSelectInput({
    emitChange: vi.fn(),
    emitModelValue: vi.fn(),
    emitNewValue: vi.fn(),
    emitOptionActivate: vi.fn(),
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
    getActivateOnly: () => false,
    getClearInputOnSelect: () => false,
    getFilterFn: () => undefined,
    getMode: () => 'simple',
    getModelValue: () => '',
    getMultiple: () => false,
    getOptions: () => ['Highlands', 'River']
  })

  expect(api.optionLabelHighlightSegments('Highlands')).toEqual([
    {
      isMatch: false,
      text: 'Highlands'
    }
  ])

  api.onFilter('high', (callbackFn) => {
    callbackFn()
  })

  expect(api.optionLabelHighlightSegments('Highlands')).toEqual([
    {
      isMatch: true,
      text: 'Highlands'
    }
  ])
  expect(api.optionLabelHighlightSegments({
    id: '1',
    name: 'Highland Path'
  })).toEqual([
    {
      isMatch: true,
      text: 'Highland'
    },
    {
      isMatch: false,
      text: ' '
    },
    {
      isMatch: false,
      text: 'Path'
    }
  ])
})
