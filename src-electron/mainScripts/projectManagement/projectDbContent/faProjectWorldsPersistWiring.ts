import type Database from 'better-sqlite3'

import { FA_PROJECT_TABLE_WORLDS } from '../functions/faProjectDbSchemaDdl'
import {
  createFaProjectNamedEntity,
  deleteFaProjectNamedEntity,
  getFaProjectNamedEntityById,
  listFaProjectNamedEntities,
  updateFaProjectNamedEntity
} from './faProjectContentNamedEntitySqlWiring'
import type {
  I_faProjectWorld,
  I_faProjectWorldCreateInput,
  I_faProjectWorldListResult,
  I_faProjectWorldPatch
} from 'app/types/I_faProjectWorldDomain'

const WORLD_SPEC = {
  entityLabel: 'World',
  tableName: FA_PROJECT_TABLE_WORLDS
}

export function createFaProjectWorld (
  db: Database,
  input: I_faProjectWorldCreateInput
): I_faProjectWorld {
  return createFaProjectNamedEntity(db, WORLD_SPEC, input.displayName)
}

export function updateFaProjectWorld (
  db: Database,
  id: string,
  patch: I_faProjectWorldPatch
): I_faProjectWorld {
  return updateFaProjectNamedEntity(db, WORLD_SPEC, id, patch.displayName)
}

export function deleteFaProjectWorld (db: Database, id: string): void {
  deleteFaProjectNamedEntity(db, WORLD_SPEC, id)
}

export function getFaProjectWorldById (db: Database, id: string): I_faProjectWorld {
  return getFaProjectNamedEntityById(db, WORLD_SPEC, id)
}

export function listFaProjectWorlds (db: Database): I_faProjectWorldListResult {
  return { items: listFaProjectNamedEntities(db, WORLD_SPEC) }
}
