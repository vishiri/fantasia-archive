export function createFaAppNoteboardCanOpen (deps: {
  getMarkdownDialogOpenCount: () => number
  getComponentDialogOpenCount: () => number
}): {
    canOpenFloatingWindowWhileNoModal: () => boolean
  } {
  const canOpenFloatingWindowWhileNoModal = (): boolean => {
    return (
      deps.getMarkdownDialogOpenCount() === 0 &&
      deps.getComponentDialogOpenCount() === 0
    )
  }

  return {
    canOpenFloatingWindowWhileNoModal
  }
}
