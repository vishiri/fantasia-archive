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
    isCategoryDraft: false,
    savedIsCategory: false,
    isFinishedDraft: false,
    isMinorDraft: false,
    isDeadDraft: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    parentDocumentIdDraft: '',
    savedParentDocumentId: '',
    treeOrderNumberDraft: '',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
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
const textColorFieldDescriptionRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Text color help')
})
const backgroundColorFieldDescriptionRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Background color help')
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
const isCategoryModelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(false)
})
const isCategoryToggleReadOnlyRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(true)
})
const isCategoryTitleRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Is a category')
})
const isCategoryDescriptionRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Category description')
})
const isFinishedModelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(false)
})
const isFinishedToggleReadOnlyRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(true)
})
const isFinishedTitleRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Is finished')
})
const isFinishedDescriptionRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Finished description')
})
const isMinorModelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(false)
})
const isMinorToggleReadOnlyRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(true)
})
const isMinorTitleRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Is a minor document')
})
const isMinorDescriptionRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Minor description')
})
const isDeadModelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(false)
})
const isDeadToggleReadOnlyRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(true)
})
const isDeadTitleRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Is Dead/Gone/Destroyed')
})
const isDeadDescriptionRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Dead description')
})
const belongsUnderModelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('parent-1')
})
const belongsUnderFieldReadOnlyRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(true)
})
const belongsUnderFieldLabelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Belongs under')
})
const belongsUnderFieldDescriptionRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Belongs under help')
})
const oneWayRelationshipTooltipRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('One-way help')
})
const orderNumberModelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('')
})
const orderNumberFieldReadOnlyRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref(true)
})
const orderNumberFieldLabelRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Order number')
})
const orderNumberFieldDescriptionRef = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return ref('Order number help')
})
const onAppendToWorldPaletteMock = vi.hoisted(() => vi.fn())

vi.mock('../scripts/documentWorkspacePage_manager', () => {
  return {
    useDocumentWorkspacePage: () => {
      return {
        backgroundColorFieldDescription: backgroundColorFieldDescriptionRef,
        backgroundColorFieldLabel: backgroundColorFieldLabelRef,
        backgroundColorModel: backgroundColorModelRef,
        belongsUnderFieldDescription: belongsUnderFieldDescriptionRef,
        belongsUnderFieldLabel: belongsUnderFieldLabelRef,
        belongsUnderFieldReadOnly: belongsUnderFieldReadOnlyRef,
        belongsUnderModel: belongsUnderModelRef,
        displayNameModel: displayNameModelRef,
        documentColorPickersReadOnly: documentColorPickersReadOnlyRef,
        documentShowsEditFields: documentShowsEditFieldsRef,
        documentShowsPreview: documentShowsPreviewRef,
        documentTab: documentTabRef,
        isCategoryDescription: isCategoryDescriptionRef,
        isCategoryModel: isCategoryModelRef,
        isCategoryTitle: isCategoryTitleRef,
        isCategoryToggleReadOnly: isCategoryToggleReadOnlyRef,
        isDeadDescription: isDeadDescriptionRef,
        isDeadModel: isDeadModelRef,
        isDeadTitle: isDeadTitleRef,
        isDeadToggleReadOnly: isDeadToggleReadOnlyRef,
        isFinishedDescription: isFinishedDescriptionRef,
        isFinishedModel: isFinishedModelRef,
        isFinishedTitle: isFinishedTitleRef,
        isFinishedToggleReadOnly: isFinishedToggleReadOnlyRef,
        isMinorDescription: isMinorDescriptionRef,
        isMinorModel: isMinorModelRef,
        isMinorTitle: isMinorTitleRef,
        isMinorToggleReadOnly: isMinorToggleReadOnlyRef,
        nameFieldLabel: nameFieldLabelRef,
        oneWayRelationshipTooltip: oneWayRelationshipTooltipRef,
        onAppendToWorldPalette: onAppendToWorldPaletteMock,
        orderNumberFieldDescription: orderNumberFieldDescriptionRef,
        orderNumberFieldLabel: orderNumberFieldLabelRef,
        orderNumberFieldReadOnly: orderNumberFieldReadOnlyRef,
        orderNumberModel: orderNumberModelRef,
        previewDisplayName: previewDisplayNameRef,
        textColorFieldDescription: textColorFieldDescriptionRef,
        textColorFieldLabel: textColorFieldLabelRef,
        textColorModel: textColorModelRef,
        worldColorPaletteAppend: worldColorPaletteAppendRef,
        worldPickerPalette: worldPickerPaletteRef
      }
    }
  }
})

