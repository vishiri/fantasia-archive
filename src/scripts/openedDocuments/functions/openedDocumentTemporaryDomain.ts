import type {
  I_faOpenedDocumentTab,
  I_faTemporaryOpenedDocumentCreateInput,
  T_faOpenedDocumentPersistenceState
} from 'app/types/I_faOpenedDocumentsDomain'

function mapSavedParentDocumentIdFromDb (
  value: string | null | undefined
): string {
  if (value === null || value === undefined) {
    return ''
  }
  return value
}

function mapSavedAppearanceColorFromDb (
  value: string | null | undefined
): string {
  if (value === null || value === undefined) {
    return ''
  }
  return value
}

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
      temporaryParentResolveDocumentIds: tab.temporaryParentResolveDocumentIds,
      worldId: tab.worldId
    }
  }

  return {
    ...tab,
    persistenceState
  }
}

/**
 * Seeds a temporary opened document tab copied from a persisted source document row.
 * Starts clean like other temporary documents; drafts mark dirty on edit.
 */
export function createTemporaryOpenedDocumentTabCopySeed (input: {
  displayName: string
  documentBackgroundColor: string | null | undefined
  documentId: string
  documentTextColor: string | null | undefined
  parentDocumentId: string | null
  tabLabel: string
  templateIcon: string
  templateId: string
  temporaryParentResolveDocumentIds?: readonly string[] | undefined
  worldId: string
}): I_faOpenedDocumentTab {
  const documentTextColor = mapSavedAppearanceColorFromDb(input.documentTextColor)
  const documentBackgroundColor = mapSavedAppearanceColorFromDb(input.documentBackgroundColor)
  const parentDocumentId = mapSavedParentDocumentIdFromDb(input.parentDocumentId)
  const temporaryParentResolveDocumentIds = input.temporaryParentResolveDocumentIds === undefined
    ? undefined
    : [...input.temporaryParentResolveDocumentIds]
  return {
    displayNameDraft: input.displayName,
    documentId: input.documentId,
    documentBackgroundColorDraft: documentBackgroundColor,
    documentTextColorDraft: documentTextColor,
    editState: true,
    hasUnsavedChanges: false,
    isCategoryDraft: false,
    isFinishedDraft: false,
    isMinorDraft: false,
    isDeadDraft: false,
    parentDocumentId: input.parentDocumentId,
    parentDocumentIdDraft: parentDocumentId,
    savedParentDocumentId: parentDocumentId,
    persistenceState: 'temporary',
    savedDisplayName: input.displayName,
    savedDocumentBackgroundColor: documentBackgroundColor,
    savedDocumentTextColor: documentTextColor,
    savedIsCategory: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    tabLabel: input.tabLabel,
    templateIcon: input.templateIcon,
    templateId: input.templateId,
    temporaryParentResolveDocumentIds,
    worldId: input.worldId
  }
}

/**
 * Seeds a temporary opened document tab in edit mode without dirty state until the user edits.
 */
export function createTemporaryOpenedDocumentTabSeed (input: {
  displayName: string
  documentId: string
  parentDocumentId: string | null
  tabLabel: string
  templateIcon: string
  templateId: string
  temporaryParentResolveDocumentIds?: readonly string[] | undefined
  worldId: string
}): I_faOpenedDocumentTab {
  const parentDocumentId = mapSavedParentDocumentIdFromDb(input.parentDocumentId)
  return {
    displayNameDraft: input.displayName,
    documentId: input.documentId,
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '',
    editState: true,
    hasUnsavedChanges: false,
    isCategoryDraft: false,
    isFinishedDraft: false,
    isMinorDraft: false,
    isDeadDraft: false,
    parentDocumentId: input.parentDocumentId,
    parentDocumentIdDraft: parentDocumentId,
    savedParentDocumentId: parentDocumentId,
    persistenceState: 'temporary',
    savedDisplayName: input.displayName,
    savedDocumentBackgroundColor: '',
    savedDocumentTextColor: '',
    savedIsCategory: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    tabLabel: input.tabLabel,
    templateIcon: input.templateIcon,
    templateId: input.templateId,
    temporaryParentResolveDocumentIds: input.temporaryParentResolveDocumentIds,
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
  const normalizedParentDocumentId = mapSavedParentDocumentIdFromDb(parentDocumentId)
  return {
    ...tab,
    parentDocumentId,
    parentDocumentIdDraft: normalizedParentDocumentId,
    savedParentDocumentId: normalizedParentDocumentId
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
    savedDocumentTextColor?: string | null | undefined
    savedDocumentBackgroundColor?: string | null | undefined
    savedIsCategory?: boolean | undefined
    savedIsFinished?: boolean | undefined
    savedIsMinor?: boolean | undefined
    savedIsDead?: boolean | undefined
    savedParentDocumentId?: string | null | undefined
  }
): I_faOpenedDocumentTab {
  const savedDocumentTextColor = mapSavedAppearanceColorFromDb(
    input.savedDocumentTextColor
  )
  const savedDocumentBackgroundColor = mapSavedAppearanceColorFromDb(
    input.savedDocumentBackgroundColor
  )
  const savedIsCategory = input.savedIsCategory === true
  const savedIsFinished = input.savedIsFinished === true
  const savedIsMinor = input.savedIsMinor === true
  const savedIsDead = input.savedIsDead === true
  const savedParentDocumentId = mapSavedParentDocumentIdFromDb(
    input.savedParentDocumentId
  )
  return {
    ...tab,
    displayNameDraft: input.savedDisplayName,
    documentId: input.documentId,
    documentBackgroundColorDraft: savedDocumentBackgroundColor,
    documentTextColorDraft: savedDocumentTextColor,
    editState: input.keepEditMode,
    hasUnsavedChanges: false,
    isCategoryDraft: savedIsCategory,
    isFinishedDraft: savedIsFinished,
    isMinorDraft: savedIsMinor,
    isDeadDraft: savedIsDead,
    parentDocumentId: undefined,
    parentDocumentIdDraft: savedParentDocumentId,
    savedParentDocumentId,
    persistenceState: 'persisted',
    savedDisplayName: input.savedDisplayName,
    savedDocumentBackgroundColor,
    savedDocumentTextColor,
    savedIsCategory,
    savedIsFinished,
    savedIsMinor,
    savedIsDead,
    templateId: undefined,
    temporaryParentResolveDocumentIds: undefined,
    worldId: tab.worldId
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
