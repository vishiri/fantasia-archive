/**
 * Focus rename menu input after Quasar menu content mounts (nextTick + rAF retry).
 */
export function scheduleDialogProjectSettingsWorldTemplateLayoutRenameMenuInputFocus (deps: {
  focusRenameInput: () => void
  nextTick: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
}): void {
  void deps.nextTick().then(() => {
    deps.focusRenameInput()
    deps.requestAnimationFrame(() => {
      void deps.nextTick().then(() => {
        deps.focusRenameInput()
      })
    })
  })
}
