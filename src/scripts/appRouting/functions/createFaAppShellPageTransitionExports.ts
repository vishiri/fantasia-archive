export function createFaAppShellPageTransitionExports (deps: {
  quasarDialogStandardTransitionMs: number
}): {
    FA_APP_SHELL_DRAWER_TRANSITION_MS: number
    FA_APP_SHELL_PAGE_TRANSITION_BINDINGS: {
      appear: boolean
      enterActiveClass: string
      enterFromClass: string
      enterToClass: string
      leaveActiveClass: string
      leaveFromClass: string
      leaveToClass: string
    }
    FA_APP_SHELL_PAGE_TRANSITION_MS: number
  } {
  const FA_APP_SHELL_PAGE_TRANSITION_MS = deps.quasarDialogStandardTransitionMs
  const FA_APP_SHELL_DRAWER_TRANSITION_MS = FA_APP_SHELL_PAGE_TRANSITION_MS
  const FA_APP_SHELL_PAGE_TRANSITION_BINDINGS = {
    appear: true,
    enterActiveClass: 'fa-appShellPage-enter-active',
    enterFromClass: 'fa-appShellPage-enter-from',
    enterToClass: 'fa-appShellPage-enter-to',
    leaveActiveClass: 'fa-appShellPage-leave-active',
    leaveFromClass: 'fa-appShellPage-leave-from',
    leaveToClass: 'fa-appShellPage-leave-to'
  }

  return {
    FA_APP_SHELL_DRAWER_TRANSITION_MS,
    FA_APP_SHELL_PAGE_TRANSITION_BINDINGS,
    FA_APP_SHELL_PAGE_TRANSITION_MS
  }
}