import DocumentWorkspacePage from '../DocumentWorkspacePage.vue'
import FaLabeledBooleanToggle from 'app/src/components/elements/FaLabeledBooleanToggle/FaLabeledBooleanToggle.vue'

beforeEach(() => {
  displayNameModelRef.value = 'Hero'
  documentShowsEditFieldsRef.value = false
  documentShowsPreviewRef.value = true
  documentColorPickersReadOnlyRef.value = true
  isCategoryModelRef.value = false
  isCategoryToggleReadOnlyRef.value = true
  isFinishedModelRef.value = false
  isFinishedToggleReadOnlyRef.value = true
  isMinorModelRef.value = false
  isMinorToggleReadOnlyRef.value = true
  isDeadModelRef.value = false
  isDeadToggleReadOnlyRef.value = true
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
    isCategoryDraft: false,
    savedIsCategory: false,
    isFinishedDraft: false,
    isMinorDraft: false,
    isDeadDraft: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    parentDocumentIdDraft: '',
    savedParentDocumentId: '',
    treeOrderNumberDraft: '',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
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
        FaLabeledBooleanToggle: {
          name: 'FaLabeledBooleanToggle',
          props: ['modelValue', 'disabled', 'testLocator'],
          emits: ['update:modelValue'],
          template: '<div :data-test-locator="testLocator" :data-disabled="disabled" />'
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
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isCategoryToggle"]').attributes('data-disabled')).toBe('true')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isFinishedToggle"]').attributes('data-disabled')).toBe('true')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isMinorToggle"]').attributes('data-disabled')).toBe('true')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isDeadToggle"]').attributes('data-disabled')).toBe('true')

  wrapper.unmount()
})

test('Test that DocumentWorkspacePage renders name input when edit fields are shown', async () => {
  documentShowsPreviewRef.value = false
  documentShowsEditFieldsRef.value = true
  isCategoryToggleReadOnlyRef.value = false

  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        FaColorPickerInput: {
          name: 'FaColorPickerInput',
          props: ['modelValue', 'readOnly', 'testLocator'],
          emits: ['update:modelValue', 'append-to-world-palette'],
          template: '<div :data-test-locator="testLocator" :data-read-only="readOnly" />'
        },
        FaLabeledBooleanToggle: {
          name: 'FaLabeledBooleanToggle',
          props: ['modelValue', 'disabled', 'testLocator'],
          emits: ['update:modelValue'],
          template: '<div :data-test-locator="testLocator" :data-disabled="disabled" />'
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
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isCategoryToggle"]').attributes('data-disabled')).toBe('false')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isFinishedToggle"]').attributes('data-disabled')).toBe('true')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isMinorToggle"]').attributes('data-disabled')).toBe('true')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isDeadToggle"]').attributes('data-disabled')).toBe('true')

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
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-textColorHelpIcon"]').attributes('data-test-tooltip-text')).toBe('Text color help')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-backgroundColorLabel"]').text()).toBe('Document background color')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-backgroundColorHelpIcon"]').attributes('data-test-tooltip-text')).toBe('Background color help')
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

