/**
 * Builds a globalShortcut accelerator for literal Control+Shift+DOM code chords.
 */
export function faChromiumDomCodeToGlobalShortcutAccelerator (domCode: string): string | null {
  if (domCode === 'Delete') {
    return 'CommandOrControl+Shift+Delete'
  }
  const letterMatch = /^Key([A-Z])$/.exec(domCode)
  if (letterMatch !== null) {
    return `CommandOrControl+Shift+${letterMatch[1]}`
  }
  return null
}
