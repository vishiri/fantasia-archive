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
    'show',
    'update:modelValue'
  ],
  watch: {
    modelValue (value: boolean): void {
      if (value) {
        this.$emit('before-show')
        this.$emit('show')
      }
    }
  },
  template: `
    <div
      v-if="modelValue"
      class="q-menu-stub"
      @click="$emit('update:modelValue', false)"
    >
      <slot />
    </div>
  `
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
    >
      <slot />
    </button>
  `
})

const qTooltipStub = defineComponent({
  template: '<span class="q-tooltip-stub"><slot /></span>'
})

const focusSearchInputSpy = vi.fn()

const qInputStub = defineComponent({
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'focus'],
  methods: {
    focus (): void {
      focusSearchInputSpy()
      this.$emit('focus')
    }
  },
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
        QTooltip: qTooltipStub,
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

/**
 * FaIconPickerInput
 * Renders trigger tooltip copy for click and current icon name.
 */
test('Test that FaIconPickerInput renders trigger tooltip copy', () => {
  const w = mountFaIconPickerInput('mdi-account')

  expect(w.find('.q-tooltip-stub').text()).toContain('faIconPickerInput.triggerTooltipClick')
  expect(w.find('.q-tooltip-stub').text()).toContain('faIconPickerInput.triggerTooltipCurrentIcon')
})

/**
 * FaIconPickerInput
 * Focuses the menu search input after the picker menu is shown.
 */
test('Test that FaIconPickerInput focuses the menu search input after show', async () => {
  focusSearchInputSpy.mockClear()
  const w = mountFaIconPickerInput('')

  await w.find('[data-test-locator="faIconPickerInput-test-trigger"]').trigger('click')
  await w.vm.$nextTick()
  await w.vm.$nextTick()

  expect(focusSearchInputSpy).toHaveBeenCalled()
})

/**
 * FaIconPickerInput
 * Closes the picker menu when the menu v-model updates to false.
 */
test('Test that FaIconPickerInput closes the picker menu from menu v-model updates', async () => {
  const w = mountFaIconPickerInput('mdi-account')

  await w.find('[data-test-locator="faIconPickerInput-test-trigger"]').trigger('click')
  expect(w.find('.q-menu-stub').exists()).toBe(true)

  await w.find('.q-menu-stub').trigger('click')
  expect(w.find('.q-menu-stub').exists()).toBe(false)
})
