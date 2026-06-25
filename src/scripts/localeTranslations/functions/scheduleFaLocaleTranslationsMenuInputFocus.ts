/**
 * Focus locale translations menu input after Quasar menu content mounts (nextTick + rAF retry).
 */
export function scheduleFaLocaleTranslationsMenuInputFocus (deps: {
  focusMenuInput: () => void
  nextTick: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
}): void {
  const logNextTickFailure = (err: unknown): void => {
    console.error('[faLocaleTranslations] nextTick chain failed', err)
  }

  void deps.nextTick().then(() => {
    deps.focusMenuInput()
    deps.requestAnimationFrame(() => {
      void deps.nextTick().then(() => {
        deps.focusMenuInput()
      }).catch(logNextTickFailure)
    })
  }).catch(logNextTickFailure)
}
