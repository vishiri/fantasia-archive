import { expect, test } from 'vitest'

import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'
import {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS
} from 'app/src/scripts/floatingWindows/faFloatingWindowPopTransition'

test('Test that FA_FLOATING_WINDOW_POP_TRANSITION_MS matches Quasar default dialog transition duration', () => {
  expect(FA_FLOATING_WINDOW_POP_TRANSITION_MS).toBe(300)
  expect(FA_FLOATING_WINDOW_POP_TRANSITION_MS).toBe(FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS)
})

test('Test that FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS includes appear and fa-floatingWindowPop class names', () => {
  expect(FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS.appear).toBe(true)
  expect(FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS.enterFromClass).toBe('fa-floatingWindowPop-enter-from')
  expect(FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS.leaveToClass).toBe('fa-floatingWindowPop-leave-to')
})
