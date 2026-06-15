import type Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'

import { mapFaProjectDocumentTemplateRow } from '../functions/faProjectContentRowMap'
import {
  FA_PROJECT_DOCUMENT_TEMPLATE_ICON_MAX_LENGTH,
  FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_MAX_LENGTH,
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES
} from '../functions/faProjectDbSchemaDdl'
import { computeNextFaProjectWorldSortOrder } from '../functions/faProjectWorldSortOrder'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import type {
  I_faProjectDocumentTemplate,
  I_faProjectDocumentTemplateRowUpsertFields
} from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faSqlDocumentTemplateRow } from 'app/types/I_faProjectContentRowMap'

const DOCUMENT_TEMPLATE_ENTITY_LABEL = 'Document template'

const SQL_SELECT_DOCUMENT_TEMPLATE_COLUMNS =
  'id, display_name, sort_order, world_appendix, icon, created_at_ms, updated_at_ms'

function assertDocumentTemplateRowExists (
  row: I_faSqlDocumentTemplateRow | undefined,
  id: string
): I_faSqlDocumentTemplateRow {
  if (row === undefined) {
    throw new FaProjectContentNotFoundError(DOCUMENT_TEMPLATE_ENTITY_LABEL, id)
  }
  return row
}

function readFaProjectDocumentTemplateMaxSortOrder (db: Database): number | null {
  const row = db
    .prepare(
      `SELECT MAX(sort_order) AS max_sort FROM ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES}`
    )
    .get() as { max_sort: number | null } | undefined
  return row?.max_sort ?? null
}

export function coerceFaProjectDocumentTemplateOptionalTextForStorage (
  value: string | undefined,
  maxLength: number
): string {
  if (value === undefined) {
    return ''
  }
  return value.trim().slice(0, maxLength)
}

export function listFaProjectDocumentTemplateDocumentCounts (
  db: Database
): Record<string, number> {
  const rows = db
    .prepare(
      `SELECT template_id, COUNT(*) AS c FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        'WHERE template_id IS NOT NULL GROUP BY template_id'
    )
    .all() as Array<{ template_id: string, c: number }>
  const counts: Record<string, number> = {}
  for (const row of rows) {
    counts[row.template_id] = row.c
  }
  return counts
}

export function listFaProjectDocumentTemplateIds (db: Database): string[] {
  const rows = db
    .prepare(`SELECT id FROM ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES}`)
    .all() as Array<{ id: string }>
  return rows.map((row) => row.id)
}

export function insertFaProjectDocumentTemplate (
  db: Database,
  displayName: string,
  optional?: {
    icon?: string
    worldAppendix?: string
  }
): I_faProjectDocumentTemplate {
  const nowMs = Date.now()
  const id = uuidv4()
  const sortOrder = computeNextFaProjectWorldSortOrder(
    readFaProjectDocumentTemplateMaxSortOrder(db)
  )
  const worldAppendix = coerceFaProjectDocumentTemplateOptionalTextForStorage(
    optional?.worldAppendix,
    FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_MAX_LENGTH
  )
  const icon = coerceFaProjectDocumentTemplateOptionalTextForStorage(
    optional?.icon,
    FA_PROJECT_DOCUMENT_TEMPLATE_ICON_MAX_LENGTH
  )
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} ` +
      '(id, display_name, sort_order, world_appendix, icon, created_at_ms, updated_at_ms) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    id,
    displayName,
    sortOrder,
    worldAppendix,
    icon,
    nowMs,
    nowMs
  )
  const row = db
    .prepare(
      `SELECT ${SQL_SELECT_DOCUMENT_TEMPLATE_COLUMNS} ` +
        `FROM ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} WHERE id = ?`
    )
    .get(id) as I_faSqlDocumentTemplateRow | undefined
  return mapFaProjectDocumentTemplateRow(assertDocumentTemplateRowExists(row, id))
}

