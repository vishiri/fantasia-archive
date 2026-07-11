import type Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'

import { FA_PROJECT_TABLE_DOCUMENTS } from '../functions/faProjectDbSchemaDdl'
import { assertFaProjectNamedEntityExists } from './faProjectContentNamedEntitySqlWiring'

const DOCUMENT_ENTITY_LABEL = 'Document'

export function resolveFaProjectDocumentIdForCreate (
  db: Database,
  requestedId: string | undefined
): string {
  if (requestedId !== undefined) {
    const existingRow = db
      .prepare(`SELECT id FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`)
      .get(requestedId) as { id: string } | undefined
    if (existingRow === undefined) {
      return requestedId
    }
  }
  return uuidv4()
}

export function validateDocumentParentForeignKey (
  db: Database,
  parentDocumentId: string | null
): void {
  if (parentDocumentId === null) {
    return
  }
  assertFaProjectNamedEntityExists(db, {
    entityLabel: DOCUMENT_ENTITY_LABEL,
    tableName: FA_PROJECT_TABLE_DOCUMENTS
  }, parentDocumentId)
}
