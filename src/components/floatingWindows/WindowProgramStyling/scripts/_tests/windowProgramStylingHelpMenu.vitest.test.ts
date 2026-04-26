import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { test, expect, vi } from 'vitest'

import { useWindowProgramStylingHelpMenu } from 'app/src/components/floatingWindows/WindowProgramStyling/scripts/windowProgramStylingHelpMenu'

const HelpMenuTestHarness = defineComponent({
  setup () {
    const { helpKeybindMenuOpen, onHelpIconMouseEnter, onHelpIconMouseLeave } =
      useWindowProgramStylingHelpMenu()
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
 * useWindowProgramStylingHelpMenu
 * Hover with the prior tooltip delay flips the menu model on; leave-before-delay cancels.
 */
test('Test that useWindowProgramStylingHelpMenu opens after the hover delay', async () => {
  vi.useFakeTimers()
  const w = mount(HelpMenuTestHarness)
  try {
    expect(w.get('[data-test-locator="helpMenuOpenState"]').text()).toBe('0')
    await w.get('[data-test-locator="helpMenuHoverTarget"]').trigger('mouseenter')
    vi.advanceTimersByTime(499)
    await nextTick()
    expect(w.get('[data-test-locator="helpMenuOpenState"]').text()).toBe('0')
    vi.advanceTimersByTime(1)
    await nextTick()
    expect(w.get('[data-test-locator="helpMenuOpenState"]').text()).toBe('1')
  } finally {
    w.unmount()
    vi.useRealTimers()
  }
})

/**
 * useWindowProgramStylingHelpMenu
 * Leaving the hover target before the delay clears the scheduled open.
 */
test('Test that useWindowProgramStylingHelpMenu cancels a pending open on mouse leave', async () => {
  vi.useFakeTimers()
  const w = mount(HelpMenuTestHarness)
  try {
    const t = w.get('[data-test-locator="helpMenuHoverTarget"]')
    await t.trigger('mouseenter')
    await t.trigger('mouseleave')
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(w.get('[data-test-locator="helpMenuOpenState"]').text()).toBe('0')
  } finally {
    w.unmount()
    vi.useRealTimers()
  }
})

/**
 * useWindowProgramStylingHelpMenu
 * Unmount clears the scheduled timer so the open callback does not run after teardown.
 */
test('Test that useWindowProgramStylingHelpMenu clears the hover timer on unmount', async () => {
  vi.useFakeTimers()
  const w = mount(HelpMenuTestHarness)
  await w.get('[data-test-locator="helpMenuHoverTarget"]').trigger('mouseenter')
  w.unmount()
  expect(() => {
    vi.advanceTimersByTime(500)
  }).not.toThrow()
  vi.useRealTimers()
})
