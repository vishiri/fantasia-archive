import type Database from 'better-sqlite3'

import {
  deleteFaProjectWorldRow,
  getFaProjectWorldRowById,
  insertFaProjectWorld,
  listFaProjectWorldRows,
  updateFaProjectWorldRow
} from './faProjectWorldsSqlWiring'
import type {
  I_faProjectWorld,
  I_faProjectWorldCreateInput,
  I_faProjectWorldListResult,
  I_faProjectWorldPatch
} from 'app/types/I_faProjectWorldDomain'

export function createFaProjectWorld (
  db: Database,
  input: I_faProjectWorldCreateInput
): I_faProjectWorld {
  return insertFaProjectWorld(db, input.displayName)
}

export function updateFaProjectWorld (
  db: Database,
  id: string,
  patch: I_faProjectWorldPatch
): I_faProjectWorld {
  return updateFaProjectWorldRow(db, id, patch.displayName)
}

export function deleteFaProjectWorld (db: Database, id: string): void {
  deleteFaProjectWorldRow(db, id)
}

export function getFaProjectWorldById (db: Database, id: string): I_faProjectWorld {
  return getFaProjectWorldRowById(db, id)
}

export function listFaProjectWorlds (db: Database): I_faProjectWorldListResult {
  return { items: listFaProjectWorldRows(db) }
}
