import { z } from 'zod'

import type { I_faOpenedDocumentsSnapshot } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT } from 'app/types/I_faOpenedDocumentsDomain'

const faOpenedDocumentTabSchema = z.object({
  documentId: z.string().min(1).max(64),
  tabLabel: z.string().max(512),
  templateIcon: z.string().max(128),
  displayNameDraft: z.string().max(512),
  savedDisplayName: z.string().max(512),
  hasUnsavedChanges: z.boolean(),
  editState: z.boolean().default(false)
}).strict()

export const faOpenedDocumentsSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  activeDocumentId: z.string().min(1).max(64).nullable(),
  tabs: z.array(faOpenedDocumentTabSchema)
}).strict()

/**
 * Parses persisted opened_documents.snapshot_json from the project SQLite table.
 */
export function parseFaOpenedDocumentsSnapshotJson (
  raw: string
): I_faOpenedDocumentsSnapshot {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {
      ...FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT,
      tabs: []
    }
  }
  return faOpenedDocumentsSnapshotSchema.parse(parsed) as I_faOpenedDocumentsSnapshot
}

/**
 * Serializes opened documents snapshot for SQLite storage.
 */
export function serializeFaOpenedDocumentsSnapshotJson (
  snapshot: I_faOpenedDocumentsSnapshot
): string {
  const validated = faOpenedDocumentsSnapshotSchema.parse(snapshot)
  return JSON.stringify(validated)
}

/**
 * Parses an IPC payload replacing the opened documents snapshot. Throws when invalid.
 */
export function parseFaOpenedDocumentsSnapshotPayload (
  payload: unknown
): I_faOpenedDocumentsSnapshot {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new TypeError('Opened documents snapshot must be a plain object')
  }
  return faOpenedDocumentsSnapshotSchema.parse(payload) as I_faOpenedDocumentsSnapshot
}
