import { expect, test } from 'vitest'

import {
  PROJECT_APP_CONTROL_BAR_TAB_ENTER_ACTIVE_CLASS,
  PROJECT_APP_CONTROL_BAR_TAB_LEAVE_ACTIVE_CLASS,
  PROJECT_APP_CONTROL_BAR_TAB_TRANSITION_MS
} from '../projectAppControlBarTabTransition'

test('Test that PROJECT_APP_CONTROL_BAR_TAB_TRANSITION_MS matches ProjectAppControlBar TransitionGroup duration', () => {
  expect(PROJECT_APP_CONTROL_BAR_TAB_TRANSITION_MS).toBe(150)
})

test('Test that tab fade TransitionGroup classes use animate.css fadeIn and fadeOut', () => {
  expect(PROJECT_APP_CONTROL_BAR_TAB_ENTER_ACTIVE_CLASS).toBe('animated fadeIn')
  expect(PROJECT_APP_CONTROL_BAR_TAB_LEAVE_ACTIVE_CLASS).toBe('animated fadeOut')
})
