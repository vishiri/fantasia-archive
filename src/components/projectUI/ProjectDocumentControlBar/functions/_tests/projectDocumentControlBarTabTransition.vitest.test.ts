import { expect, test } from 'vitest'

import {
  PROJECT_DOCUMENT_CONTROL_BAR_TAB_ENTER_ACTIVE_CLASS,
  PROJECT_DOCUMENT_CONTROL_BAR_TAB_LEAVE_ACTIVE_CLASS,
  PROJECT_DOCUMENT_CONTROL_BAR_TAB_TRANSITION_MS
} from '../projectDocumentControlBarTabTransition'

test('Test that PROJECT_DOCUMENT_CONTROL_BAR_TAB_TRANSITION_MS matches ProjectDocumentControlBar TransitionGroup duration', () => {
  expect(PROJECT_DOCUMENT_CONTROL_BAR_TAB_TRANSITION_MS).toBe(150)
})

test('Test that tab fade TransitionGroup classes use animate.css fadeIn and fadeOut', () => {
  expect(PROJECT_DOCUMENT_CONTROL_BAR_TAB_ENTER_ACTIVE_CLASS).toBe('animated fadeIn')
  expect(PROJECT_DOCUMENT_CONTROL_BAR_TAB_LEAVE_ACTIVE_CLASS).toBe('animated fadeOut')
})
