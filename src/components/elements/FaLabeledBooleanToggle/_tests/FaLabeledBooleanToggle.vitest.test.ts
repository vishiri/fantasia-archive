/** @vitest-environment jsdom */
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import FaLabeledBooleanToggle from '../FaLabeledBooleanToggle.vue'

const qToggleStub = defineComponent({
  name: 'QToggle',
  props: {
    disable: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  template: `
    <button
      type="button"
      :data-disabled="disable"
      :data-test-locator="$attrs['data-test-locator']"
      @click="$emit('update:modelValue', !modelValue)"
    />
  `
})

function mountFaLabeledBooleanToggle (props: {
  disabled?: boolean
  modelValue?: boolean
} = {}) {
  return mount(FaLabeledBooleanToggle, {
    global: {
      stubs: {
        QIcon: true,
        QTooltip: true,
        QToggle: qToggleStub
      }
    },
    props: {
      description: 'Category description',
      disabled: props.disabled ?? false,
      modelValue: props.modelValue ?? false,
      testLocator: 'faLabeledBooleanToggle-test',
      title: 'Is a category'
    }
  })
}

test('Test that FaLabeledBooleanToggle emits update:modelValue when enabled', async () => {
  const wrapper = mountFaLabeledBooleanToggle()

  await wrapper.get('[data-test-locator="faLabeledBooleanToggle-test-toggle"]').trigger('click')

  expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
})

test('Test that FaLabeledBooleanToggle ignores toggle updates when disabled', async () => {
  const wrapper = mountFaLabeledBooleanToggle({ disabled: true })

  await wrapper.get('[data-test-locator="faLabeledBooleanToggle-test-toggle"]').trigger('click')

  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
})
