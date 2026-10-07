import type Database from 'better-sqlite3'

import {
  FA_PROJECT_DOCUMENT_LAST_OPENED_MAX,
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_LAST_OPENED
} from '../functions/faProjectDbSchemaDdl'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'

/**
 * Replaces document_last_opened so a repeat open gets a new rowid, then trims past the MRU max.
 */
export function recordFaProjectDocumentLastOpened (
  db: Database,
  documentId: string
): void {
  const existing = db
    .prepare(`SELECT id FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`)
    .get(documentId) as { id: string } | undefined
  if (existing === undefined) {
    throw new FaProjectContentNotFoundError('Document', documentId)
  }
  const openedAtMs = Date.now()
  const deleteExistingStmt = db.prepare(
    `DELETE FROM ${FA_PROJECT_TABLE_DOCUMENT_LAST_OPENED} WHERE document_id = ?`
  )
  const insertStmt = db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_DOCUMENT_LAST_OPENED} (document_id, opened_at_ms) ` +
      'VALUES (?, ?)'
  )
  const trimStmt = db.prepare(
    `DELETE FROM ${FA_PROJECT_TABLE_DOCUMENT_LAST_OPENED} ` +
      'WHERE rowid NOT IN (' +
      `SELECT rowid FROM ${FA_PROJECT_TABLE_DOCUMENT_LAST_OPENED} ` +
      'ORDER BY opened_at_ms DESC, rowid DESC ' +
      `LIMIT ${FA_PROJECT_DOCUMENT_LAST_OPENED_MAX}` +
      ')'
  )
  const runRecord = db.transaction(() => {
    deleteExistingStmt.run(documentId)
    insertStmt.run(documentId, openedAtMs)
    trimStmt.run()
  })
  runRecord()
}
