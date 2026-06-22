/**
 * Focus locale translations menu input after Quasar menu content mounts (nextTick + rAF retry).
 */
export function scheduleFaLocaleTranslationsMenuInputFocus (deps: {
  focusMenuInput: () => void
  nextTick: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
}): void {
  void deps.nextTick().then(() => {
    deps.focusMenuInput()
    deps.requestAnimationFrame(() => {
      void deps.nextTick().then(() => {
        deps.focusMenuInput()
      })
    })
  })
}
