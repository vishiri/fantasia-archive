import type Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'

import { mapFaProjectNamedEntityRow } from '../functions/faProjectContentRowMap'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import type {
  I_faProjectContentNamedEntity,
  I_faProjectNamedEntityTableSpec
} from 'app/types/I_faProjectContentShared'
import type { I_faSqlNamedEntityRow } from 'app/types/I_faProjectContentRowMap'

function assertRowExists (
  row: I_faSqlNamedEntityRow | undefined,
  spec: I_faProjectNamedEntityTableSpec,
  id: string
): I_faSqlNamedEntityRow {
  if (row === undefined) {
    throw new FaProjectContentNotFoundError(spec.entityLabel, id)
  }
  return row
}

export function createFaProjectNamedEntity (
  db: Database,
  spec: I_faProjectNamedEntityTableSpec,
  displayName: string
): I_faProjectContentNamedEntity {
  const nowMs = Date.now()
  const id = uuidv4()
  db.prepare(
    `INSERT INTO ${spec.tableName} (id, display_name, created_at_ms, updated_at_ms) ` +
      'VALUES (?, ?, ?, ?)'
  ).run(
    id,
    displayName,
    nowMs,
    nowMs
  )
  const row = db
    .prepare(
      `SELECT id, display_name, created_at_ms, updated_at_ms FROM ${spec.tableName} WHERE id = ?`
    )
    .get(id) as I_faSqlNamedEntityRow | undefined
  return mapFaProjectNamedEntityRow(assertRowExists(row, spec, id))
}

export function updateFaProjectNamedEntity (
  db: Database,
  spec: I_faProjectNamedEntityTableSpec,
  id: string,
  displayName: string | undefined
): I_faProjectContentNamedEntity {
  const existing = db
    .prepare(
      `SELECT id, display_name, created_at_ms, updated_at_ms FROM ${spec.tableName} WHERE id = ?`
    )
    .get(id) as I_faSqlNamedEntityRow | undefined
  assertRowExists(existing, spec, id)
  if (displayName !== undefined) {
    const nowMs = Date.now()
    db.prepare(
      `UPDATE ${spec.tableName} SET display_name = ?, updated_at_ms = ? WHERE id = ?`
    ).run(
      displayName,
      nowMs,
      id
    )
  }
  const row = db
    .prepare(
      `SELECT id, display_name, created_at_ms, updated_at_ms FROM ${spec.tableName} WHERE id = ?`
    )
    .get(id) as I_faSqlNamedEntityRow | undefined
  return mapFaProjectNamedEntityRow(assertRowExists(row, spec, id))
}

export function deleteFaProjectNamedEntity (
  db: Database,
  spec: I_faProjectNamedEntityTableSpec,
  id: string
): void {
  const result = db
    .prepare(`DELETE FROM ${spec.tableName} WHERE id = ?`)
    .run(id)
  if (result.changes === 0) {
    throw new FaProjectContentNotFoundError(spec.entityLabel, id)
  }
}

export function getFaProjectNamedEntityById (
  db: Database,
  spec: I_faProjectNamedEntityTableSpec,
  id: string
): I_faProjectContentNamedEntity {
  const row = db
    .prepare(
      `SELECT id, display_name, created_at_ms, updated_at_ms FROM ${spec.tableName} WHERE id = ?`
    )
    .get(id) as I_faSqlNamedEntityRow | undefined
  return mapFaProjectNamedEntityRow(assertRowExists(row, spec, id))
}

export function listFaProjectNamedEntities (
  db: Database,
  spec: I_faProjectNamedEntityTableSpec
): I_faProjectContentNamedEntity[] {
  const rows = db
    .prepare(
      `SELECT id, display_name, created_at_ms, updated_at_ms FROM ${spec.tableName} ` +
        'ORDER BY display_name COLLATE NOCASE ASC, created_at_ms ASC'
    )
    .all() as I_faSqlNamedEntityRow[]
  return rows.map(mapFaProjectNamedEntityRow)
}

export function assertFaProjectNamedEntityExists (
  db: Database,
  spec: I_faProjectNamedEntityTableSpec,
  id: string
): void {
  const row = db
    .prepare(`SELECT id FROM ${spec.tableName} WHERE id = ?`)
    .get(id)
  if (row === undefined) {
    throw new FaProjectContentNotFoundError(spec.entityLabel, id)
  }
}