test('Test that DocumentWorkspacePage renders belongs under field chrome and readonly input in preview mode', async () => {
  documentShowsEditFieldsRef.value = false
  documentShowsPreviewRef.value = true
  belongsUnderFieldReadOnlyRef.value = true

  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        FaColorPickerInput: true,
        FaLabeledBooleanToggle: true,
        QInput: {
          props: ['modelValue', 'readonly', 'disable'],
          template: '<input :data-test-locator="$attrs[\'data-test-locator\']" :data-readonly="readonly" :data-disabled="disable" :value="modelValue" />'
        },
        QIcon: {
          props: ['name'],
          template: '<span :data-test-locator="$attrs[\'data-test-locator\']" :data-icon-name="name" :data-test-tooltip-text="$attrs[\'data-test-tooltip-text\']" />'
        },
        QTooltip: true
      }
    }
  })
  await flushPromises()

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-belongsUnderLabel"]').text()).toBe('Belongs under')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-belongsUnderHelpIcon"]').attributes('data-test-tooltip-text')).toBe('Belongs under help')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-belongsUnderOneWayIcon"]').attributes('data-icon-name')).toBe('mdi-arrow-right-bold')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-belongsUnderInput"]').attributes('data-readonly')).toBe('true')

  wrapper.unmount()
})

test('Test that DocumentWorkspacePage renders editable belongs under input in edit mode', async () => {
  documentShowsPreviewRef.value = false
  documentShowsEditFieldsRef.value = true
  belongsUnderFieldReadOnlyRef.value = false
  belongsUnderModelRef.value = 'parent-1'

  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        FaColorPickerInput: true,
        FaLabeledBooleanToggle: true,
        QInput: {
          props: ['modelValue', 'readonly', 'disable'],
          emits: ['update:modelValue'],
          template: '<input :data-test-locator="$attrs[\'data-test-locator\']" :data-readonly="readonly" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
        },
        QIcon: true,
        QTooltip: true
      }
    }
  })
  await flushPromises()

  const input = wrapper.find('[data-test-locator="documentWorkspacePage-belongsUnderInput"]')
  expect(input.attributes('data-readonly')).toBe('false')
  await input.setValue('parent-2')
  expect(belongsUnderModelRef.value).toBe('parent-2')

  wrapper.unmount()
})

test('Test that DocumentWorkspacePage renders order number field readonly in preview mode', async () => {
  documentShowsEditFieldsRef.value = false
  documentShowsPreviewRef.value = true
  orderNumberFieldReadOnlyRef.value = true
  orderNumberModelRef.value = '12'

  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        FaColorPickerInput: true,
        FaLabeledBooleanToggle: true,
        QInput: {
          props: ['modelValue', 'readonly', 'disable', 'type'],
          template: '<input :data-test-locator="$attrs[\'data-test-locator\']" :data-readonly="readonly" :data-type="type" :value="modelValue" />'
        },
        QIcon: {
          props: ['name'],
          template: '<span :data-test-locator="$attrs[\'data-test-locator\']" :data-icon-name="name" :data-test-tooltip-text="$attrs[\'data-test-tooltip-text\']" />'
        },
        QTooltip: true
      }
    }
  })
  await flushPromises()

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-orderNumberLabel"]').text()).toBe('Order number')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-orderNumberTitleIcon"]').attributes('data-icon-name')).toBe('mdi-file-tree')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-orderNumberInput"]').attributes('data-readonly')).toBe('true')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-orderNumberInput"]').attributes('data-type')).toBe('number')

  wrapper.unmount()
})

test('Test that DocumentWorkspacePage renders editable order number input in edit mode', async () => {
  documentShowsPreviewRef.value = false
  documentShowsEditFieldsRef.value = true
  orderNumberFieldReadOnlyRef.value = false
  orderNumberModelRef.value = '3'

  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        FaColorPickerInput: true,
        FaLabeledBooleanToggle: true,
        QInput: {
          props: ['modelValue', 'readonly', 'disable', 'type'],
          emits: ['update:modelValue'],
          template: '<input :data-test-locator="$attrs[\'data-test-locator\']" :data-readonly="readonly" :data-type="type" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
        },
        QIcon: true,
        QTooltip: true
      }
    }
  })
  await flushPromises()

  const input = wrapper.find('[data-test-locator="documentWorkspacePage-orderNumberInput"]')
  expect(input.attributes('data-readonly')).toBe('false')
  await input.setValue('9')
  expect(orderNumberModelRef.value).toBe('9')

  wrapper.unmount()
})

