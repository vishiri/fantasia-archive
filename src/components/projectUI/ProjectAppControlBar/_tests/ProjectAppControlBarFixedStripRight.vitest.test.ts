/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import ProjectAppControlBarFixedStripRight from '../ProjectAppControlBarFixedStripRight.vue'

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
      data-test-locator="projectAppControlBar-deleteDocumentButton"
      :data-test-leading-separator="String(showLeadingSeparator)"
      @click="$emit('click')"
    >
      {{ tooltipLabel }}
    </button>
  `
})

const baseProps = {
  addNewDocumentUnderThisTooltip: 'Add new document under this',
  copyCurrentDocumentTooltip: 'Copy current document',
  deleteCurrentDocumentTooltip: 'Delete document',
  editDocumentKeybindLabel: 'Ctrl+E' as string | null,
  editDocumentTooltip: 'Edit document',
  onAddNewDocumentUnderCurrentClick: vi.fn(),
  onCopyCurrentDocumentClick: vi.fn(),
  onDeleteCurrentDocumentClick: vi.fn(),
  onEnterEditModeClick: vi.fn(),
  onSaveDocumentClick: vi.fn(),
  saveDocumentButtonColor: 'primary-bright' as const,
  saveDocumentKeepEditModeKeybindLabel: 'Ctrl+Shift+S' as string | null,
  saveDocumentKeepEditModeTooltip: 'Save and keep editing',
  saveDocumentKeybindLabel: 'Ctrl+S' as string | null,
  saveDocumentTooltip: 'Save document',
  showDeleteDocumentButton: true,
  showDocumentStructureButtons: true,
  showEditDocumentButton: true,
  showSaveDocumentButtons: true
}

const mountGlobal = {
  stubs: {
    ProjectAppControlBarDeleteDocumentButton: deleteButtonStub,
    QBtn: qBtnStub,
    QTooltip: qTooltipStub
  }
}

/**
 * ProjectAppControlBarFixedStripRight
 * Renders edit, save, structure, and delete actions when show flags are on.
 */
test('Test that ProjectAppControlBarFixedStripRight renders visible document actions', () => {
  const wrapper = mount(ProjectAppControlBarFixedStripRight, {
    props: baseProps,
    global: mountGlobal
  })

  expect(wrapper.find('[data-test-locator="projectAppControlBar-editDocumentButton"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-saveDocumentButton"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-copyCurrentDocumentButton"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-deleteDocumentButton"]').exists()).toBe(true)

  wrapper.unmount()
})

/**
 * ProjectAppControlBarFixedStripRight
 * Wires edit, save, copy, add-under, and delete handlers from right strip buttons.
 */
test('Test that ProjectAppControlBarFixedStripRight wires right strip button clicks', async () => {
  vi.mocked(baseProps.onEnterEditModeClick).mockReset()
  vi.mocked(baseProps.onSaveDocumentClick).mockReset()
  vi.mocked(baseProps.onCopyCurrentDocumentClick).mockReset()
  vi.mocked(baseProps.onAddNewDocumentUnderCurrentClick).mockReset()
  vi.mocked(baseProps.onDeleteCurrentDocumentClick).mockReset()

  const wrapper = mount(ProjectAppControlBarFixedStripRight, {
    props: baseProps,
    global: mountGlobal
  })

  await wrapper.get('[data-test-locator="projectAppControlBar-editDocumentButton"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-saveDocumentKeepEditModeButton"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-saveDocumentButton"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-copyCurrentDocumentButton"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-addNewDocumentUnderThisButton"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-deleteDocumentButton"]').trigger('click')

  expect(baseProps.onEnterEditModeClick).toHaveBeenCalledTimes(1)
  expect(baseProps.onSaveDocumentClick).toHaveBeenCalledWith(true)
  expect(baseProps.onSaveDocumentClick).toHaveBeenCalledWith(false)
  expect(baseProps.onCopyCurrentDocumentClick).toHaveBeenCalledTimes(1)
  expect(baseProps.onAddNewDocumentUnderCurrentClick).toHaveBeenCalledTimes(1)
  expect(baseProps.onDeleteCurrentDocumentClick).toHaveBeenCalledTimes(1)

  wrapper.unmount()
})

/**
 * ProjectAppControlBarFixedStripRight
 * Hides edit and save buttons when their show flags are off.
 */
test('Test that ProjectAppControlBarFixedStripRight hides edit and save when flags are off', () => {
  const wrapper = mount(ProjectAppControlBarFixedStripRight, {
    props: {
      ...baseProps,
      showDeleteDocumentButton: false,
      showDocumentStructureButtons: false,
      showEditDocumentButton: false,
      showSaveDocumentButtons: false
    },
    global: mountGlobal
  })

  expect(wrapper.find('[data-test-locator="projectAppControlBar-editDocumentButton"]').exists()).toBe(false)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-saveDocumentButton"]').exists()).toBe(false)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-copyCurrentDocumentButton"]').exists()).toBe(false)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-deleteDocumentButton"]').exists()).toBe(false)

  wrapper.unmount()
})
