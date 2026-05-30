import { expect, test } from 'vitest'

import {
  FA_APP_SHELL_DRAWER_TRANSITION_MS,
  FA_APP_SHELL_PAGE_TRANSITION_BINDINGS,
  FA_APP_SHELL_PAGE_TRANSITION_MS
} from '../faAppShellPageTransition_manager'
import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from '../../floatingWindows/functions/faQuasarDialogStandardTransition'

/**
 * faAppShellPageTransition
 * Page crossfade duration matches Quasar dialog standard timing.
 */
test('Test that FA_APP_SHELL_PAGE_TRANSITION_MS matches Quasar dialog standard duration', () => {
  expect(FA_APP_SHELL_PAGE_TRANSITION_MS).toBe(FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS)
  expect(FA_APP_SHELL_DRAWER_TRANSITION_MS).toBe(FA_APP_SHELL_PAGE_TRANSITION_MS)
})

/**
 * faAppShellPageTransition
 * Bindings expose opacity-only enter and leave class names for MainLayout router outlet.
 */
test('Test that FA_APP_SHELL_PAGE_TRANSITION_BINDINGS lists fa-appShellPage transition classes', () => {
  expect(FA_APP_SHELL_PAGE_TRANSITION_BINDINGS.enterActiveClass).toBe('fa-appShellPage-enter-active')
  expect(FA_APP_SHELL_PAGE_TRANSITION_BINDINGS.leaveToClass).toBe('fa-appShellPage-leave-to')
  expect(FA_APP_SHELL_PAGE_TRANSITION_BINDINGS.appear).toBe(true)
})
