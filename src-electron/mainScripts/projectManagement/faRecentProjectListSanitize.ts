import fs from 'node:fs'

import { parseFaRecentProjectListStored } from 'app/src-electron/shared/faRecentProjectListStoredSchema'
import { faRecentProjectListStructuralNormalize } from 'app/src-electron/shared/faRecentProjectListStructural'
import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'

import { pathLooksLikeFaProjectFile } from './faProjectPathValidation'

function trimAndValidateMainRow (row: I_faRecentProjectEntry): I_faRecentProjectEntry | null {
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

function entryRowsExistAsFiles (rows: readonly I_faRecentProjectEntry[]): I_faRecentProjectEntry[] {
  const out: I_faRecentProjectEntry[] = []
  for (const row of rows) {
    try {
      if (!fs.existsSync(row.filePath)) {
        continue
      }
      if (!fs.statSync(row.filePath).isFile()) {
        continue
      }
    } catch {
      continue
    }
    out.push(row)
  }
  return out
}

/**
 * Idempotent MRU normalization: Zod strip, main path validation, dedupe, cap, drop missing paths.
 */
export function faRecentProjectsSanitizeForPersistence (storeBlob: unknown): I_faRecentProjectEntry[] {
  const parsed = parseFaRecentProjectListStored(storeBlob)
  const vetted: I_faRecentProjectEntry[] = []
  for (const row of parsed) {
    const next = trimAndValidateMainRow(row)
    if (next !== null) {
      vetted.push(next)
    }
  }
  const deduped = faRecentProjectListStructuralNormalize(vetted)
  const living = entryRowsExistAsFiles(deduped)
  return living
}

export function faRecentProjectsListsEqual (
  a: readonly I_faRecentProjectEntry[],
  b: readonly I_faRecentProjectEntry[]
): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