export function insertFaProjectDocumentTemplateWithId (
  db: Database,
  fields: I_faProjectDocumentTemplateRowUpsertFields
): I_faProjectDocumentTemplate {
  const nowMs = Date.now()
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} ` +
      '(id, display_name, sort_order, world_appendix, icon, created_at_ms, updated_at_ms) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    fields.id,
    fields.displayName,
    fields.sortOrder,
    fields.worldAppendix,
    fields.icon,
    nowMs,
    nowMs
  )
  const row = db
    .prepare(
      `SELECT ${SQL_SELECT_DOCUMENT_TEMPLATE_COLUMNS} ` +
        `FROM ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} WHERE id = ?`
    )
    .get(fields.id) as I_faSqlDocumentTemplateRow | undefined
  return mapFaProjectDocumentTemplateRow(assertDocumentTemplateRowExists(row, fields.id))
}

export function updateFaProjectDocumentTemplateRow (
  db: Database,
  id: string,
  patch: {
    displayName?: string
    icon?: string
    sortOrder?: number
    worldAppendix?: string
  }
): I_faProjectDocumentTemplate {
  const existing = db
    .prepare(
      `SELECT ${SQL_SELECT_DOCUMENT_TEMPLATE_COLUMNS} ` +
        `FROM ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} WHERE id = ?`
    )
    .get(id) as I_faSqlDocumentTemplateRow | undefined
  assertDocumentTemplateRowExists(existing, id)

  const sets: string[] = []
  const values: Array<string | number> = []
  if (patch.displayName !== undefined) {
    sets.push('display_name = ?')
    values.push(patch.displayName)
  }
  if (patch.worldAppendix !== undefined) {
    sets.push('world_appendix = ?')
    values.push(patch.worldAppendix)
  }
  if (patch.icon !== undefined) {
    sets.push('icon = ?')
    values.push(patch.icon)
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
      `UPDATE ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} SET ${sets.join(', ')} WHERE id = ?`
    ).run(...values)
  }

  const row = db
    .prepare(
      `SELECT ${SQL_SELECT_DOCUMENT_TEMPLATE_COLUMNS} ` +
        `FROM ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} WHERE id = ?`
    )
    .get(id) as I_faSqlDocumentTemplateRow | undefined
  return mapFaProjectDocumentTemplateRow(assertDocumentTemplateRowExists(row, id))
}

export function deleteFaProjectDocumentTemplateRow (db: Database, id: string): void {
  const result = db
    .prepare(`DELETE FROM ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} WHERE id = ?`)
    .run(id)
  if (result.changes === 0) {
    throw new FaProjectContentNotFoundError(DOCUMENT_TEMPLATE_ENTITY_LABEL, id)
  }
}

export function getFaProjectDocumentTemplateRowById (
  db: Database,
  id: string
): I_faProjectDocumentTemplate {
  const row = db
    .prepare(
      `SELECT ${SQL_SELECT_DOCUMENT_TEMPLATE_COLUMNS} ` +
        `FROM ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} WHERE id = ?`
    )
    .get(id) as I_faSqlDocumentTemplateRow | undefined
  return mapFaProjectDocumentTemplateRow(assertDocumentTemplateRowExists(row, id))
}

export function listFaProjectDocumentTemplateRows (
  db: Database
): I_faProjectDocumentTemplate[] {
  const rows = db
    .prepare(
      `SELECT ${SQL_SELECT_DOCUMENT_TEMPLATE_COLUMNS} FROM ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} ` +
        'ORDER BY sort_order ASC, created_at_ms ASC, id ASC'
    )
    .all() as I_faSqlDocumentTemplateRow[]
  return rows.map(mapFaProjectDocumentTemplateRow)
}

export function assertFaProjectDocumentTemplateExists (db: Database, id: string): void {
  const row = db
    .prepare(`SELECT id FROM ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} WHERE id = ?`)
    .get(id)
  if (row === undefined) {
    throw new FaProjectContentNotFoundError(DOCUMENT_TEMPLATE_ENTITY_LABEL, id)
  }
}
