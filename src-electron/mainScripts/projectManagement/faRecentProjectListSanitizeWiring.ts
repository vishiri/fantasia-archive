import { Result } from 'neverthrow'
import fs from 'node:fs'

import { parseFaRecentProjectListStored } from 'app/src-electron/shared/faRecentProjectListStoredSchema'
import { faRecentProjectListStructuralNormalize } from 'app/src-electron/shared/faRecentProjectListStructural'
import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'

import {
  faRecentProjectsListsEqual as faRecentProjectsListsEqualFn,
  trimAndValidateRecentProjectRow
} from './functions/faRecentProjectListSanitize'
import { pathLooksLikeFaProjectFile } from './projectManagementSharedPathWiring'

function entryRowExistsAsFile (filePath: string): boolean {
  const checked = Result.fromThrowable(() => {
    if (!fs.existsSync(filePath)) {
      return false
    }
    return fs.statSync(filePath).isFile()
  }, () => false)()
  return checked.unwrapOr(false)
}

function entryRowsExistAsFiles (rows: readonly I_faRecentProjectEntry[]): I_faRecentProjectEntry[] {
  const out: I_faRecentProjectEntry[] = []
  for (const row of rows) {
    if (!entryRowExistsAsFile(row.filePath)) {
      continue
    }
    out.push(row)
  }
  return out
}

/**
 * Idempotent MRU normalization without dropping missing files (path shape and dedupe only).
 */
export function faRecentProjectsSanitizeStructural (storeBlob: unknown): I_faRecentProjectEntry[] {
  const parsed = parseFaRecentProjectListStored(storeBlob)
  const vetted: I_faRecentProjectEntry[] = []
  for (const row of parsed) {
    const next = trimAndValidateRecentProjectRow(row, pathLooksLikeFaProjectFile)
    if (next !== null) {
      vetted.push(next)
    }
  }
  return faRecentProjectListStructuralNormalize(vetted)
}

/**
 * Idempotent MRU normalization: Zod strip, main path validation, dedupe, cap, drop missing paths.
 */
export function faRecentProjectsSanitizeForPersistence (storeBlob: unknown): I_faRecentProjectEntry[] {
  const structural = faRecentProjectsSanitizeStructural(storeBlob)
  return entryRowsExistAsFiles(structural)
}

export function faRecentProjectsListsEqual (
  a: readonly I_faRecentProjectEntry[],
  b: readonly I_faRecentProjectEntry[]
): boolean {
  return faRecentProjectsListsEqualFn(a, b)
}
