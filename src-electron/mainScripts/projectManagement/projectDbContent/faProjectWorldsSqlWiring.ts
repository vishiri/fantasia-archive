import type Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'

import { mapFaProjectWorldRow } from '../functions/faProjectContentRowMap'
import {
  FA_PROJECT_TABLE_WORLDS,
  FA_PROJECT_WORLD_DEFAULT_COLOR
} from '../functions/faProjectDbSchemaDdl'
import { computeNextFaProjectWorldSortOrder } from '../functions/faProjectWorldSortOrder'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'
import type { I_faSqlWorldRow } from 'app/types/I_faProjectContentRowMap'

const WORLD_ENTITY_LABEL = 'World'

const SQL_SELECT_WORLD_COLUMNS =
  'id, display_name, color, sort_order, created_at_ms, updated_at_ms'

function assertWorldRowExists (
  row: I_faSqlWorldRow | undefined,
  id: string
): I_faSqlWorldRow {
  if (row === undefined) {
    throw new FaProjectContentNotFoundError(WORLD_ENTITY_LABEL, id)
  }
  return row
}

function readFaProjectWorldMaxSortOrder (db: Database): number | null {
  const row = db
    .prepare(`SELECT MAX(sort_order) AS max_sort FROM ${FA_PROJECT_TABLE_WORLDS}`)
    .get() as { max_sort: number | null } | undefined
  return row?.max_sort ?? null
}

export function countFaProjectWorlds (db: Database): number {
  const row = db
    .prepare(`SELECT COUNT(*) AS c FROM ${FA_PROJECT_TABLE_WORLDS}`)
    .get() as { c: number }
  return row.c
}

export function insertFaProjectWorld (
  db: Database,
  displayName: string
): I_faProjectWorld {
  const nowMs = Date.now()
  const id = uuidv4()
  const sortOrder = computeNextFaProjectWorldSortOrder(readFaProjectWorldMaxSortOrder(db))
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_WORLDS} ` +
      '(id, display_name, color, sort_order, created_at_ms, updated_at_ms) ' +
      'VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    id,
    displayName,
    FA_PROJECT_WORLD_DEFAULT_COLOR,
    sortOrder,
    nowMs,
    nowMs
  )
  const row = db
    .prepare(
      `SELECT ${SQL_SELECT_WORLD_COLUMNS} FROM ${FA_PROJECT_TABLE_WORLDS} WHERE id = ?`
    )
    .get(id) as I_faSqlWorldRow | undefined
  return mapFaProjectWorldRow(assertWorldRowExists(row, id))
}

export function updateFaProjectWorldRow (
  db: Database,
  id: string,
  displayName: string | undefined
): I_faProjectWorld {
  const existing = db
    .prepare(
      `SELECT ${SQL_SELECT_WORLD_COLUMNS} FROM ${FA_PROJECT_TABLE_WORLDS} WHERE id = ?`
    )
    .get(id) as I_faSqlWorldRow | undefined
  assertWorldRowExists(existing, id)
  if (displayName !== undefined) {
    const nowMs = Date.now()
    db.prepare(
      `UPDATE ${FA_PROJECT_TABLE_WORLDS} SET display_name = ?, updated_at_ms = ? WHERE id = ?`
    ).run(
      displayName,
      nowMs,
      id
    )
  }
  const row = db
    .prepare(
      `SELECT ${SQL_SELECT_WORLD_COLUMNS} FROM ${FA_PROJECT_TABLE_WORLDS} WHERE id = ?`
    )
    .get(id) as I_faSqlWorldRow | undefined
  return mapFaProjectWorldRow(assertWorldRowExists(row, id))
}

export function deleteFaProjectWorldRow (db: Database, id: string): void {
  const result = db
    .prepare(`DELETE FROM ${FA_PROJECT_TABLE_WORLDS} WHERE id = ?`)
    .run(id)
  if (result.changes === 0) {
    throw new FaProjectContentNotFoundError(WORLD_ENTITY_LABEL, id)
  }
}

export function getFaProjectWorldRowById (db: Database, id: string): I_faProjectWorld {
  const row = db
    .prepare(
      `SELECT ${SQL_SELECT_WORLD_COLUMNS} FROM ${FA_PROJECT_TABLE_WORLDS} WHERE id = ?`
    )
    .get(id) as I_faSqlWorldRow | undefined
  return mapFaProjectWorldRow(assertWorldRowExists(row, id))
}

export function listFaProjectWorldRows (db: Database): I_faProjectWorld[] {
  const rows = db
    .prepare(
      `SELECT ${SQL_SELECT_WORLD_COLUMNS} FROM ${FA_PROJECT_TABLE_WORLDS} ` +
        'ORDER BY sort_order ASC, created_at_ms ASC, id ASC'
    )
    .all() as I_faSqlWorldRow[]
  return rows.map(mapFaProjectWorldRow)
}
