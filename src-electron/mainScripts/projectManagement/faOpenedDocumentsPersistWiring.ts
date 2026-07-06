import type Database from 'better-sqlite3'

import type { I_faOpenedDocumentsSnapshot } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT } from 'app/types/I_faOpenedDocumentsDomain'
import {
  parseFaOpenedDocumentsSnapshotJson,
  serializeFaOpenedDocumentsSnapshotJson
} from 'app/src-electron/shared/faOpenedDocumentsSnapshotSchema'
import { FA_PROJECT_TABLE_OPENED_DOCUMENTS } from './functions/faProjectDbSchemaDdl'

const FA_OPENED_DOCUMENTS_SINGLETON_ROW_ID = 1

function duplicateFaOpenedDocumentsSnapshot (
  snapshot: I_faOpenedDocumentsSnapshot
): I_faOpenedDocumentsSnapshot {
  return {
    schemaVersion: snapshot.schemaVersion,
    activeDocumentId: snapshot.activeDocumentId,
    tabs: snapshot.tabs.map((tab) => ({ ...tab }))
  }
}

/**
 * Reads persisted opened documents snapshot from the opened_documents table.
 */
export function readFaProjectOpenedDocumentsSnapshot (
  db: Database
): I_faOpenedDocumentsSnapshot {
  const row = db
    .prepare(
      `SELECT snapshot_json AS snapshotJson FROM ${FA_PROJECT_TABLE_OPENED_DOCUMENTS} WHERE id = ?`
    )
    .get(FA_OPENED_DOCUMENTS_SINGLETON_ROW_ID) as { snapshotJson?: string } | undefined
  const raw = row?.snapshotJson
  if (raw === undefined || raw.length === 0) {
    return duplicateFaOpenedDocumentsSnapshot(FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT)
  }
  return duplicateFaOpenedDocumentsSnapshot(parseFaOpenedDocumentsSnapshotJson(raw))
}

/**
 * Upserts the singleton opened_documents snapshot row for the active project file.
 */
export function upsertFaProjectOpenedDocumentsSnapshot (
  db: Database,
  snapshot: I_faOpenedDocumentsSnapshot
): void {
  const serialized = serializeFaOpenedDocumentsSnapshotJson(snapshot)
  const updatedAtMs = Date.now()
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_OPENED_DOCUMENTS} (id, snapshot_json, updated_at_ms) ` +
      'VALUES (?, ?, ?) ' +
      'ON CONFLICT(id) DO UPDATE SET snapshot_json = excluded.snapshot_json, ' +
      'updated_at_ms = excluded.updated_at_ms'
  ).run(FA_OPENED_DOCUMENTS_SINGLETON_ROW_ID, serialized, updatedAtMs)
}

/**
 * Clears the opened documents snapshot row (project close without preserving tabs).
 */
export function clearFaProjectOpenedDocumentsSnapshot (db: Database): void {
  db.prepare(`DELETE FROM ${FA_PROJECT_TABLE_OPENED_DOCUMENTS} WHERE id = ?`).run(
    FA_OPENED_DOCUMENTS_SINGLETON_ROW_ID
  )
}
