import { expect, test } from 'vitest'

import {
  FA_QUASAR_DIALOG_STANDARD_TRANSITION_BINDINGS,
  FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS
} from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'

/**
 * FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS
 * Exposes the same duration Quasar uses for default QDialog scale transitions.
 */
test('Test that FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS matches the expected millisecond value', () => {
  expect(FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS).toBe(300)
})

/**
 * FA_QUASAR_DIALOG_STANDARD_TRANSITION_BINDINGS
 * Mirrors Quasar scale enter/leave class names for Vue Transition.
 */
test('Test that FA_QUASAR_DIALOG_STANDARD_TRANSITION_BINDINGS includes appear and scale class keys', () => {
  expect(FA_QUASAR_DIALOG_STANDARD_TRANSITION_BINDINGS.appear).toBe(true)
  expect(FA_QUASAR_DIALOG_STANDARD_TRANSITION_BINDINGS.enterActiveClass).toContain('scale')
  expect(FA_QUASAR_DIALOG_STANDARD_TRANSITION_BINDINGS.leaveActiveClass).toContain('scale')
})
