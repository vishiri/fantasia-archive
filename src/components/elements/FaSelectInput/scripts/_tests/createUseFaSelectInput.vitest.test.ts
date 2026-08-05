/** @vitest-environment jsdom */
import { computed, nextTick, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import {
  FA_SELECT_INPUT_DEFAULT_CHIP_COLOR,
  FA_SELECT_INPUT_NEW_CHIP_COLOR
} from 'app/types/I_faSelectInput'

import {
  appendFaSelectInputCreatedValue,
  clearFaSelectInputIsNewFlags,
  createFaSelectInputChangePayload,
  createFaSelectInputNewItem,
  filterFaSelectInputOptionsByQuery,
  isFaSelectInputObjectMode,
  normalizeFaSelectInputOptions,
  splitFaSelectInputLabelForFilterHighlight
} from 'app/src/scripts/faSelectInput/faSelectInput_manager'

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
    filterFaSelectInputOptionsByQuery,
    isFaSelectInputObjectMode,
    newChipColor: FA_SELECT_INPUT_NEW_CHIP_COLOR,
    nextTick,
    normalizeFaSelectInputOptions,
    ref,
    splitFaSelectInputLabelForFilterHighlight
  })
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
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
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
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
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
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => true,
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
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
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
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => true,
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
 * Focus and popup-show request options from parent.
 */
test('Test that createUseFaSelectInput emits request-options on focus and popup show', () => {
  const useFaSelectInput = createTestUseFaSelectInput()
  const emitRequestOptions = vi.fn()

  const api = useFaSelectInput({
    emitChange: vi.fn(),
    emitModelValue: vi.fn(),
    emitNewValue: vi.fn(),
    emitRequestOptions,
    getAllowCreateNew: () => false,
    getClearInputOnSelect: () => false,
    getFilterFn: () => undefined,
    getMode: () => 'simple',
    getModelValue: () => '',
    getMultiple: () => false,
    getOptions: () => ['a']
  })

  api.onFocus()
  api.onPopupShow()
  expect(emitRequestOptions).toHaveBeenCalledTimes(2)
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
    emitRequestOptions: vi.fn(),
    getAllowCreateNew: () => false,
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
