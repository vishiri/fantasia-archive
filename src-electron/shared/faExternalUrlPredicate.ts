/**
 * Pure URL classification for external http(s) links (same rules as the content bridge).
 * No Electron imports — safe for main, preload, and unit tests.
 */
export function checkIfExternalUrl (url: string): boolean {
  return (
    (url.includes('http://') || url.includes('https://')) &&
    !url.includes('localhost')
  )
}
