import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

const FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY = Number.MIN_SAFE_INTEGER

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
 * Seeds a temporary opened document tab copied from a source document or opened tab.
 * Starts clean like other temporary documents; drafts mark dirty on edit.
 * Copies appearance colors, Custom order, Category, and status flags from the source.
 */
export function createTemporaryOpenedDocumentTabCopySeed (input: {
  displayName: string
  documentBackgroundColor: string | null | undefined
  documentId: string
  documentTextColor: string | null | undefined
  isCategory?: boolean | undefined
  isDead?: boolean | undefined
  isFinished?: boolean | undefined
  isMinor?: boolean | undefined
  parentDocumentId: string | null
  tabLabel: string
  templateIcon: string
  templateId: string
  temporaryParentResolveDocumentIds?: readonly string[] | undefined
  treeOrderNumber?: number | null | undefined
  worldId: string
}): I_faOpenedDocumentTab {
  const documentTextColor = mapSavedAppearanceColorFromDb(input.documentTextColor)
  const documentBackgroundColor = mapSavedAppearanceColorFromDb(input.documentBackgroundColor)
  const parentDocumentId = mapSavedParentDocumentIdFromDb(input.parentDocumentId)
  const temporaryParentResolveDocumentIds = input.temporaryParentResolveDocumentIds === undefined
    ? undefined
    : [...input.temporaryParentResolveDocumentIds]
  const savedTreeOrderNumber = input.treeOrderNumber === null || input.treeOrderNumber === undefined
    ? FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
    : input.treeOrderNumber
  const treeOrderNumberDraft = savedTreeOrderNumber === FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
    ? ''
    : String(savedTreeOrderNumber)
  const isCategory = input.isCategory === true
  const isFinished = input.isFinished === true
  const isMinor = input.isMinor === true
  const isDead = input.isDead === true
  return {
    displayNameDraft: input.displayName,
    documentId: input.documentId,
    documentBackgroundColorDraft: documentBackgroundColor,
    documentTextColorDraft: documentTextColor,
    editState: true,
    hasUnsavedChanges: false,
    isCategoryDraft: isCategory,
    isFinishedDraft: isFinished,
    isMinorDraft: isMinor,
    isDeadDraft: isDead,
    parentDocumentId: input.parentDocumentId,
    parentDocumentIdDraft: parentDocumentId,
    savedParentDocumentId: parentDocumentId,
    persistenceState: 'temporary',
    savedDisplayName: input.displayName,
    savedDocumentBackgroundColor: documentBackgroundColor,
    savedDocumentTextColor: documentTextColor,
    savedIsCategory: isCategory,
    savedIsFinished: isFinished,
    savedIsMinor: isMinor,
    savedIsDead: isDead,
    treeOrderNumberDraft,
    savedTreeOrderNumber,
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
    treeOrderNumberDraft: '',
    savedTreeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    tabLabel: input.tabLabel,
    templateIcon: input.templateIcon,
    templateId: input.templateId,
    temporaryParentResolveDocumentIds: input.temporaryParentResolveDocumentIds,
    worldId: input.worldId
  }
}
