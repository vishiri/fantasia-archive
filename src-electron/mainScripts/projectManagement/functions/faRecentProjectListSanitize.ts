import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'

export function trimAndValidateRecentProjectRow (
  row: I_faRecentProjectEntry,
  pathLooksLikeFaProjectFile: (filePath: string) => boolean
): I_faRecentProjectEntry | null {
  const name = row.name.trim()
  const filePath = row.filePath.trim()
  if (name.length === 0 || filePath.length === 0) {
    return null
  }
  if (!pathLooksLikeFaProjectFile(filePath)) {
    return null
  }
  return {
    filePath,
    name
  }
}

export function faRecentProjectsListsEqual (
  a: readonly I_faRecentProjectEntry[],
  b: readonly I_faRecentProjectEntry[]
): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
