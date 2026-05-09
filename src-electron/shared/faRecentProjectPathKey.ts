/**
 * Canonical path comparison key for recent-project dedupe (no fs; safe for renderer).
 */

function isWin32Runtime (): boolean {
  if (typeof process === 'undefined' || process.platform === undefined) {
    return false
  }
  return process.platform === 'win32'
}

/**
 * Returns a normalized key so the same logical .faproject path dedupes once
 * (Windows: case-insensitive, slash-normalized; POSIX: slash-normalized, case-preserved).
 */
export function faRecentProjectPathKey (filePath: string): string {
  const slashes = filePath.replaceAll('\\', '/').replace(/\/+/gu, '/')
  if (isWin32Runtime()) {
    return slashes.toLowerCase()
  }
  return slashes
}
