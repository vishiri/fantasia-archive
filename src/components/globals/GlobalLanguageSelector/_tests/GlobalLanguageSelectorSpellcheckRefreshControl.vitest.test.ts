import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, test, vi } from 'vitest'

import GlobalLanguageSelectorSpellcheckRefreshControl from '../GlobalLanguageSelectorSpellcheckRefreshControl.vue'

const QTooltipStub = defineComponent({
  name: 'QTooltip',
  inheritAttrs: true,
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  template: '<div class="spellcheck-qtooltip-stub" :data-test-stub-tooltip-open="modelValue"><slot /></div>'
})

const spellcheckRefreshMount = {
  global: {
    components: {
      QBtn: { template: '<button type="button" class="q-btn-stub"><slot /></button>' },
      QIcon: { template: '<i class="q-icon-stub" />' },
      QTooltip: QTooltipStub
    },
    config: {
      compilerOptions: {
        isCustomElement: (tag: string): boolean => {
          const lower = tag.toLowerCase()
          if (lower === 'q-icon' || lower === 'q-tooltip' || lower === 'q-btn') {
            return false
          }

          return /^q-/i.test(tag)
        }
      }
    },
    mocks: {
      $t: (key: string) => key
    }
  }
} as const

/**
 * GlobalLanguageSelectorSpellcheckRefreshControl
 * Hidden until 'show' is true; forwards refreshWebContents clicks.
 */
test('Test that spellcheck refresh control stays hidden when show is false', () => {
  const w = mount(GlobalLanguageSelectorSpellcheckRefreshControl, {
    props: {
      show: false
    },
    ...spellcheckRefreshMount
  })

  expect(w.find('[data-test-locator="globalLanguageSelector-spellcheckRefresh"]').exists()).toBe(false)
  w.unmount()
})

test('Test that spellcheck refresh control emits refreshWebContents when shown and clicked', async () => {
  const w = mount(GlobalLanguageSelectorSpellcheckRefreshControl, {
    props: {
      show: true
    },
    ...spellcheckRefreshMount
  })

  await w.find('[data-test-locator="globalLanguageSelector-spellcheckRefresh"]').trigger('click')
  expect(w.emitted('refreshWebContents')).toEqual([[]])
  w.unmount()
})

/**
 * GlobalLanguageSelectorSpellcheckRefreshControl
 * Tooltip auto-open timer should flip the stubbed q-tooltip model after the transition delay.
 */
test('Test that spellcheck refresh control opens the tooltip model after the debounced delay', async () => {
  vi.useFakeTimers()
  const w = mount(GlobalLanguageSelectorSpellcheckRefreshControl, {
    props: {
      show: false
    },
    ...spellcheckRefreshMount
  })

  await flushPromises()
  await w.setProps({ show: true })
  await flushPromises()
  expect(w.find('.spellcheck-qtooltip-stub').attributes('data-test-stub-tooltip-open')).toBe('false')

  await vi.runAllTimersAsync()
  await flushPromises()

  expect(w.find('.spellcheck-qtooltip-stub').attributes('data-test-stub-tooltip-open')).toBe('true')
  w.unmount()
  vi.useRealTimers()
})

/**
 * GlobalLanguageSelectorSpellcheckRefreshControl
 * Hiding the control before the tooltip timer fires should cancel the pending timeout.
 */
test('Test that spellcheck refresh control cancels tooltip auto-open when hidden early', async () => {
  vi.useFakeTimers()
  const w = mount(GlobalLanguageSelectorSpellcheckRefreshControl, {
    props: {
      show: false
    },
    ...spellcheckRefreshMount
  })

  await flushPromises()
  await w.setProps({ show: true })
  await flushPromises()
  await w.setProps({ show: false })
  await flushPromises()

  await vi.runAllTimersAsync()
  await flushPromises()

  expect(w.find('.spellcheck-qtooltip-stub').exists()).toBe(false)
  w.unmount()
  vi.useRealTimers()
})

/**
 * GlobalLanguageSelectorSpellcheckRefreshControl
 * Unmounting while a tooltip auto-open timer is pending should clear the timer without throwing.
 */
test('Test that spellcheck refresh control clears pending timers on unmount', async () => {
  vi.useFakeTimers()
  const w = mount(GlobalLanguageSelectorSpellcheckRefreshControl, {
    props: {
      show: false
    },
    ...spellcheckRefreshMount
  })

  await flushPromises()
  await w.setProps({ show: true })
  await flushPromises()
  await vi.advanceTimersByTimeAsync(50)
  w.unmount()
  await vi.runAllTimersAsync()
  vi.useRealTimers()
})
