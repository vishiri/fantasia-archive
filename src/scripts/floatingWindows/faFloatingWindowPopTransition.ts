import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'

/**
 * Same duration as Quasar default QDialog transitions (use with `--q-transition-duration` on the frame).
 */
export const FA_FLOATING_WINDOW_POP_TRANSITION_MS = FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS

/**
 * Pop in/out (opacity + transform scale) for floating `WindowProgramStyling` without Quasar’s stock
 * `q-transition--scale` classes: their enter-from uses scale3d(0,0,1), which can leave the frame
 * with a degenerate transform in Electron and break Playwright’s visibility checks. The SCSS for these
 * class names uses a scale strictly between 0 and 1 (never zero).
 */
export const FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS = {
  appear: true,
  enterActiveClass: 'fa-floatingWindowPop-enter-active',
  enterFromClass: 'fa-floatingWindowPop-enter-from',
  enterToClass: 'fa-floatingWindowPop-enter-to',
  leaveActiveClass: 'fa-floatingWindowPop-leave-active',
  leaveFromClass: 'fa-floatingWindowPop-leave-from',
  leaveToClass: 'fa-floatingWindowPop-leave-to'
} as const
