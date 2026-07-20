/** How the workspace hierarchy tree requested opening a document tab. */
export type T_faOpenedDocumentOpenMode = 'leftNavigate' | 'middleBackground'

/**
 * Whether an opened document tab is backed by SQLite or exists only in session until first save.
 */
export type T_faOpenedDocumentPersistenceState = 'temporary' | 'persisted'

/**
 * Default editState for newly opened document tabs and legacy snapshot rows.
 * false = preview (viewing) mode; true = edit mode.
 */
export const FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE = false

/** Current opened_documents.snapshot_json schema version written by the app. */
export const FA_OPENED_DOCUMENTS_SNAPSHOT_SCHEMA_VERSION = 2

/** Partial compare input for opened-document tab unsaved detection. */
export interface I_openedDocumentTabUnsavedCompareInput {
  displayNameDraft: string
  savedDisplayName: string
  documentTextColorDraft: string
  savedDocumentTextColor: string
  documentBackgroundColorDraft: string
  savedDocumentBackgroundColor: string
  isCategoryDraft: boolean
  savedIsCategory: boolean
  isFinishedDraft: boolean
  savedIsFinished: boolean
  isMinorDraft: boolean
  savedIsMinor: boolean
  isDeadDraft: boolean
  savedIsDead: boolean
  parentDocumentIdDraft: string
  savedParentDocumentId: string,
  treeOrderNumberDraft: string
  savedTreeOrderNumber: number
}

/** One open document tab in the workspace session. */
export interface I_faOpenedDocumentTab {
  documentId: string
  persistenceState: T_faOpenedDocumentPersistenceState
  /** World id for tab world indicator and temporary create flows. */
  worldId?: string | undefined
  /** Set when persistenceState is temporary. */
  templateId?: string | undefined
  /** Set when persistenceState is temporary. */
  parentDocumentId?: string | null | undefined
  /**
   * Ordered ancestor document ids from intended parent upward; used to resolve parent at first save
   * when the intended parent was deleted before persist.
   */
  temporaryParentResolveDocumentIds?: readonly string[] | undefined
  tabLabel: string
  templateIcon: string
  displayNameDraft: string
  savedDisplayName: string
  documentTextColorDraft: string
  savedDocumentTextColor: string
  documentBackgroundColorDraft: string
  savedDocumentBackgroundColor: string
  isCategoryDraft: boolean
  savedIsCategory: boolean
  isFinishedDraft: boolean
  savedIsFinished: boolean
  isMinorDraft: boolean
  savedIsMinor: boolean
  isDeadDraft: boolean
  savedIsDead: boolean
  /** Empty string = placement root (null parent in SQLite). */
  parentDocumentIdDraft: string
  /** Empty string = placement root (null parent in SQLite). */
  savedParentDocumentId: string
  /** Empty string = no order number (empty sentinel in SQLite). */
  treeOrderNumberDraft: string
  savedTreeOrderNumber: number
  hasUnsavedChanges: boolean
  /**
   * Per-tab workspace edit mode. false = preview (read-only presentation);
   * true = edit mode (editable inputs). New tabs start in preview mode.
   */
  editState: boolean
}

/** Programmatic create input for a temporary opened document tab. */
export interface I_faTemporaryOpenedDocumentCreateInput {
  displayName: string
  worldId: string
  templateId: string
  parentDocumentId?: string | null | undefined
  documentId?: string | undefined
  openMode?: T_faOpenedDocumentOpenMode | undefined
  temporaryParentResolveDocumentIds?: readonly string[] | undefined
}

/** Tree row metadata captured when a tab is opened from the hierarchy sidebar. */
export interface I_faOpenedDocumentTreeOpenMeta {
  tabLabel: string
  templateIcon: string
}

/** Persisted opened-documents workspace snapshot (opened_documents.snapshot_json). */
export interface I_faOpenedDocumentsSnapshot {
  schemaVersion: 1 | 2
  activeDocumentId: string | null
  tabs: I_faOpenedDocumentTab[]
}

/** Empty snapshot used when no opened_documents row exists yet. */
export const FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT: I_faOpenedDocumentsSnapshot = {
  schemaVersion: FA_OPENED_DOCUMENTS_SNAPSHOT_SCHEMA_VERSION,
  activeDocumentId: null,
  tabs: []
}
