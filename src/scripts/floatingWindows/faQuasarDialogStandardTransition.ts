/**
 * Matches QDialog with default position="standard": scale in / scale out and the same duration as
 * Quasar's useTransitionProps default (see quasar/ui/src/components/dialog/QDialog.js).
 */
export const FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS = 300

/**
 * Vue <Transition> bindings mirroring Quasar's useTransition() output for transitionShow/Hide "scale".
 */
export const FA_QUASAR_DIALOG_STANDARD_TRANSITION_BINDINGS = {
  appear: true,
  enterActiveClass: 'q-transition--scale-enter-active',
  enterFromClass: 'q-transition--scale-enter-from',
  enterToClass: 'q-transition--scale-enter-to',
  leaveActiveClass: 'q-transition--scale-leave-active',
  leaveFromClass: 'q-transition--scale-leave-from',
  leaveToClass: 'q-transition--scale-leave-to'
} as const
