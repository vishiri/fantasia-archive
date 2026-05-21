import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'

/**
 * Duration for welcome ↔ workspace page crossfades inside MainLayout (matches QDialog timing).
 */
export const FA_APP_SHELL_PAGE_TRANSITION_MS = FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS

/**
 * Left drawer slide duration when entering the workspace route (matches page crossfade).
 */
export const FA_APP_SHELL_DRAWER_TRANSITION_MS = FA_APP_SHELL_PAGE_TRANSITION_MS

/**
 * Opacity-only page transition bindings for the shared app shell router outlet.
 * Scale transitions are avoided on full-page surfaces in Electron (see faQuasarDialogStandardTransition.ts).
 */
export const FA_APP_SHELL_PAGE_TRANSITION_BINDINGS = {
  appear: true,
  enterActiveClass: 'fa-appShellPage-enter-active',
  enterFromClass: 'fa-appShellPage-enter-from',
  enterToClass: 'fa-appShellPage-enter-to',
  leaveActiveClass: 'fa-appShellPage-leave-active',
  leaveFromClass: 'fa-appShellPage-leave-from',
  leaveToClass: 'fa-appShellPage-leave-to'
} as const
