/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent, h, nextTick, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import DialogProjectSettingsWorldsDeleteButton from '../DialogProjectSettingsWorldsDeleteButton.vue'

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
  setup (props, { emit, slots }) {
    onMounted(() => {
      emit('update:modelValue', true)
    })

    return () => h(
      'div',
      {
        class: 'q-menu-stub',
        'data-test-locator': 'dialogProjectSettings-worlds-deleteConfirmMenu'
      },
      slots.default?.()
    )
  }
})

const qTooltipStub = defineComponent({
  template: '<span class="q-tooltip-stub"><slot /></span>'
})

function mountDeleteButton (removeDisabled: boolean, removeDisabledReason: 'hasDocuments' | 'lastWorld' | null = null) {
  return mount(DialogProjectSettingsWorldsDeleteButton, {
    props: {
      removeDisabled,
      removeDisabledReason
    },
    global: {
      config: {
        compilerOptions: {
          isCustomElement: () => false
        }
      },
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
 * DialogProjectSettingsWorldsDeleteButton
 * Shows remove-disabled tooltip copy when deletion is blocked.
 */
test('Test that DialogProjectSettingsWorldsDeleteButton shows remove-disabled tooltip copy', () => {
  const w = mountDeleteButton(true, 'hasDocuments')

  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-removeButton"]').attributes('disabled')
  ).toBeDefined()
  expect(w.find('.q-tooltip-stub').text()).toContain(
    'dialogs.projectSettings.panels.worlds.removeDisabledHasDocuments'
  )
})

/**
 * DialogProjectSettingsWorldsDeleteButton
 * Renders confirmation copy and starts with a disabled countdown on confirm.
 */
test('Test that DialogProjectSettingsWorldsDeleteButton renders delete confirmation chrome', () => {
  const w = mountDeleteButton(false)

  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-deleteConfirmMessage"]').text()).toBe(
    'dialogs.projectSettings.panels.worlds.deleteConfirm.message'
  )

  const confirmButton = w.find('[data-test-locator="dialogProjectSettings-worlds-deleteConfirmConfirmButton"]')
  expect((confirmButton.element as HTMLButtonElement).disabled).toBe(true)
  expect(confirmButton.text()).toContain('dialogs.projectSettings.panels.worlds.deleteConfirm.confirmDeleteButton')
  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-deleteConfirmCountdown"]').text()).toBe('5')
  expect(confirmButton.classes()).toContain('dialogProjectSettingsWorldsDeleteConfirm__confirmButton--countdownActive')
})

/**
 * DialogProjectSettingsWorldsDeleteButton
 * Ignores confirm clicks while the countdown is still active.
 */
test('Test that DialogProjectSettingsWorldsDeleteButton ignores confirm while countdown is active', async () => {
  const w = mountDeleteButton(false)

  await w.find('[data-test-locator="dialogProjectSettings-worlds-deleteConfirmConfirmButton"]').trigger('click')
  expect(w.emitted('confirm')).toBeFalsy()
})

/**
 * DialogProjectSettingsWorldsDeleteButton
 * Enables confirm once the countdown finishes and clears the interval.
 */
test('Test that DialogProjectSettingsWorldsDeleteButton enables confirm after countdown', async () => {
  const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
  const w = mountDeleteButton(false)
  await nextTick()

  vi.advanceTimersByTime(5000)
  await nextTick()

  const confirmButton = w.find('[data-test-locator="dialogProjectSettings-worlds-deleteConfirmConfirmButton"]')
  expect((confirmButton.element as HTMLButtonElement).disabled).toBe(false)
  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-deleteConfirmCountdown"]').exists()).toBe(false)
  expect(clearIntervalSpy).toHaveBeenCalled()

  await confirmButton.trigger('click')
  expect(w.emitted('confirm')).toHaveLength(1)

  clearIntervalSpy.mockRestore()
})

/**
 * DialogProjectSettingsWorldsDeleteButton
 * Clears the countdown interval when the component unmounts.
 */
test('Test that DialogProjectSettingsWorldsDeleteButton clears countdown on unmount', async () => {
  const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
  const w = mountDeleteButton(false)
  await nextTick()

  w.unmount()

  expect(clearIntervalSpy).toHaveBeenCalled()
  clearIntervalSpy.mockRestore()
})
