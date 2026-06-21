import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { ResultAsync } from 'neverthrow'
import { test, expect, vi } from 'vitest'

import { useWindowAppStylingHelpMenu } from 'app/src/components/floatingWindows/WindowAppStyling/scripts/windowAppStyling_manager'
import { FA_Q_TOOLTIP_DELAY_MS } from 'app/src/scripts/appGlobalManagementUI/faQTooltipDelay_manager'

const HelpMenuTestHarness = defineComponent({
  setup () {
    const { helpKeybindMenuOpen, onHelpIconMouseEnter, onHelpIconMouseLeave } =
      useWindowAppStylingHelpMenu()
    return {
      helpKeybindMenuOpen,
      onHelpIconMouseEnter,
      onHelpIconMouseLeave
    }
  },
  template: `
    <div>
      <span
        data-test-locator="helpMenuHoverTarget"
        @mouseenter="onHelpIconMouseEnter"
        @mouseleave="onHelpIconMouseLeave"
      />
      <span data-test-locator="helpMenuOpenState">{{ helpKeybindMenuOpen ? '1' : '0' }}</span>
    </div>
  `
})

/**
 * useWindowAppStylingHelpMenu
 * Hover with FA_Q_TOOLTIP_DELAY_MS flips the menu model on; leave-before-delay cancels.
 */
test('Test that useWindowAppStylingHelpMenu opens after the hover delay', async () => {
  vi.useFakeTimers()
  const w = mount(HelpMenuTestHarness)
  const body = await ResultAsync.fromPromise(
    (async (): Promise<void> => {
      expect(w.get('[data-test-locator="helpMenuOpenState"]').text()).toBe('0')
      await w.get('[data-test-locator="helpMenuHoverTarget"]').trigger('mouseenter')
      vi.advanceTimersByTime(FA_Q_TOOLTIP_DELAY_MS - 1)
      await nextTick()
      expect(w.get('[data-test-locator="helpMenuOpenState"]').text()).toBe('0')
      vi.advanceTimersByTime(1)
      await nextTick()
      expect(w.get('[data-test-locator="helpMenuOpenState"]').text()).toBe('1')
    })(),
    (e): unknown => e
  )
  w.unmount()
  vi.useRealTimers()
  if (body.isErr()) {
    throw body.error
  }
})

/**
 * useWindowAppStylingHelpMenu
 * Leaving the hover target before the delay clears the scheduled open.
 */
test('Test that useWindowAppStylingHelpMenu cancels a pending open on mouse leave', async () => {
  vi.useFakeTimers()
  const w = mount(HelpMenuTestHarness)
  const body = await ResultAsync.fromPromise(
    (async (): Promise<void> => {
      const t = w.get('[data-test-locator="helpMenuHoverTarget"]')
      await t.trigger('mouseenter')
      await t.trigger('mouseleave')
      vi.advanceTimersByTime(FA_Q_TOOLTIP_DELAY_MS)
      await nextTick()
      expect(w.get('[data-test-locator="helpMenuOpenState"]').text()).toBe('0')
    })(),
    (e): unknown => e
  )
  w.unmount()
  vi.useRealTimers()
  if (body.isErr()) {
    throw body.error
  }
})

/**
 * useWindowAppStylingHelpMenu
 * Unmount clears the scheduled timer so the open callback does not run after teardown.
 */
test('Test that useWindowAppStylingHelpMenu clears the hover timer on unmount', async () => {
  vi.useFakeTimers()
  const w = mount(HelpMenuTestHarness)
  await w.get('[data-test-locator="helpMenuHoverTarget"]').trigger('mouseenter')
  w.unmount()
  expect(() => {
    vi.advanceTimersByTime(FA_Q_TOOLTIP_DELAY_MS)
  }).not.toThrow()
  vi.useRealTimers()
})
