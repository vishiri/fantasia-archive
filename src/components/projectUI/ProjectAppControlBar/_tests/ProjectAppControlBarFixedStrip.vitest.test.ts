/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, test, vi } from 'vitest'

import ProjectAppControlBarFixedStrip from '../ProjectAppControlBarFixedStrip.vue'

const onDeleteCurrentDocumentClick = vi.fn()
const onEnterEditModeClick = vi.fn()
const onSaveDocumentClick = vi.fn()

const qBtnStub = defineComponent({
  inheritAttrs: true,
  emits: ['click'],
  template: `
    <button type="button" class="q-btn-stub" v-bind="$attrs" @click="$emit('click', $event)">
      <slot />
    </button>
  `
})

const qTooltipStub = defineComponent({
  template: '<span class="q-tooltip-stub"><slot /></span>'
})

const deleteButtonStub = defineComponent({
  inheritAttrs: true,
  props: {
    showLeadingSeparator: {
      type: Boolean,
      required: true
    },
    tooltipLabel: {
      type: String,
      required: true
    }
  },
  emits: ['click'],
  template: `
    <button
      type="button"
      class="delete-button-stub"
      :data-test-leading-separator="String(showLeadingSeparator)"
      @click="$emit('click')"
    >
      {{ tooltipLabel }}
    </button>
  `
})

const baseProps = {
  addNewDocumentUnderThisTooltip: 'Add new document under this',
  advancedSearchGuideKeybindLabel: null,
  advancedSearchGuideTooltip: 'Advanced search guide',
  copyCurrentDocumentTooltip: 'Copy current document',
  deleteCurrentDocumentTooltip: 'Delete document',
  editDocumentKeybindLabel: 'Ctrl+E',
  editDocumentTooltip: 'Edit document',
  hideHierarchyTree: false,
  keyboardShortcutsKeybindLabel: null,
  keyboardShortcutsTooltip: 'Keyboard shortcuts',
  onAddNewDocumentUnderCurrentClick: vi.fn(),
  onAdvancedSearchGuideClick: vi.fn(),
  onCopyCurrentDocumentClick: vi.fn(),
  onDeleteCurrentDocumentClick,
  onEnterEditModeClick,
  onKeyboardShortcutsClick: vi.fn(),
  onQuickAddClick: vi.fn(),
  onQuickSearchClick: vi.fn(),
  onSaveDocumentClick,
  onTipsTricksTriviaClick: vi.fn(),
  onToggleAppNoteboardClick: vi.fn(),
  onToggleHierarchyTreeClick: vi.fn(),
  onToggleProjectNoteboardClick: vi.fn(),
  quickAddTooltip: 'Quick add',
  quickSearchTooltip: 'Quick search',
  saveDocumentButtonColor: 'primary-bright' as const,
  saveDocumentKeepEditModeKeybindLabel: 'Ctrl+Shift+S',
  saveDocumentKeepEditModeTooltip: 'Save and keep editing',
  saveDocumentKeybindLabel: 'Ctrl+S',
  saveDocumentTooltip: 'Save document',
  showContentButtons: true,
  showDeleteDocumentButton: false,
  showDocumentStructureButtons: false,
  showAppControlBar: true,
  showEditDocumentButton: false,
  showFunctionButtons: true,
  showGuideButtons: true,
  showSaveDocumentButtons: false,
  tipsTricksTriviaTooltip: 'Tips',
  toggleAppNoteboardKeybindLabel: null,
  toggleAppNoteboardTooltip: 'Toggle app noteboard',
  toggleHierarchyTreeKeybindLabel: null,
  toggleHierarchyTreeTooltip: 'Toggle tree',
  toggleProjectNoteboardKeybindLabel: null,
  toggleProjectNoteboardTooltip: 'Toggle project noteboard'
}

