/**
 * Factory: true when 'sender.id' matches the registered main-window webContents id.
 */
export function createAssertMainWindowSender (deps: {
  getMainWebContentsId: () => number | null
}): {
    assertMainWindowSender: (sender: { id: number }) => boolean
  } {
  function assertMainWindowSender (sender: { id: number }): boolean {
    const mainId = deps.getMainWebContentsId()
    if (mainId === null) {
      return false
    }
    return sender.id === mainId
  }

  return {
    assertMainWindowSender
  }
}
