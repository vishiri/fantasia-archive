import { FA_PROJECT_FILE_EXTENSION } from 'app/src-electron/shared/faProjectConstants'
import { faRecentProjectPathKey } from 'app/src-electron/shared/faRecentProjectPathKey'
import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'

/** Maximum recent project entries persisted and shown. */
export const FA_RECENT_PROJECTS_MAX = 10 as const

/**
 * True when string looks like an absolute .faproject path (shared string rules; no node:path).
 */
export function faRecentProjectPathLooksValidStructural (filePath: string): boolean {
  if (typeof filePath !== 'string' || filePath.length === 0) {
    return false
  }
  const unified = filePath.replaceAll('\\', '/')
  if (!unified.toLowerCase().endsWith(`.${FA_PROJECT_FILE_EXTENSION}`)) {
    return false
  }
  const looksAbsolute =
    unified.startsWith('/') ||
    /^[A-Za-z]:\//u.test(unified) ||
    unified.startsWith('//')
  return looksAbsolute
}

function trimEntry (entry: I_faRecentProjectEntry): I_faRecentProjectEntry | null {
  const name = entry.name.trim()
  const filePath = entry.filePath.trim()
  if (name.length === 0 || filePath.length === 0) {
    return null
  }
  if (!faRecentProjectPathLooksValidStructural(filePath)) {
    return null
  }
  return {
    filePath,
    name
  }
}

/**
 * Dedupe by path key (newest-first wins), cap at FA_RECENT_PROJECTS_MAX. Does not touch disk.
 */
export function faRecentProjectListStructuralNormalize (
  entries: readonly I_faRecentProjectEntry[]
): I_faRecentProjectEntry[] {
  const out: I_faRecentProjectEntry[] = []
  const seen = new Set<string>()
  for (const raw of entries) {
    const row = trimEntry(raw)
    if (row === null) {
      continue
    }
    const k = faRecentProjectPathKey(row.filePath)
    if (seen.has(k)) {
      continue
    }
    seen.add(k)
    out.push(row)
    if (out.length >= FA_RECENT_PROJECTS_MAX) {
      break
    }
  }
  return out
}
