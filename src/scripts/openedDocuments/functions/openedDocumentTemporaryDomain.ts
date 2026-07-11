import type {
  I_faOpenedDocumentTab,
  I_faTemporaryOpenedDocumentCreateInput,
  T_faOpenedDocumentPersistenceState
} from 'app/types/I_faOpenedDocumentsDomain'

/**
 * Whether the tab exists only in session until first save.
 */
export function resolveOpenedDocumentTabIsTemporary (
  persistenceState: T_faOpenedDocumentPersistenceState
): boolean {
  return persistenceState === 'temporary'
}

/**
 * Whether the tab is backed by a SQLite documents row.
 */
export function resolveOpenedDocumentTabIsPersisted (
  persistenceState: T_faOpenedDocumentPersistenceState
): boolean {
  return persistenceState === 'persisted'
}

/**
 * Ensures tab rows loaded from persistence always carry a defined persistenceState baseline.
 */
export function normalizeOpenedDocumentTabPersistenceState (
  tab: I_faOpenedDocumentTab
): I_faOpenedDocumentTab {
  const persistenceState = tab.persistenceState ?? 'persisted'
  if (persistenceState === 'temporary') {
    return {
      ...tab,
      parentDocumentId: tab.parentDocumentId ?? null,
      persistenceState,
      templateId: tab.templateId,
      worldId: tab.worldId
    }
  }

  return {
    ...tab,
    persistenceState
  }
}

/**
 * Seeds a temporary opened document tab in edit mode with unsaved changes.
 */
export function createTemporaryOpenedDocumentTabSeed (input: {
  displayName: string
  documentId: string
  parentDocumentId: string | null
  tabLabel: string
  templateIcon: string
  templateId: string
  worldId: string
}): I_faOpenedDocumentTab {
  return {
    displayNameDraft: input.displayName,
    documentId: input.documentId,
    editState: true,
    hasUnsavedChanges: true,
    parentDocumentId: input.parentDocumentId,
    persistenceState: 'temporary',
    savedDisplayName: '',
    tabLabel: input.tabLabel,
    templateIcon: input.templateIcon,
    templateId: input.templateId,
    worldId: input.worldId
  }
}

/**
 * Updates parent placement metadata on a temporary tab.
 */
export function applyTemporaryOpenedDocumentParent (
  tab: I_faOpenedDocumentTab,
  parentDocumentId: string | null
): I_faOpenedDocumentTab {
  return {
    ...tab,
    parentDocumentId
  }
}

/**
 * Promotes a temporary tab to persisted after createDocument succeeds.
 */
export function promoteTemporaryOpenedDocumentTabAfterCreate (
  tab: I_faOpenedDocumentTab,
  input: {
    documentId: string
    keepEditMode: boolean
    savedDisplayName: string
  }
): I_faOpenedDocumentTab {
  return {
    ...tab,
    displayNameDraft: input.savedDisplayName,
    documentId: input.documentId,
    editState: input.keepEditMode,
    hasUnsavedChanges: false,
    parentDocumentId: undefined,
    persistenceState: 'persisted',
    savedDisplayName: input.savedDisplayName,
    templateId: undefined,
    worldId: undefined
  }
}

/**
 * Resolves the display name used when saving a temporary document.
 */
export function resolveTemporaryOpenedDocumentDisplayNameForSave (input: {
  displayNameDraft: string
  formatUnnamedFallback: (templateSingular: string) => string
  templateSingularTitle: string
}): string {
  const trimmedDraft = input.displayNameDraft.trim()
  if (trimmedDraft.length > 0) {
    return trimmedDraft
  }

  return input.formatUnnamedFallback(input.templateSingularTitle)
}

/**
 * Resolves parentDocumentId for create input with null fallback.
 */
export function resolveTemporaryOpenedDocumentParentDocumentId (
  input: Pick<I_faTemporaryOpenedDocumentCreateInput, 'parentDocumentId'>
): string | null {
  return input.parentDocumentId ?? null
}

/**
 * Replaces documentId on a tab row after server-side id substitution.
 */
export function remapOpenedDocumentTabDocumentId (
  tab: I_faOpenedDocumentTab,
  nextDocumentId: string
): I_faOpenedDocumentTab {
  return {
    ...tab,
    documentId: nextDocumentId
  }
}
