import type { T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'

/**
 * Focus locale translations menu input after Quasar menu content mounts (nextTick + rAF retry).
 */
export function scheduleFaLocaleTranslationsMenuInputFocus (deps: {
  ResultAsync: T_injectedResultAsync
  focusMenuInput: () => void
  nextTick: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
}): void {
  const logNextTickFailure = (err: unknown): void => {
    console.error('[faLocaleTranslations] nextTick chain failed', err)
  }

  void deps.ResultAsync.fromPromise(deps.nextTick(), (error): unknown => error).match(
    () => {
      deps.focusMenuInput()
      deps.requestAnimationFrame(() => {
        void deps.ResultAsync.fromPromise(deps.nextTick(), (error): unknown => error).match(
          () => {
            deps.focusMenuInput()
          },
          logNextTickFailure
        )
      })
    },
    logNextTickFailure
  )
}
