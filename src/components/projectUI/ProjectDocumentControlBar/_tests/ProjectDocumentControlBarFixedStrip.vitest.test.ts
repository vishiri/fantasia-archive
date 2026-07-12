/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, test, vi } from 'vitest'

import ProjectDocumentControlBarFixedStrip from '../ProjectDocumentControlBarFixedStrip.vue'

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
  deleteCurrentDocumentTooltip: 'Delete document',
  editDocumentKeybindLabel: 'Ctrl+E',
  editDocumentTooltip: 'Edit document',
  onDeleteCurrentDocumentClick,
  onEnterEditModeClick,
  onSaveDocumentClick,
  saveDocumentButtonColor: 'primary-bright' as const,
  saveDocumentKeepEditModeKeybindLabel: 'Ctrl+Shift+S',
  saveDocumentKeepEditModeTooltip: 'Save and keep editing',
  saveDocumentKeybindLabel: 'Ctrl+S',
  saveDocumentTooltip: 'Save document',
  showDeleteDocumentButton: false,
  showDocumentControlBar: true,
  showEditDocumentButton: false,
  showSaveDocumentButtons: false
}

const mountGlobal = {
  stubs: {
    ProjectDocumentControlBarDeleteDocumentButton: deleteButtonStub,
    QBtn: qBtnStub,
    QTooltip: qTooltipStub
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

/**
 * ProjectDocumentControlBarFixedStrip
 * Teleports fixed action strip and flow spacer when document control bar is visible.
 */
test('Test that ProjectDocumentControlBarFixedStrip teleports action strip to body', async () => {
  const wrapper = mount(ProjectDocumentControlBarFixedStrip, {
    props: {
      ...baseProps,
      showEditDocumentButton: true
    },
    global: mountGlobal,
    attachTo: document.body
  })

  await flushPromises()

  expect(document.querySelector('[data-test-locator="projectDocumentControlBar"]')).not.toBeNull()
  expect(wrapper.find('.projectDocumentControlBar__flowSpacer').exists()).toBe(true)
  expect(document.querySelector('[data-test-locator="projectDocumentControlBar-editDocumentButton"]')).not.toBeNull()

  wrapper.unmount()
})

/**
 * ProjectDocumentControlBarFixedStrip
 * Wires edit, save, and delete actions from the fixed strip buttons.
 */
test('Test that ProjectDocumentControlBarFixedStrip wires edit save and delete actions', async () => {
  onDeleteCurrentDocumentClick.mockReset()
  onEnterEditModeClick.mockReset()
  onSaveDocumentClick.mockReset()

  const wrapper = mount(ProjectDocumentControlBarFixedStrip, {
    props: {
      ...baseProps,
      showDeleteDocumentButton: true,
      showEditDocumentButton: true,
      showSaveDocumentButtons: true
    },
    global: mountGlobal,
    attachTo: document.body
  })

  await flushPromises()

  const editButton = document.querySelector('[data-test-locator="projectDocumentControlBar-editDocumentButton"]') as HTMLElement
  editButton.click()
  expect(onEnterEditModeClick).toHaveBeenCalledTimes(1)

  const saveKeepEditButton = document.querySelector('[data-test-locator="projectDocumentControlBar-saveDocumentKeepEditModeButton"]') as HTMLElement
  saveKeepEditButton.click()
  expect(onSaveDocumentClick).toHaveBeenCalledWith(true)

  const saveButton = document.querySelector('[data-test-locator="projectDocumentControlBar-saveDocumentButton"]') as HTMLElement
  saveButton.click()
  expect(onSaveDocumentClick).toHaveBeenCalledWith(false)

  const deleteButton = document.querySelector('.delete-button-stub') as HTMLElement
  deleteButton.click()
  expect(onDeleteCurrentDocumentClick).toHaveBeenCalledTimes(1)
  expect(deleteButton.getAttribute('data-test-leading-separator')).toBe('true')

  wrapper.unmount()
})

/**
 * ProjectDocumentControlBarFixedStrip
 * Omits teleported strip and spacer when document control bar is hidden.
 */
test('Test that ProjectDocumentControlBarFixedStrip hides strip when control bar is off', async () => {
  const wrapper = mount(ProjectDocumentControlBarFixedStrip, {
    props: {
      ...baseProps,
      showDocumentControlBar: false,
      showEditDocumentButton: true
    },
    global: mountGlobal,
    attachTo: document.body
  })

  await flushPromises()

  expect(document.querySelector('[data-test-locator="projectDocumentControlBar"]')).toBeNull()
  expect(wrapper.find('.projectDocumentControlBar__flowSpacer').exists()).toBe(false)

  wrapper.unmount()
})

/**
 * ProjectDocumentControlBarFixedStrip
 * Renders save tooltips without keybind hints when labels are null.
 */
test('Test that ProjectDocumentControlBarFixedStrip omits keybind hints when labels are null', async () => {
  const wrapper = mount(ProjectDocumentControlBarFixedStrip, {
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

  expect(document.querySelector('[data-test-locator="projectDocumentControlBar-editDocumentButton-keybind"]')).toBeNull()
  expect(document.querySelector('[data-test-locator="projectDocumentControlBar-saveDocumentKeepEditModeButton-keybind"]')).toBeNull()
  expect(document.querySelector('[data-test-locator="projectDocumentControlBar-saveDocumentButton-keybind"]')).toBeNull()

  wrapper.unmount()
})
