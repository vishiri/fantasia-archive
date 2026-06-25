/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

import DialogProjectSettingsVerticalTabListFilterInput from '../DialogProjectSettingsVerticalTabListFilterInput.vue'

const inputStubs = {
  QBtn: defineComponent({
    inheritAttrs: true,
    template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>'
  }),
  QIcon: defineComponent({ template: '<span class="q-icon-stub" />' }),
  QInput: defineComponent({
    inheritAttrs: true,
    props: {
      modelValue: {
        default: '',
        type: String
      }
    },
    emits: ['update:modelValue'],
    template: `
      <div class="q-input-stub">
        <slot name="prepend" />
        <input
          class="q-input-stub-field"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
        <slot name="append" />
      </div>
    `
  })
}

test('Test that DialogProjectSettingsVerticalTabListFilterInput clears query from append control', async () => {
  const w = mount(DialogProjectSettingsVerticalTabListFilterInput, {
    props: {
      modelValue: 'hero'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: inputStubs
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplatesFilterInput"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplatesFilterClear"]').exists()).toBe(true)

  await w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplatesFilterClear"]').trigger('click')
  expect(w.emitted('update:modelValue')?.at(-1)).toEqual([''])
})

test('Test that DialogProjectSettingsVerticalTabListFilterInput hides clear control without query', () => {
  const w = mount(DialogProjectSettingsVerticalTabListFilterInput, {
    props: {
      modelValue: ''
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: inputStubs
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplatesFilterClear"]').exists()).toBe(false)
})

test('Test that DialogProjectSettingsVerticalTabListFilterInput applies stretch modifier when requested', () => {
  const w = mount(DialogProjectSettingsVerticalTabListFilterInput, {
    props: {
      modelValue: '',
      stretchToColumnEdge: true
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: inputStubs
    }
  })

  expect(w.find('.dialogProjectSettingsVerticalTabListFilterInput--stretchToColumnEdge').exists()).toBe(true)
})

test('Test that DialogProjectSettingsVerticalTabListFilterInput binds custom test locators', () => {
  const w = mount(DialogProjectSettingsVerticalTabListFilterInput, {
    props: {
      modelValue: 'query',
      testLocatorClear: 'dialogProjectSettings-worldsFilterClear',
      testLocatorInput: 'dialogProjectSettings-worldsFilterInput'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: inputStubs
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worldsFilterInput"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldsFilterClear"]').exists()).toBe(true)
})

/**
 * DialogProjectSettingsVerticalTabListFilterInput
 * Forwards typed query updates through v-model.
 */
test('Test that DialogProjectSettingsVerticalTabListFilterInput forwards typed filter query', async () => {
  const w = mount(DialogProjectSettingsVerticalTabListFilterInput, {
    props: {
      modelValue: ''
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: inputStubs
    }
  })

  await w.find('.q-input-stub-field').setValue('dragon')
  expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['dragon'])
})
