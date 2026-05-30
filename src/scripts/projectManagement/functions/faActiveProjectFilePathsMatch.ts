/**
 * True when two absolute '.faproject' paths refer to the same on-disk file (case-insensitive on Windows).
 */
export function faActiveProjectFilePathsMatch (
  activePath: string,
  candidatePath: string
): boolean {
  if (activePath === candidatePath) {
    return true
  }
  if (activePath.length === 0 || candidatePath.length === 0) {
    return false
  }
  return activePath.toLowerCase() === candidatePath.toLowerCase()
}
