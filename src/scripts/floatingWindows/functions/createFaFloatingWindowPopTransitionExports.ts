export function createFaFloatingWindowPopTransitionExports (deps: {
  quasarDialogStandardTransitionMs: number
}): {
    FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: {
      appear: boolean
      enterActiveClass: string
      enterFromClass: string
      enterToClass: string
      leaveActiveClass: string
      leaveFromClass: string
      leaveToClass: string
    }
    FA_FLOATING_WINDOW_POP_TRANSITION_MS: number
  } {
  const FA_FLOATING_WINDOW_POP_TRANSITION_MS = deps.quasarDialogStandardTransitionMs
  const FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS = {
    appear: true,
    enterActiveClass: 'fa-floatingWindowPop-enter-active',
    enterFromClass: 'fa-floatingWindowPop-enter-from',
    enterToClass: 'fa-floatingWindowPop-enter-to',
    leaveActiveClass: 'fa-floatingWindowPop-leave-active',
    leaveFromClass: 'fa-floatingWindowPop-leave-from',
    leaveToClass: 'fa-floatingWindowPop-leave-to'
  }

  return {
    FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
    FA_FLOATING_WINDOW_POP_TRANSITION_MS
  }
}
