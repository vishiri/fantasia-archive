import type Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'

import { mapFaProjectWorldRow } from '../functions/faProjectContentRowMap'
import {
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_WORLDS,
  FA_PROJECT_WORLD_DEFAULT_COLOR,
  FA_PROJECT_WORLD_DEFAULT_COLOR_PALETTE
} from '../functions/faProjectDbSchemaDdl'
import { computeNextFaProjectWorldSortOrder } from '../functions/faProjectWorldSortOrder'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import type {
  I_faProjectWorld,
  I_faProjectWorldRowUpsertFields
} from 'app/types/I_faProjectWorldDomain'
import type { I_faSqlWorldRow } from 'app/types/I_faProjectContentRowMap'

const WORLD_ENTITY_LABEL = 'World'

const SQL_SELECT_WORLD_COLUMNS =
  'id, display_name, color, color_pallete, sort_order, created_at_ms, updated_at_ms'

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

export function listFaProjectWorldDocumentCounts (db: Database): Record<string, number> {
  const rows = db
    .prepare(
      `SELECT world_id, COUNT(*) AS c FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        'GROUP BY world_id'
    )
    .all() as Array<{ world_id: string, c: number }>
  const counts: Record<string, number> = {}
  for (const row of rows) {
    counts[row.world_id] = row.c
  }
  return counts
}

export function listFaProjectWorldIds (db: Database): string[] {
  const rows = db
    .prepare(`SELECT id FROM ${FA_PROJECT_TABLE_WORLDS}`)
    .all() as Array<{ id: string }>
  return rows.map((row) => row.id)
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
      '(id, display_name, color, color_pallete, sort_order, created_at_ms, updated_at_ms) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    id,
    displayName,
    FA_PROJECT_WORLD_DEFAULT_COLOR,
    FA_PROJECT_WORLD_DEFAULT_COLOR_PALETTE,
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

export function insertFaProjectWorldWithId (
  db: Database,
  fields: I_faProjectWorldRowUpsertFields
): I_faProjectWorld {
  const nowMs = Date.now()
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_WORLDS} ` +
      '(id, display_name, color, color_pallete, sort_order, created_at_ms, updated_at_ms) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    fields.id,
    fields.displayName,
    fields.color,
    fields.colorPallete,
    fields.sortOrder,
    nowMs,
    nowMs
  )
  const row = db
    .prepare(
      `SELECT ${SQL_SELECT_WORLD_COLUMNS} FROM ${FA_PROJECT_TABLE_WORLDS} WHERE id = ?`
    )
    .get(fields.id) as I_faSqlWorldRow | undefined
  return mapFaProjectWorldRow(assertWorldRowExists(row, fields.id))
}

export function updateFaProjectWorldRow (
  db: Database,
  id: string,
  patch: {
    color?: string
    colorPallete?: string
    displayName?: string
    sortOrder?: number
  }
): I_faProjectWorld {
  const existing = db
    .prepare(
      `SELECT ${SQL_SELECT_WORLD_COLUMNS} FROM ${FA_PROJECT_TABLE_WORLDS} WHERE id = ?`
    )
    .get(id) as I_faSqlWorldRow | undefined
  assertWorldRowExists(existing, id)

  const sets: string[] = []
  const values: Array<string | number> = []
  if (patch.displayName !== undefined) {
    sets.push('display_name = ?')
    values.push(patch.displayName)
  }
  if (patch.color !== undefined) {
    sets.push('color = ?')
    values.push(patch.color)
  }
  if (patch.colorPallete !== undefined) {
    sets.push('color_pallete = ?')
    values.push(patch.colorPallete)
  }
  if (patch.sortOrder !== undefined) {
    sets.push('sort_order = ?')
    values.push(patch.sortOrder)
  }
  if (sets.length > 0) {
    sets.push('updated_at_ms = ?')
    values.push(Date.now())
    values.push(id)
    db.prepare(
      `UPDATE ${FA_PROJECT_TABLE_WORLDS} SET ${sets.join(', ')} WHERE id = ?`
    ).run(...values)
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
