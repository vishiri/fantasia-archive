import type Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'

import { FA_PROJECT_TABLE_DOCUMENTS } from '../functions/faProjectDbSchemaDdl'
import { mapFaProjectDocumentRow } from '../functions/faProjectContentRowMap'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import {
  assertFaProjectNamedEntityExists
} from './faProjectContentNamedEntitySqlWiring'
import { FA_PROJECT_TABLE_DOCUMENT_TEMPLATES } from '../functions/faProjectDbSchemaDdl'
import { FA_PROJECT_TABLE_WORLDS } from '../functions/faProjectDbSchemaDdl'
import type {
  I_faProjectDocument,
  I_faProjectDocumentCreateInput,
  I_faProjectDocumentListFilter,
  I_faProjectDocumentListResult,
  I_faProjectDocumentPatch
} from 'app/types/I_faProjectDocumentDomain'
import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'

const DOCUMENT_ENTITY_LABEL = 'Document'

const WORLD_SPEC = {
  entityLabel: 'World',
  tableName: FA_PROJECT_TABLE_WORLDS
}

const TEMPLATE_SPEC = {
  entityLabel: 'Document template',
  tableName: FA_PROJECT_TABLE_DOCUMENT_TEMPLATES
}

function selectDocumentSql (): string {
  return (
    'SELECT id, world_id, template_id, display_name, created_at_ms, updated_at_ms ' +
    `FROM ${FA_PROJECT_TABLE_DOCUMENTS}`
  )
}

function assertDocumentRow (
  row: I_faSqlProjectDocumentRow | undefined,
  id: string
): I_faSqlProjectDocumentRow {
  if (row === undefined) {
    throw new FaProjectContentNotFoundError(DOCUMENT_ENTITY_LABEL, id)
  }
  return row
}

function validateDocumentForeignKeys (
  db: Database,
  worldId: string,
  templateId: string | null | undefined
): void {
  assertFaProjectNamedEntityExists(db, WORLD_SPEC, worldId)
  if (templateId !== undefined && templateId !== null) {
    assertFaProjectNamedEntityExists(db, TEMPLATE_SPEC, templateId)
  }
}

export function createFaProjectDocument (
  db: Database,
  input: I_faProjectDocumentCreateInput
): I_faProjectDocument {
  const templateId = input.templateId ?? null
  validateDocumentForeignKeys(db, input.worldId, templateId)
  const nowMs = Date.now()
  const id = uuidv4()
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_DOCUMENTS} ` +
      '(id, world_id, template_id, display_name, created_at_ms, updated_at_ms) ' +
      'VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    id,
    input.worldId,
    templateId,
    input.displayName,
    nowMs,
    nowMs
  )
  return getFaProjectDocumentById(db, id)
}

export function updateFaProjectDocument (
  db: Database,
  id: string,
  patch: I_faProjectDocumentPatch
): I_faProjectDocument {
  const existingRow = assertDocumentRow(
    db
      .prepare(`${selectDocumentSql()} WHERE id = ?`)
      .get(id) as I_faSqlProjectDocumentRow | undefined,
    id
  )
  const nextWorldId = patch.worldId ?? existingRow.world_id
  const nextTemplateId = patch.templateId !== undefined
    ? patch.templateId
    : existingRow.template_id
  validateDocumentForeignKeys(db, nextWorldId, nextTemplateId)
  const nextDisplayName = patch.displayName ?? existingRow.display_name
  const nowMs = Date.now()
  db.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET world_id = ?, template_id = ?, ` +
      'display_name = ?, updated_at_ms = ? WHERE id = ?'
  ).run(
    nextWorldId,
    nextTemplateId,
    nextDisplayName,
    nowMs,
    id
  )
  return getFaProjectDocumentById(db, id)
}

export function deleteFaProjectDocument (db: Database, id: string): void {
  const result = db
    .prepare(`DELETE FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`)
    .run(id)
  if (result.changes === 0) {
    throw new FaProjectContentNotFoundError(DOCUMENT_ENTITY_LABEL, id)
  }
}

export function getFaProjectDocumentById (
  db: Database,
  id: string
): I_faProjectDocument {
  const row = db
    .prepare(`${selectDocumentSql()} WHERE id = ?`)
    .get(id) as I_faSqlProjectDocumentRow | undefined
  return mapFaProjectDocumentRow(assertDocumentRow(row, id))
}

export function listFaProjectDocuments (
  db: Database,
  filter?: I_faProjectDocumentListFilter
): I_faProjectDocumentListResult {
  const worldId = filter?.worldId
  let rows: I_faSqlProjectDocumentRow[]
  if (worldId !== undefined) {
    rows = db
      .prepare(
        `${selectDocumentSql()} WHERE world_id = ? ` +
          'ORDER BY display_name COLLATE NOCASE ASC, created_at_ms ASC'
      )
      .all(worldId) as I_faSqlProjectDocumentRow[]
  } else {
    rows = db
      .prepare(
        `${selectDocumentSql()} ORDER BY display_name COLLATE NOCASE ASC, created_at_ms ASC`
      )
      .all() as I_faSqlProjectDocumentRow[]
  }
  return { items: rows.map(mapFaProjectDocumentRow) }
}

export function setFaProjectDocumentWorld (
  db: Database,
  documentId: string,
  worldId: string
): I_faProjectDocument {
  return updateFaProjectDocument(db, documentId, { worldId })
}

export function setFaProjectDocumentTemplate (
  db: Database,
  documentId: string,
  templateId: string | null
): I_faProjectDocument {
  return updateFaProjectDocument(db, documentId, { templateId })
}
