/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent, h, nextTick, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import DialogProjectSettingsDocumentTemplatesDeleteButton from '../DialogProjectSettingsDocumentTemplatesDeleteButton.vue'

const qBtnStub = defineComponent({
  inheritAttrs: true,
  props: {
    disable: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    }
  },
  template: `
    <button
      type="button"
      :disabled="disable"
      v-bind="$attrs"
    >
      <slot />{{ label }}
    </button>
  `
})

const qMenuStub = defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup (_props, { emit, slots }) {
    onMounted(() => {
      emit('update:modelValue', true)
    })

    return () => h(
      'div',
      {
        class: 'q-menu-stub',
        'data-test-locator': 'dialogProjectSettings-documentTemplates-deleteConfirmMenu'
      },
      slots.default?.()
    )
  }
})

const qTooltipStub = defineComponent({
  template: '<span class="q-tooltip-stub"><slot /></span>'
})

function mountDeleteButton (removeDisabled: boolean) {
  return mount(DialogProjectSettingsDocumentTemplatesDeleteButton, {
    props: {
      removeDisabled
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        QBtn: qBtnStub,
        QMenu: removeDisabled ? true : qMenuStub,
        QTooltip: qTooltipStub
      }
    }
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

/**
 * DialogProjectSettingsDocumentTemplatesDeleteButton
 * Renders delete control with disabled state when documents reference the template.
 */
test('Test that DialogProjectSettingsDocumentTemplatesDeleteButton reflects removeDisabled', () => {
  const w = mountDeleteButton(true)

  const button = w.find('[data-test-locator="dialogProjectSettings-documentTemplates-removeButton"]')
  expect(button.exists()).toBe(true)
  expect(button.attributes('disabled')).toBeDefined()
})

/**
 * DialogProjectSettingsDocumentTemplatesDeleteButton
 * Starts with a disabled countdown on confirm when the menu opens.
 */
test('Test that DialogProjectSettingsDocumentTemplatesDeleteButton renders delete confirmation countdown', async () => {
  const w = mountDeleteButton(false)
  await nextTick()

  const confirmButton = w.find('[data-test-locator="dialogProjectSettings-documentTemplates-deleteConfirmConfirmButton"]')
  expect((confirmButton.element as HTMLButtonElement).disabled).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-deleteConfirmCountdown"]').text()).toBe('5')
})

/**
 * DialogProjectSettingsDocumentTemplatesDeleteButton
 * Enables confirm once the countdown finishes.
 */
test('Test that DialogProjectSettingsDocumentTemplatesDeleteButton enables confirm after countdown', async () => {
  const w = mountDeleteButton(false)
  await nextTick()

  vi.advanceTimersByTime(5000)
  await nextTick()

  const confirmButton = w.find('[data-test-locator="dialogProjectSettings-documentTemplates-deleteConfirmConfirmButton"]')
  expect((confirmButton.element as HTMLButtonElement).disabled).toBe(false)
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-deleteConfirmCountdown"]').exists()).toBe(false)

  await confirmButton.trigger('click')
  expect(w.emitted('confirm')).toHaveLength(1)
})