const mountGlobal = {
  stubs: {
    ProjectAppControlBarDeleteDocumentButton: deleteButtonStub,
    QBtn: qBtnStub,
    QTooltip: qTooltipStub
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

/**
 * ProjectAppControlBarFixedStrip
 * Teleports fixed action strip and flow spacer when app control bar is visible.
 */
test('Test that ProjectAppControlBarFixedStrip teleports action strip to body', async () => {
  const wrapper = mount(ProjectAppControlBarFixedStrip, {
    props: {
      ...baseProps,
      showEditDocumentButton: true
    },
    global: mountGlobal,
    attachTo: document.body
  })

  await flushPromises()

  expect(document.querySelector('[data-test-locator="projectAppControlBar"]')).not.toBeNull()
  expect(wrapper.find('.projectAppControlBar__flowSpacer').exists()).toBe(true)
  expect(document.querySelector('[data-test-locator="projectAppControlBar-editDocumentButton"]')).not.toBeNull()

  wrapper.unmount()
})

/**
 * ProjectAppControlBarFixedStrip
 * Wires edit, save, and delete actions from the fixed strip buttons.
 */
test('Test that ProjectAppControlBarFixedStrip wires edit save and delete actions', async () => {
  onDeleteCurrentDocumentClick.mockReset()
  onEnterEditModeClick.mockReset()
  onSaveDocumentClick.mockReset()
  vi.mocked(baseProps.onCopyCurrentDocumentClick).mockReset()
  vi.mocked(baseProps.onAddNewDocumentUnderCurrentClick).mockReset()

  const wrapper = mount(ProjectAppControlBarFixedStrip, {
    props: {
      ...baseProps,
      showDeleteDocumentButton: true,
      showDocumentStructureButtons: true,
      showEditDocumentButton: true,
      showSaveDocumentButtons: true
    },
    global: mountGlobal,
    attachTo: document.body
  })

  await flushPromises()

  const editButton = document.querySelector('[data-test-locator="projectAppControlBar-editDocumentButton"]') as HTMLElement
  editButton.click()
  expect(onEnterEditModeClick).toHaveBeenCalledTimes(1)

  const saveKeepEditButton = document.querySelector('[data-test-locator="projectAppControlBar-saveDocumentKeepEditModeButton"]') as HTMLElement
  saveKeepEditButton.click()
  expect(onSaveDocumentClick).toHaveBeenCalledWith(true)

  const saveButton = document.querySelector('[data-test-locator="projectAppControlBar-saveDocumentButton"]') as HTMLElement
  saveButton.click()
  expect(onSaveDocumentClick).toHaveBeenCalledWith(false)

  const copyButton = document.querySelector('[data-test-locator="projectAppControlBar-copyCurrentDocumentButton"]') as HTMLElement
  copyButton.click()
  expect(baseProps.onCopyCurrentDocumentClick).toHaveBeenCalledTimes(1)

  const addUnderButton = document.querySelector('[data-test-locator="projectAppControlBar-addNewDocumentUnderThisButton"]') as HTMLElement
  addUnderButton.click()
  expect(baseProps.onAddNewDocumentUnderCurrentClick).toHaveBeenCalledTimes(1)

  const deleteButton = document.querySelector('.delete-button-stub') as HTMLElement
  deleteButton.click()
  expect(onDeleteCurrentDocumentClick).toHaveBeenCalledTimes(1)
  expect(deleteButton.getAttribute('data-test-leading-separator')).toBe('true')

  wrapper.unmount()
})

/**
 * ProjectAppControlBarFixedStrip
 * Omits teleported strip and spacer when app control bar is hidden.
 */
test('Test that ProjectAppControlBarFixedStrip hides strip when control bar is off', async () => {
  const wrapper = mount(ProjectAppControlBarFixedStrip, {
    props: {
      ...baseProps,
      showAppControlBar: false,
      showEditDocumentButton: true
    },
    global: mountGlobal,
    attachTo: document.body
  })

  await flushPromises()

  expect(document.querySelector('[data-test-locator="projectAppControlBar"]')).toBeNull()
  expect(wrapper.find('.projectAppControlBar__flowSpacer').exists()).toBe(false)

  wrapper.unmount()
})

/**
 * ProjectAppControlBarFixedStrip
 * Renders save tooltips without keybind hints when labels are null.
 */
test('Test that ProjectAppControlBarFixedStrip omits keybind hints when labels are null', async () => {
  const wrapper = mount(ProjectAppControlBarFixedStrip, {
    props: {
      ...baseProps,
      editDocumentKeybindLabel: null,
      saveDocumentKeepEditModeKeybindLabel: null,
      saveDocumentKeybindLabel: null,
      showEditDocumentButton: true,
      showSaveDocumentButtons: true
    },
    global: mountGlobal,
    attachTo: document.body
  })

  await flushPromises()

  expect(document.querySelector('[data-test-locator="projectAppControlBar-editDocumentButton-keybind"]')).toBeNull()
  expect(document.querySelector('[data-test-locator="projectAppControlBar-saveDocumentKeepEditModeButton-keybind"]')).toBeNull()
  expect(document.querySelector('[data-test-locator="projectAppControlBar-saveDocumentButton-keybind"]')).toBeNull()

  wrapper.unmount()
})

/**
 * ProjectAppControlBarFixedStrip
 * Renders left guide buttons when guides are enabled and hides them when disabled.
 */
test('Test that ProjectAppControlBarFixedStrip toggles left guide buttons from showGuideButtons', async () => {
  const wrapperGuidesOn = mount(ProjectAppControlBarFixedStrip, {
    props: {
      ...baseProps,
      showGuideButtons: true
    },
    global: mountGlobal,
    attachTo: document.body
  })

  await flushPromises()

  expect(document.querySelector('[data-test-locator="projectAppControlBar-keyboardShortcutsButton"]')).not.toBeNull()
  expect(document.querySelector('[data-test-locator="projectAppControlBar-leftGuidesSeparator"]')).not.toBeNull()

  wrapperGuidesOn.unmount()
  document.body.innerHTML = ''

  const wrapperGuidesOff = mount(ProjectAppControlBarFixedStrip, {
    props: {
      ...baseProps,
      showGuideButtons: false
    },
    global: mountGlobal,
    attachTo: document.body
  })

  await flushPromises()

  expect(document.querySelector('[data-test-locator="projectAppControlBar-keyboardShortcutsButton"]')).toBeNull()
  expect(document.querySelector('[data-test-locator="projectAppControlBar-toggleHierarchyTreeButton"]')).not.toBeNull()

  wrapperGuidesOff.unmount()
})

/**
 * ProjectAppControlBarFixedStrip
 * Hides function and content left groups when their show flags are off.
 */
test('Test that ProjectAppControlBarFixedStrip hides function and content button groups', async () => {
  const wrapper = mount(ProjectAppControlBarFixedStrip, {
    props: {
      ...baseProps,
      showContentButtons: false,
      showFunctionButtons: false,
      showGuideButtons: true
    },
    global: mountGlobal,
    attachTo: document.body
  })

  await flushPromises()

  expect(document.querySelector('[data-test-locator="projectAppControlBar-keyboardShortcutsButton"]')).not.toBeNull()
  expect(document.querySelector('[data-test-locator="projectAppControlBar-toggleHierarchyTreeButton"]')).toBeNull()
  expect(document.querySelector('[data-test-locator="projectAppControlBar-quickSearchButton"]')).toBeNull()
  expect(document.querySelector('[data-test-locator="projectAppControlBar-leftGuidesSeparator"]')).toBeNull()

  wrapper.unmount()
})

/**
 * ProjectAppControlBarFixedStrip
 * Applies full-width modifier when hierarchy tree is hidden.
 */
test('Test that ProjectAppControlBarFixedStrip applies tree hidden modifier class', async () => {
  const wrapper = mount(ProjectAppControlBarFixedStrip, {
    props: {
      ...baseProps,
      hideHierarchyTree: true
    },
    global: mountGlobal,
    attachTo: document.body
  })

  await flushPromises()

  expect(document.querySelector('.projectAppControlBar--fixedStrip--treeHidden')).not.toBeNull()

  wrapper.unmount()
})
