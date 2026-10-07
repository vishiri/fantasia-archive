import type Database from 'better-sqlite3'

import {
  FA_PROJECT_MEDIA_EXTERNAL_EMBED_COLUMN,
  FA_PROJECT_MEDIA_EXTERNAL_LINK_COLUMN,
  FA_PROJECT_MEDIA_EXTERNAL_TYPE_COLUMN,
  FA_PROJECT_MEDIA_INTERNAL_LINK_COLUMN,
  FA_PROJECT_MEDIA_INTERNAL_TYPE_COLUMN,
  FA_PROJECT_MEDIA_SELECT_SQL,
  FA_PROJECT_MEDIA_TYPE_COLUMN,
  FA_PROJECT_TABLE_MEDIA
} from '../functions/faProjectDbSchemaDdl'
import { mapFaProjectMediaRow } from '../functions/faProjectContentRowMap'
import {
  createFaProjectNamedEntity,
  deleteFaProjectNamedEntity,
  updateFaProjectNamedEntity
} from './faProjectContentNamedEntitySqlWiring'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import type { I_faSqlMediaRow } from 'app/types/I_faProjectContentRowMap'
import type {
  I_faProjectMedia,
  I_faProjectMediaCreateInput,
  I_faProjectMediaListResult,
  I_faProjectMediaPatch,
  I_faProjectMediaUpsertItem
} from 'app/types/I_faProjectMediaDomain'

const MEDIA_SPEC = {
  entityLabel: 'Media',
  tableName: FA_PROJECT_TABLE_MEDIA
}

const MEDIA_SELECT_BY_ID_SQL =
  `SELECT ${FA_PROJECT_MEDIA_SELECT_SQL} FROM ${FA_PROJECT_TABLE_MEDIA} WHERE id = ?`

const MEDIA_LIST_SQL =
  `SELECT ${FA_PROJECT_MEDIA_SELECT_SQL} FROM ${FA_PROJECT_TABLE_MEDIA} ` +
  'ORDER BY created_at_ms DESC, rowid DESC'

const MEDIA_EXISTS_SQL =
  `SELECT id FROM ${FA_PROJECT_TABLE_MEDIA} WHERE id = ?`

const MEDIA_INSERT_SQL =
  `INSERT INTO ${FA_PROJECT_TABLE_MEDIA} (` +
  'id, display_name, ' +
  `${FA_PROJECT_MEDIA_TYPE_COLUMN}, ${FA_PROJECT_MEDIA_INTERNAL_TYPE_COLUMN}, ` +
  `${FA_PROJECT_MEDIA_EXTERNAL_TYPE_COLUMN}, ${FA_PROJECT_MEDIA_EXTERNAL_LINK_COLUMN}, ` +
  `${FA_PROJECT_MEDIA_EXTERNAL_EMBED_COLUMN}, ${FA_PROJECT_MEDIA_INTERNAL_LINK_COLUMN}, ` +
  'created_at_ms, updated_at_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'

const MEDIA_UPDATE_SQL =
  `UPDATE ${FA_PROJECT_TABLE_MEDIA} SET display_name = ?, ` +
  `${FA_PROJECT_MEDIA_TYPE_COLUMN} = ?, ${FA_PROJECT_MEDIA_INTERNAL_TYPE_COLUMN} = ?, ` +
  `${FA_PROJECT_MEDIA_EXTERNAL_TYPE_COLUMN} = ?, ${FA_PROJECT_MEDIA_EXTERNAL_LINK_COLUMN} = ?, ` +
  `${FA_PROJECT_MEDIA_EXTERNAL_EMBED_COLUMN} = ?, ${FA_PROJECT_MEDIA_INTERNAL_LINK_COLUMN} = ?, ` +
  'updated_at_ms = ? WHERE id = ?'

function assertMediaRowExists (
  row: I_faSqlMediaRow | undefined,
  id: string
): I_faSqlMediaRow {
  if (row === undefined) {
    throw new FaProjectContentNotFoundError(MEDIA_SPEC.entityLabel, id)
  }
  return row
}

function getFaProjectMediaSqlRowById (db: Database, id: string): I_faSqlMediaRow {
  const row = db.prepare(MEDIA_SELECT_BY_ID_SQL).get(id) as I_faSqlMediaRow | undefined
  return assertMediaRowExists(row, id)
}

function readFaProjectMediaExists (db: Database, id: string): boolean {
  const row = db.prepare(MEDIA_EXISTS_SQL).get(id) as { id: string } | undefined
  return row !== undefined
}

function insertFaProjectMediaRow (
  db: Database,
  item: I_faProjectMediaUpsertItem,
  nowMs: number
): void {
  db.prepare(MEDIA_INSERT_SQL).run(
    item.id,
    item.displayName,
    item.type,
    item.internalType,
    item.externalType,
    item.externalLink,
    item.externalEmbed,
    item.internalLink,
    nowMs,
    nowMs
  )
}

function updateFaProjectMediaRow (
  db: Database,
  item: I_faProjectMediaUpsertItem,
  nowMs: number
): void {
  db.prepare(MEDIA_UPDATE_SQL).run(
    item.displayName,
    item.type,
    item.internalType,
    item.externalType,
    item.externalLink,
    item.externalEmbed,
    item.internalLink,
    nowMs,
    item.id
  )
}

export function createFaProjectMedia (
  db: Database,
  input: I_faProjectMediaCreateInput
): I_faProjectMedia {
  const created = createFaProjectNamedEntity(db, MEDIA_SPEC, input.displayName)
  return mapFaProjectMediaRow(getFaProjectMediaSqlRowById(db, created.id))
}

export function updateFaProjectMedia (
  db: Database,
  id: string,
  patch: I_faProjectMediaPatch
): I_faProjectMedia {
  updateFaProjectNamedEntity(db, MEDIA_SPEC, id, patch.displayName)
  return mapFaProjectMediaRow(getFaProjectMediaSqlRowById(db, id))
}

export function deleteFaProjectMedia (db: Database, id: string): void {
  deleteFaProjectNamedEntity(db, MEDIA_SPEC, id)
}

export function getFaProjectMediaById (db: Database, id: string): I_faProjectMedia {
  return mapFaProjectMediaRow(getFaProjectMediaSqlRowById(db, id))
}

export function listFaProjectMedia (db: Database): I_faProjectMediaListResult {
  const rows = db.prepare(MEDIA_LIST_SQL).all() as I_faSqlMediaRow[]
  const items = rows.map(mapFaProjectMediaRow)
  return { items }
}

export function upsertFaProjectMedia (
  db: Database,
  item: I_faProjectMediaUpsertItem
): I_faProjectMedia {
  const nowMs = Date.now()
  if (readFaProjectMediaExists(db, item.id)) {
    updateFaProjectMediaRow(db, item, nowMs)
  } else {
    insertFaProjectMediaRow(db, item, nowMs)
  }
  return mapFaProjectMediaRow(getFaProjectMediaSqlRowById(db, item.id))
}

export function upsertFaProjectMediaMany (
  db: Database,
  items: I_faProjectMediaUpsertItem[]
): I_faProjectMediaListResult {
  const persistAll = db.transaction(() => {
    return items.map((item) => upsertFaProjectMedia(db, item))
  })
  const mappedItems = persistAll()
  return { items: mappedItems }
}
