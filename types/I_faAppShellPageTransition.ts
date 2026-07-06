export type T_faAppShellPageTransitionBindings = {
  appear: boolean
  duration?: number
  enterActiveClass: string
  enterFromClass?: string
  enterToClass?: string
  leaveActiveClass: string
  leaveFromClass?: string
  leaveToClass?: string
}

export type T_faAppShellPageTransitionMode = 'default' | 'out-in'

export type T_faAppShellPageTransitionResolution = {
  bindings: T_faAppShellPageTransitionBindings
  mode: T_faAppShellPageTransitionMode
}