test('Test that DocumentWorkspacePage renders disabled category toggle in preview mode', async () => {
  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        FaColorPickerInput: true,
        FaLabeledBooleanToggle: false,
        QInput: true,
        QToggle: {
          props: ['disable', 'modelValue'],
          emits: ['update:modelValue'],
          template: '<button type="button" :data-disabled="disable" @click="$emit(\'update:modelValue\', !modelValue)" />'
        },
        QIcon: true,
        QTooltip: true
      }
    }
  })
  await flushPromises()

  const toggle = wrapper.findComponent(FaLabeledBooleanToggle)
  expect(toggle.exists()).toBe(true)
  expect(toggle.props('disabled')).toBe(true)
  await toggle.get('button').trigger('click')
  expect(isCategoryModelRef.value).toBe(false)

  wrapper.unmount()
})

test('Test that DocumentWorkspacePage renders editable category toggle in edit mode', async () => {
  documentShowsPreviewRef.value = false
  documentShowsEditFieldsRef.value = true
  isCategoryToggleReadOnlyRef.value = false

  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        FaColorPickerInput: true,
        FaLabeledBooleanToggle: false,
        QInput: true,
        QToggle: {
          props: ['disable', 'modelValue'],
          emits: ['update:modelValue'],
          template: '<button type="button" :data-disabled="disable" @click="$emit(\'update:modelValue\', true)" />'
        },
        QIcon: true,
        QTooltip: true
      }
    }
  })
  await flushPromises()

  const toggle = wrapper.findComponent(FaLabeledBooleanToggle)
  expect(toggle.props('disabled')).toBe(false)
  await toggle.get('button').trigger('click')
  expect(isCategoryModelRef.value).toBe(true)

  wrapper.unmount()
})

test('Test that DocumentWorkspacePage renders editable status flag toggles in edit mode', async () => {
  documentShowsPreviewRef.value = false
  documentShowsEditFieldsRef.value = true
  isCategoryToggleReadOnlyRef.value = false
  isFinishedToggleReadOnlyRef.value = false
  isMinorToggleReadOnlyRef.value = false
  isDeadToggleReadOnlyRef.value = false

  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        FaColorPickerInput: true,
        FaLabeledBooleanToggle: {
          name: 'FaLabeledBooleanToggle',
          props: ['modelValue', 'disabled', 'testLocator', 'icon'],
          emits: ['update:modelValue'],
          template: '<button type="button" :data-test-locator="testLocator" :data-disabled="disabled" :data-icon="icon" @click="$emit(\'update:modelValue\', true)" />'
        },
        QInput: true
      }
    }
  })
  await flushPromises()

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isFinishedToggle"]').attributes('data-disabled')).toBe('false')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isFinishedToggle"]').attributes('data-icon')).toBe('mdi-check-bold')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isMinorToggle"]').attributes('data-icon')).toBe('mdi-magnify-minus-outline')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isDeadToggle"]').attributes('data-icon')).toBe('mdi-skull-crossbones')

  await wrapper.get('[data-test-locator="documentWorkspacePage-isFinishedToggle"]').trigger('click')
  await wrapper.get('[data-test-locator="documentWorkspacePage-isMinorToggle"]').trigger('click')
  await wrapper.get('[data-test-locator="documentWorkspacePage-isDeadToggle"]').trigger('click')
  expect(isFinishedModelRef.value).toBe(true)
  expect(isMinorModelRef.value).toBe(true)
  expect(isDeadModelRef.value).toBe(true)

  wrapper.unmount()
})

test('Test that DocumentWorkspacePage hides color fields when no document tab is active', async () => {
  documentTabRef.value = null

  const wrapper = mount(DocumentWorkspacePage, {
    global: {
      stubs: {
        FaColorPickerInput: true,
        FaLabeledBooleanToggle: true,
        QInput: true
      }
    }
  })
  await flushPromises()

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-textColorInput"]').exists()).toBe(false)
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-backgroundColorInput"]').exists()).toBe(false)
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isCategoryToggle"]').exists()).toBe(false)
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isFinishedToggle"]').exists()).toBe(false)
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isMinorToggle"]').exists()).toBe(false)
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-isDeadToggle"]').exists()).toBe(false)

  wrapper.unmount()
})
