import type { I_computedRef } from 'app/types/I_vueCompositionShims'

export function createUseApp (deps: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  isFantasiaStorybookCanvas: () => boolean
  getMode: () => string | undefined
  resolveMountUserCssInjector: (
    isStorybookCanvas: boolean,
    mode: string | undefined
  ) => boolean
}): () => { mountUserCssInjector: I_computedRef<boolean> } {
  return function useApp () {
    const mountUserCssInjector = deps.computed((): boolean => {
      return deps.resolveMountUserCssInjector(
        deps.isFantasiaStorybookCanvas(),
        deps.getMode()
      )
    })

    return {
      mountUserCssInjector
    }
  }
}
