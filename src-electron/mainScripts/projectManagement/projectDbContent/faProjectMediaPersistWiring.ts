import type Database from 'better-sqlite3'

import { FA_PROJECT_TABLE_MEDIA } from '../functions/faProjectDbSchemaDdl'
import {
  createFaProjectNamedEntity,
  deleteFaProjectNamedEntity,
  getFaProjectNamedEntityById,
  listFaProjectNamedEntities,
  updateFaProjectNamedEntity
} from './faProjectContentNamedEntitySqlWiring'
import type {
  I_faProjectMedia,
  I_faProjectMediaCreateInput,
  I_faProjectMediaListResult,
  I_faProjectMediaPatch
} from 'app/types/I_faProjectMediaDomain'

const MEDIA_SPEC = {
  entityLabel: 'Media',
  tableName: FA_PROJECT_TABLE_MEDIA
}

export function createFaProjectMedia (
  db: Database,
  input: I_faProjectMediaCreateInput
): I_faProjectMedia {
  return createFaProjectNamedEntity(db, MEDIA_SPEC, input.displayName)
}

export function updateFaProjectMedia (
  db: Database,
  id: string,
  patch: I_faProjectMediaPatch
): I_faProjectMedia {
  return updateFaProjectNamedEntity(db, MEDIA_SPEC, id, patch.displayName)
}

export function deleteFaProjectMedia (db: Database, id: string): void {
  deleteFaProjectNamedEntity(db, MEDIA_SPEC, id)
}

export function getFaProjectMediaById (db: Database, id: string): I_faProjectMedia {
  return getFaProjectNamedEntityById(db, MEDIA_SPEC, id)
}

export function listFaProjectMedia (db: Database): I_faProjectMediaListResult {
  return { items: listFaProjectNamedEntities(db, MEDIA_SPEC) }
}
