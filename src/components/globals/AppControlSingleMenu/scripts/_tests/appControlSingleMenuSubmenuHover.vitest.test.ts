import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import {
  APP_CONTROL_SINGLE_MENU_SUBMENU_HOVER_LEAVE_MS,
  createAppControlSingleMenuSubmenuHover
} from '../appControlSingleMenu_manager'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

/**
 * createAppControlSingleMenuSubmenuHover
 * Opening one submenu row sets the tracked index; leaving schedules close after the hover gap delay.
 */
test('Test that submenu hover helper opens on activator enter and closes after leave delay', () => {
  const {
    openSubmenuRowIndex,
    onSubmenuActivatorEnter,
    onSubmenuActivatorLeave
  } = createAppControlSingleMenuSubmenuHover()

  onSubmenuActivatorEnter(2)
  expect(openSubmenuRowIndex.value).toBe(2)

  onSubmenuActivatorLeave()
  expect(openSubmenuRowIndex.value).toBe(2)
  vi.advanceTimersByTime(APP_CONTROL_SINGLE_MENU_SUBMENU_HOVER_LEAVE_MS)
  expect(openSubmenuRowIndex.value).toBeNull()
})

/**
 * createAppControlSingleMenuSubmenuHover
 * Moving into the submenu panel clears a pending hide so the menu stays open.
 */
test('Test that submenu content enter cancels a pending hide timer', () => {
  const {
    openSubmenuRowIndex,
    onSubmenuActivatorEnter,
    onSubmenuActivatorLeave,
    onSubmenuContentEnter
  } = createAppControlSingleMenuSubmenuHover()

  onSubmenuActivatorEnter(1)
  onSubmenuActivatorLeave()
  vi.advanceTimersByTime(APP_CONTROL_SINGLE_MENU_SUBMENU_HOVER_LEAVE_MS - 1)
  onSubmenuContentEnter()
  vi.advanceTimersByTime(APP_CONTROL_SINGLE_MENU_SUBMENU_HOVER_LEAVE_MS)
  expect(openSubmenuRowIndex.value).toBe(1)
})

/**
 * createAppControlSingleMenuSubmenuHover
 * Leaving the submenu panel schedules the same delayed hide as leaving the parent row.
 */
test('Test that submenu content leave schedules close after delay', () => {
  const {
    openSubmenuRowIndex,
    onSubmenuActivatorEnter,
    onSubmenuContentLeave
  } = createAppControlSingleMenuSubmenuHover()

  onSubmenuActivatorEnter(0)
  onSubmenuContentLeave()
  vi.advanceTimersByTime(APP_CONTROL_SINGLE_MENU_SUBMENU_HOVER_LEAVE_MS)
  expect(openSubmenuRowIndex.value).toBeNull()
})

/**
 * createAppControlSingleMenuSubmenuHover
 * Model update false for a different row does not clear the active submenu index.
 */
test('Test that submenu model update false ignores non-active row index', () => {
  const {
    openSubmenuRowIndex,
    onSubmenuActivatorEnter,
    onSubmenuModelUpdate
  } = createAppControlSingleMenuSubmenuHover()

  onSubmenuActivatorEnter(4)
  onSubmenuModelUpdate(1, false)
  expect(openSubmenuRowIndex.value).toBe(4)
})

/**
 * createAppControlSingleMenuSubmenuHover
 * Root menu hide clears state and pending timers.
 */
test('Test that root menu hide resets submenu index and cancels hide scheduling', () => {
  const {
    openSubmenuRowIndex,
    onRootMenuHide,
    onSubmenuActivatorEnter,
    onSubmenuActivatorLeave
  } = createAppControlSingleMenuSubmenuHover()

  onSubmenuActivatorEnter(0)
  onSubmenuActivatorLeave()
  onRootMenuHide()
  vi.runAllTimers()
  expect(openSubmenuRowIndex.value).toBeNull()
})

/**
 * createAppControlSingleMenuSubmenuHover
 * Model update false for the active row clears the index without scheduling.
 */
test('Test that submenu model update false clears matching row index', () => {
  const {
    openSubmenuRowIndex,
    onSubmenuModelUpdate
  } = createAppControlSingleMenuSubmenuHover()

  onSubmenuModelUpdate(3, true)
  expect(openSubmenuRowIndex.value).toBe(3)
  onSubmenuModelUpdate(3, false)
  expect(openSubmenuRowIndex.value).toBeNull()
})
