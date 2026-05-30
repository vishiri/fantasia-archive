import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

export function createUseErrorCard (deps: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  errorCardScopedMaxWidthBindPx: (widthPx: number) => string
}): (width: I_ref<number>) => {
    errorCardMaxWidthPx: I_computedRef<string>
  } {
  return function useErrorCard (width: I_ref<number>) {
    const errorCardMaxWidthPx = deps.computed(() => {
      return deps.errorCardScopedMaxWidthBindPx(width.value)
    })

    return {
      errorCardMaxWidthPx
    }
  }
}
