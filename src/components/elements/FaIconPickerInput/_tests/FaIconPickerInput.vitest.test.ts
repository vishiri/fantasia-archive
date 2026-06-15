/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import FaIconPickerInput from '../FaIconPickerInput.vue'

vi.mock('app/src/scripts/faIcons/faIconPickerMergedCatalogLoadWiring', () => ({
  loadFaIconPickerMergedCatalogAsync: vi.fn(async () => [
    'mdi-account',
    'mdi-home'
  ])
}))

const testLocator = 'faIconPickerInput-test'

const qMenuStub = defineComponent({
  name: 'QMenu',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'before-show',
    'hide',
    'update:modelValue'
  ],
  watch: {
    modelValue (value: boolean): void {
      if (value) {
        this.$emit('before-show')
      }
    }
  },
  template: '<div v-if="modelValue" class="q-menu-stub"><slot /></div>'
})

const qBtnStub = defineComponent({
  inheritAttrs: true,
  emits: ['click'],
  template: `
    <button
      type="button"
      class="q-btn-stub"
      v-bind="$attrs"
      @click="$emit('click')"
    />
  `
})

const qInputStub = defineComponent({
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  template: `
    <input
      class="q-input-stub"
      :value="modelValue"
      v-bind="$attrs"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  `
})

const qVirtualScrollStub = defineComponent({
  template: `
    <div class="q-virtual-scroll-stub">
      <slot
        :index="0"
        :item="['mdi-account', 'mdi-home']"
      />
    </div>
  `
})

function mountFaIconPickerInput (modelValue: string): ReturnType<typeof mount> {
  return mount(FaIconPickerInput, {
    props: {
      modelValue,
      testLocator
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        QBtn: qBtnStub,
        QIcon: true,
        QInnerLoading: true,
        QInput: qInputStub,
        QMenu: qMenuStub,
        QSpinner: true,
        QTooltip: true,
        QVirtualScroll: qVirtualScrollStub
      }
    }
  })
}

/**
 * FaIconPickerInput
 * Renders the icon picker trigger for the current value.
 */
test('Test that FaIconPickerInput renders the trigger with the selected icon hook', () => {
  const w = mountFaIconPickerInput('mdi-account')

  const trigger = w.find('[data-test-locator="faIconPickerInput-test-trigger"]')
  expect(trigger.exists()).toBe(true)
  expect(trigger.attributes('data-test-icon-name')).toBe('mdi-account')
})

/**
 * FaIconPickerInput
 * Opens the picker menu from the trigger and emits a selected icon.
 */
test('Test that FaIconPickerInput opens the menu and emits the selected icon', async () => {
  const w = mountFaIconPickerInput('')

  await w.find('[data-test-locator="faIconPickerInput-test-trigger"]').trigger('click')
  expect(w.find('.q-menu-stub').exists()).toBe(true)

  await w.find('[data-test-icon-name="mdi-home"]').trigger('click')
  expect(w.emitted('update:modelValue')?.slice(-1)[0]).toEqual(['mdi-home'])
})

/**
 * FaIconPickerInput
 * Omits the selected-icon hook when no icon is chosen.
 */
test('Test that FaIconPickerInput omits the selected-icon hook when unset', () => {
  const w = mountFaIconPickerInput('')

  expect(
    w.find('[data-test-locator="faIconPickerInput-test-trigger"]').attributes('data-test-icon-name')
  ).toBeUndefined()
})
