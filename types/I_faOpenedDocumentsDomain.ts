/** How the workspace hierarchy tree requested opening a document tab. */
export type T_faOpenedDocumentOpenMode = 'leftNavigate' | 'middleBackground'

/**
 * Default editState for newly opened document tabs and legacy snapshot rows.
 * false = preview (viewing) mode; true = edit mode.
 */
export const FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE = false

/** One open document tab in the workspace session. */
export interface I_faOpenedDocumentTab {
  documentId: string
  tabLabel: string
  templateIcon: string
  displayNameDraft: string
  savedDisplayName: string
  hasUnsavedChanges: boolean
  /**
   * Per-tab workspace edit mode. false = preview (read-only presentation);
   * true = edit mode (editable inputs). New tabs start in preview mode.
   */
  editState: boolean
}

/** Tree row metadata captured when a tab is opened from the hierarchy sidebar. */
export interface I_faOpenedDocumentTreeOpenMeta {
  tabLabel: string
  templateIcon: string
}

/** Persisted opened-documents workspace snapshot (opened_documents.snapshot_json). */
export interface I_faOpenedDocumentsSnapshot {
  schemaVersion: 1
  activeDocumentId: string | null
  tabs: I_faOpenedDocumentTab[]
}

/** Empty snapshot used when no opened_documents row exists yet. */
export const FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT: I_faOpenedDocumentsSnapshot = {
  schemaVersion: 1,
  activeDocumentId: null,
  tabs: []
}
