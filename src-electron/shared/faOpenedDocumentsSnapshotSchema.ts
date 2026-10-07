import { Result } from 'neverthrow'
import { z } from 'zod'

import type { I_faOpenedDocumentsSnapshot } from 'app/types/I_faOpenedDocumentsDomain'
import {
  FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT,
  FA_OPENED_DOCUMENTS_SNAPSHOT_SCHEMA_VERSION
} from 'app/types/I_faOpenedDocumentsDomain'
import {
  normalizeOpenedDocumentTabAppearanceColors,
  normalizeOpenedDocumentTabEditState,
  normalizeOpenedDocumentTabPersistenceState
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'

const faOpenedDocumentTabSchema = z.object({
  documentId: z.string().min(1).max(64),
  persistenceState: z.enum(['temporary', 'persisted']).default('persisted'),
  worldId: z.string().min(1).max(64).optional(),
  templateId: z.string().min(1).max(64).optional(),
  parentDocumentId: z.union([
    z.string().min(1).max(64),
    z.null()
  ]).optional(),
  placementId: z.union([
    z.string().min(1).max(64),
    z.null()
  ]).optional(),
  temporaryParentResolveDocumentIds: z.array(
    z.string().min(1).max(64)
  ).optional(),
  tabLabel: z.string(),
  templateIcon: z.string().max(128),
  displayNameDraft: z.string(),
  savedDisplayName: z.string(),
  documentTextColorDraft: z.string().max(7).optional(),
  savedDocumentTextColor: z.string().max(7).optional(),
  documentBackgroundColorDraft: z.string().max(7).optional(),
  savedDocumentBackgroundColor: z.string().max(7).optional(),
  isCategoryDraft: z.boolean().optional(),
  savedIsCategory: z.boolean().optional(),
  isFinishedDraft: z.boolean().optional(),
  savedIsFinished: z.boolean().optional(),
  isMinorDraft: z.boolean().optional(),
  savedIsMinor: z.boolean().optional(),
  isDeadDraft: z.boolean().optional(),
  savedIsDead: z.boolean().optional(),
  parentDocumentIdDraft: z.string().optional(),
  savedParentDocumentId: z.string().max(64).optional(),
  treeOrderNumberDraft: z.string().optional(),
  savedTreeOrderNumber: z.number().optional(),
  extraClassesDraft: z.string().optional(),
  savedExtraClasses: z.string().optional(),
  tagsDraft: z.array(z.object({
    id: z.string().min(1).max(64),
    name: z.string(),
    isNew: z.boolean().optional()
  }).strict()).optional(),
  savedTags: z.array(z.object({
    id: z.string().min(1).max(64),
    name: z.string()
  }).strict()).optional(),
  hasUnsavedChanges: z.boolean(),
  editState: z.boolean().default(false)
}).strict().superRefine((tab, context) => {
  if (tab.persistenceState !== 'temporary') {
    return
  }
  if (tab.worldId === undefined) {
    context.addIssue({
      code: 'custom',
      message: 'Temporary opened document tabs require worldId',
      path: ['worldId']
    })
  }
  if (tab.templateId === undefined) {
    context.addIssue({
      code: 'custom',
      message: 'Temporary opened document tabs require templateId',
      path: ['templateId']
    })
  }
})

const faOpenedDocumentsSnapshotSchemaV1 = z.object({
  schemaVersion: z.literal(1),
  activeDocumentId: z.string().min(1).max(64).nullable(),
  tabs: z.array(faOpenedDocumentTabSchema)
}).strict()

const faOpenedDocumentsSnapshotSchemaV2 = z.object({
  schemaVersion: z.literal(2),
  activeDocumentId: z.string().min(1).max(64).nullable(),
  tabs: z.array(faOpenedDocumentTabSchema)
}).strict()

export const faOpenedDocumentsSnapshotSchema = z.union([
  faOpenedDocumentsSnapshotSchemaV1,
  faOpenedDocumentsSnapshotSchemaV2
])

function normalizeParsedOpenedDocumentsSnapshot (
  snapshot: I_faOpenedDocumentsSnapshot
): I_faOpenedDocumentsSnapshot {
  const activeDocumentId = snapshot.activeDocumentId
  const schemaVersion = FA_OPENED_DOCUMENTS_SNAPSHOT_SCHEMA_VERSION
  const tabs = snapshot.tabs
    .map(normalizeOpenedDocumentTabPersistenceState)
    .map(normalizeOpenedDocumentTabAppearanceColors)
    .map(normalizeOpenedDocumentTabEditState)
  return {
    activeDocumentId,
    schemaVersion,
    tabs
  }
}

/**
 * Parses persisted opened_documents.snapshot_json from the project SQLite table.
 */
export function parseFaOpenedDocumentsSnapshotJson (
  raw: string
): I_faOpenedDocumentsSnapshot {
  const parsed = Result.fromThrowable(
    () => JSON.parse(raw) as unknown,
    () => undefined
  )().unwrapOr(undefined)
  if (parsed === undefined) {
    const tabs: I_faOpenedDocumentsSnapshot['tabs'] = []
    return {
      ...FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT,
      tabs
    }
  }
  const validated = faOpenedDocumentsSnapshotSchema.parse(parsed) as I_faOpenedDocumentsSnapshot
  return normalizeParsedOpenedDocumentsSnapshot(validated)
}

/**
 * Serializes opened documents snapshot for SQLite storage.
 */
export function serializeFaOpenedDocumentsSnapshotJson (
  snapshot: I_faOpenedDocumentsSnapshot
): string {
  const normalizedSnapshot: I_faOpenedDocumentsSnapshot = {
    activeDocumentId: snapshot.activeDocumentId,
    schemaVersion: FA_OPENED_DOCUMENTS_SNAPSHOT_SCHEMA_VERSION,
    tabs: snapshot.tabs
      .map(normalizeOpenedDocumentTabPersistenceState)
      .map(normalizeOpenedDocumentTabAppearanceColors)
      .map(normalizeOpenedDocumentTabEditState)
  }
  const validated = faOpenedDocumentsSnapshotSchemaV2.parse(normalizedSnapshot)
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
  const validated = faOpenedDocumentsSnapshotSchema.parse(payload) as I_faOpenedDocumentsSnapshot
  return normalizeParsedOpenedDocumentsSnapshot(validated)
}
