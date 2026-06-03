import type Database from 'better-sqlite3'

import {
  FA_PROJECT_TABLE_DOCUMENT_MEDIA,
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_MEDIA
} from '../functions/faProjectDbSchemaDdl'
import { mapFaProjectNamedEntityRow } from '../functions/faProjectContentRowMap'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import {
  assertFaProjectNamedEntityExists
} from './faProjectContentNamedEntitySqlWiring'
import type { I_faProjectDocumentMediaListResult } from 'app/types/I_faProjectContentLinksDomain'
import type { I_faSqlNamedEntityRow } from 'app/types/I_faProjectContentRowMap'

const MEDIA_SPEC = {
  entityLabel: 'Media',
  tableName: FA_PROJECT_TABLE_MEDIA
}

const DOCUMENT_ENTITY_LABEL = 'Document'

export function linkFaProjectDocumentMedia (
  db: Database,
  documentId: string,
  mediaId: string
): void {
  const doc = db
    .prepare(`SELECT id FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`)
    .get(documentId)
  if (doc === undefined) {
    throw new FaProjectContentNotFoundError(DOCUMENT_ENTITY_LABEL, documentId)
  }
  assertFaProjectNamedEntityExists(db, MEDIA_SPEC, mediaId)
  db.prepare(
    `INSERT OR IGNORE INTO ${FA_PROJECT_TABLE_DOCUMENT_MEDIA} ` +
      '(document_id, media_id) VALUES (?, ?)'
  ).run(
    documentId,
    mediaId
  )
}

export function unlinkFaProjectDocumentMedia (
  db: Database,
  documentId: string,
  mediaId: string
): void {
  db.prepare(
    `DELETE FROM ${FA_PROJECT_TABLE_DOCUMENT_MEDIA} WHERE document_id = ? AND media_id = ?`
  ).run(
    documentId,
    mediaId
  )
}

export function listFaProjectMediaForDocument (
  db: Database,
  documentId: string
): I_faProjectDocumentMediaListResult {
  const doc = db
    .prepare(`SELECT id FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`)
    .get(documentId)
  if (doc === undefined) {
    throw new FaProjectContentNotFoundError(DOCUMENT_ENTITY_LABEL, documentId)
  }
  const rows = db
    .prepare(
      'SELECT m.id, m.display_name, m.created_at_ms, m.updated_at_ms ' +
        'FROM ' + FA_PROJECT_TABLE_MEDIA + ' m ' +
        'INNER JOIN ' + FA_PROJECT_TABLE_DOCUMENT_MEDIA + ' dm ON dm.media_id = m.id ' +
        'WHERE dm.document_id = ? ' +
        'ORDER BY m.display_name COLLATE NOCASE ASC, m.created_at_ms ASC'
    )
    .all(documentId) as I_faSqlNamedEntityRow[]
  return { items: rows.map(mapFaProjectNamedEntityRow) }
}
