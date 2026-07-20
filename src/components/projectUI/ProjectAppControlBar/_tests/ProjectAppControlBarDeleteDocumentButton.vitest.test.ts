/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import ProjectAppControlBarDeleteDocumentButton from '../ProjectAppControlBarDeleteDocumentButton.vue'

const qBtnStub = defineComponent({
  inheritAttrs: true,
  emits: ['click'],
  template: `
    <button type="button" class="q-btn-stub" v-bind="$attrs" @click="$emit('click', $event)">
      <slot />
    </button>
  `
})

const qSeparatorStub = defineComponent({
  inheritAttrs: true,
  template: '<hr class="q-separator-stub" v-bind="$attrs" />'
})

const qTooltipStub = defineComponent({
  template: '<span class="q-tooltip-stub"><slot /></span>'
})

const mountGlobal = {
  stubs: {
    QBtn: qBtnStub,
    QSeparator: qSeparatorStub,
    QTooltip: qTooltipStub
  }
}

/**
 * ProjectAppControlBarDeleteDocumentButton
 * Renders delete action button and optional leading separator.
 */
test('Test that ProjectAppControlBarDeleteDocumentButton renders separator when enabled', () => {
  const wrapper = mount(ProjectAppControlBarDeleteDocumentButton, {
    props: {
      showLeadingSeparator: true,
      tooltipLabel: 'Delete document'
    },
    global: mountGlobal
  })

  expect(wrapper.find('[data-test-locator="projectAppControlBar-deleteActionSeparator"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-deleteDocumentButton"]').exists()).toBe(true)
  expect(wrapper.find('.q-tooltip-stub').text()).toBe('Delete document')

  wrapper.unmount()
})

/**
 * ProjectAppControlBarDeleteDocumentButton
 * Omits leading separator when showLeadingSeparator is false.
 */
test('Test that ProjectAppControlBarDeleteDocumentButton hides separator when disabled', () => {
  const wrapper = mount(ProjectAppControlBarDeleteDocumentButton, {
    props: {
      showLeadingSeparator: false,
      tooltipLabel: 'Delete document'
    },
    global: mountGlobal
  })

  expect(wrapper.find('[data-test-locator="projectAppControlBar-deleteActionSeparator"]').exists()).toBe(false)

  wrapper.unmount()
})

/**
 * ProjectAppControlBarDeleteDocumentButton
 * Emits click when delete button is pressed.
 */
test('Test that ProjectAppControlBarDeleteDocumentButton emits click from delete button', async () => {
  const wrapper = mount(ProjectAppControlBarDeleteDocumentButton, {
    props: {
      showLeadingSeparator: false,
      tooltipLabel: 'Delete document'
    },
    global: mountGlobal
  })

  await wrapper.find('[data-test-locator="projectAppControlBar-deleteDocumentButton"]').trigger('click')

  expect(wrapper.emitted('click')).toHaveLength(1)

  wrapper.unmount()
})
