import type Database from 'better-sqlite3'

import type {
  I_faProjectDialogUiPrefGetResult,
  T_faProjectDialogUiPrefKey
} from 'app/types/I_faProjectDialogUiPrefDomain'

import {
  readFaProjectDataKv,
  upsertFaProjectDataKv
} from './faProjectDataKvWiring'

/**
 * Reads one allowlisted dialog UI preference from project_data.
 * Missing or blank values return null.
 */
export function readFaProjectDialogUiPref (
  db: Database,
  key: T_faProjectDialogUiPrefKey
): I_faProjectDialogUiPrefGetResult {
  const raw = readFaProjectDataKv(db, key)
  if (raw === undefined) {
    return {
      key,
      value: null
    }
  }
  const trimmed = raw.trim()
  const value = trimmed.length > 0 ? trimmed : null
  return {
    key,
    value
  }
}

/**
 * Upserts one allowlisted dialog UI preference into project_data.
 */
export function upsertFaProjectDialogUiPref (
  db: Database,
  key: T_faProjectDialogUiPrefKey,
  value: string
): void {
  upsertFaProjectDataKv(db, key, value)
}
