import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

const displayNameModelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Hero')
})
const documentShowsEditFieldsRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(false)
})
const documentShowsPreviewRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(true)
})
const nameFieldLabelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Document name')
})
const previewDisplayNameRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Hero')
})
const documentTabRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref<I_faOpenedDocumentTab | null>({
    documentId: 'doc-1',
    displayNameDraft: 'Hero',
    persistenceState: 'persisted',
    savedDisplayName: 'Hero',
    documentTextColorDraft: '',
    savedDocumentTextColor: '',
    documentBackgroundColorDraft: '',
    savedDocumentBackgroundColor: '',
    hasUnsavedChanges: false,
    editState: false,
    tabLabel: 'Hero',
    templateIcon: 'mdi-account',
    worldId: 'world-1'
  })
})
const documentColorPickersReadOnlyRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(true)
})
const textColorModelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('')
})
const backgroundColorModelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('')
})
const textColorFieldLabelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Document text color')
})
const backgroundColorFieldLabelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Document background color')
})
const worldPickerPaletteRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref<string[]>([])
})
const worldColorPaletteAppendRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(undefined)
})
const onAppendToWorldPaletteMock = vi.hoisted(() => vi.fn())

vi.mock('../scripts/documentWorkspacePage_manager', () => {
  return {
    useDocumentWorkspacePage: () => {
      return {
        backgroundColorFieldLabel: backgroundColorFieldLabelRef,
        backgroundColorModel: backgroundColorModelRef,
        displayNameModel: displayNameModelRef,
        documentColorPickersReadOnly: documentColorPickersReadOnlyRef,
        documentShowsEditFields: documentShowsEditFieldsRef,
        documentShowsPreview: documentShowsPreviewRef,
        documentTab: documentTabRef,
        nameFieldLabel: nameFieldLabelRef,
        onAppendToWorldPalette: onAppendToWorldPaletteMock,
        previewDisplayName: previewDisplayNameRef,
        textColorFieldLabel: textColorFieldLabelRef,
        textColorModel: textColorModelRef,
        worldColorPaletteAppend: worldColorPaletteAppendRef,
        worldPickerPalette: worldPickerPaletteRef
      }
    }
  }
})

import DocumentWorkspacePage from '../DocumentWorkspacePage.vue'

beforeEach(() => {
  displayNameModelRef.value = 'Hero'
  documentShowsEditFieldsRef.value = false
  documentShowsPreviewRef.value = true
  documentColorPickersReadOnlyRef.value = true
  onAppendToWorldPaletteMock.mockClear()
  documentTabRef.value = {
    documentId: 'doc-1',
    displayNameDraft: 'Hero',
    persistenceState: 'persisted',
    savedDisplayName: 'Hero',
    documentTextColorDraft: '',
    savedDocumentTextColor: '',
    documentBackgroundColorDraft: '',
    savedDocumentBackgroundColor: '',
    hasUnsavedChanges: false,
    editState: false,
    tabLabel: 'Hero',
    templateIcon: 'mdi-account',
    worldId: 'world-1'
  }
  nameFieldLabelRef.value = 'Document name'
  previewDisplayNameRef.value = 'Hero'
})

/**
 * DocumentWorkspacePage SFC presence
 */
test('Test that DocumentWorkspacePage SFC is defined', () => {
  expect(DocumentWorkspacePage).toBeTruthy()
})

test('Test that DocumentWorkspacePage renders preview title when edit fields are hidden', async () => {
  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        FaColorPickerInput: {
          name: 'FaColorPickerInput',
          props: ['modelValue', 'readOnly', 'testLocator'],
          emits: ['update:modelValue', 'append-to-world-palette'],
          template: '<div :data-test-locator="testLocator" :data-read-only="readOnly" />'
        },
        QInput: {
          props: ['modelValue', 'label'],
          template: '<input :data-test-locator="$attrs[\'data-test-locator\']" :value="modelValue" />'
        }
      }
    }
  })
  await flushPromises()

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-previewTitle"]').text()).toBe('Hero')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-nameInput"]').exists()).toBe(false)
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-textColorInput"]').attributes('data-read-only')).toBe('true')

  wrapper.unmount()
})

test('Test that DocumentWorkspacePage renders name input when edit fields are shown', async () => {
  documentShowsPreviewRef.value = false
  documentShowsEditFieldsRef.value = true

  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        FaColorPickerInput: {
          name: 'FaColorPickerInput',
          props: ['modelValue', 'readOnly', 'testLocator'],
          emits: ['update:modelValue', 'append-to-world-palette'],
          template: '<div :data-test-locator="testLocator" :data-read-only="readOnly" />'
        },
        QInput: {
          props: ['modelValue', 'label'],
          emits: ['update:modelValue'],
          template: '<input :data-test-locator="$attrs[\'data-test-locator\']" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
        }
      }
    }
  })
  await flushPromises()

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-previewTitle"]').exists()).toBe(false)
  const nameInput = wrapper.get('[data-test-locator="documentWorkspacePage-nameInput"]')
  expect(nameInput.attributes('value')).toBe('Hero')
  await nameInput.setValue('Renamed hero')
  expect(displayNameModelRef.value).toBe('Renamed hero')

  wrapper.unmount()
})

test('Test that DocumentWorkspacePage renders editable color fields and forwards palette append', async () => {
  documentShowsPreviewRef.value = false
  documentShowsEditFieldsRef.value = true
  documentColorPickersReadOnlyRef.value = false
  textColorModelRef.value = '#aabbcc'
  backgroundColorModelRef.value = '#112233'

  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        FaColorPickerInput: {
          name: 'FaColorPickerInput',
          props: ['modelValue', 'readOnly', 'testLocator'],
          emits: ['update:modelValue', 'append-to-world-palette'],
          template: '<div :data-test-locator="testLocator" :data-read-only="readOnly" @click="$emit(\'append-to-world-palette\', modelValue); $emit(\'update:modelValue\', modelValue)" />'
        },
        QInput: {
          props: ['modelValue', 'label'],
          template: '<input :data-test-locator="$attrs[\'data-test-locator\']" :value="modelValue" />'
        }
      }
    }
  })
  await flushPromises()

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-textColorLabel"]').text()).toBe('Document text color')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-backgroundColorLabel"]').text()).toBe('Document background color')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-textColorInput"]').attributes('data-read-only')).toBe('false')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-backgroundColorInput"]').attributes('data-read-only')).toBe('false')

  await wrapper.get('[data-test-locator="documentWorkspacePage-textColorInput"]').trigger('click')
  await wrapper.get('[data-test-locator="documentWorkspacePage-backgroundColorInput"]').trigger('click')
  const pickers = wrapper.findAllComponents({ name: 'FaColorPickerInput' })
  await pickers[0]?.vm.$emit('update:modelValue', '#ddeeff')
  await pickers[1]?.vm.$emit('update:modelValue', '#112233')
  expect(onAppendToWorldPaletteMock).toHaveBeenCalledWith('#aabbcc')
  expect(onAppendToWorldPaletteMock).toHaveBeenCalledWith('#112233')

  wrapper.unmount()
})

test('Test that DocumentWorkspacePage hides color fields when no document tab is active', async () => {
  documentTabRef.value = null

  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        FaColorPickerInput: true,
        QInput: true
      }
    }
  })
  await flushPromises()

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-textColorInput"]').exists()).toBe(false)
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-backgroundColorInput"]').exists()).toBe(false)

  wrapper.unmount()
})
