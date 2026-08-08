import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_openedDocumentTabUnsavedCompareInput } from 'app/types/I_faOpenedDocumentsDomain'

/**
 * Local sentinel alias; functions/ cannot value-import from types/.
 * Keep equal to FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY in types/I_faDocumentTreeOrderNumber.
 */
const FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY = Number.MIN_SAFE_INTEGER

/**
 * Maps tab appearance color drafts to nullable SQLite values.
 */
export function resolveOpenedDocumentAppearanceColorDraftForPersist (
  draft: string
): string | null {
  const trimmed = draft.trim()
  if (trimmed.length === 0) {
    return null
  }
  return trimmed.toUpperCase()
}

/**
 * Whether any wired opened-document tab draft differs from saved baselines.
 * Callers must pass treeOrderNumber already resolved via
 * resolveOpenedDocumentTreeOrderNumberDraftForPersist.
 */
export function computeOpenedDocumentHasUnsavedChanges (
  input: I_openedDocumentTabUnsavedCompareInput
): boolean {
  return (
    input.displayNameDraft !== input.savedDisplayName ||
    input.documentTextColorDraft !== input.savedDocumentTextColor ||
    input.documentBackgroundColorDraft !== input.savedDocumentBackgroundColor ||
    input.isCategoryDraft !== input.savedIsCategory ||
    input.isFinishedDraft !== input.savedIsFinished ||
    input.isMinorDraft !== input.savedIsMinor ||
    input.isDeadDraft !== input.savedIsDead ||
    input.parentDocumentIdDraft !== input.savedParentDocumentId ||
    input.treeOrderNumber !== input.savedTreeOrderNumber ||
    input.extraClassesDraft !== input.savedExtraClasses ||
    input.tagsDraftFingerprint !== input.savedTagsFingerprint
  )
}

/**
 * Ensures tab rows loaded from persistence always carry appearance color baselines.
 */
export function normalizeOpenedDocumentTabAppearanceColors (
  tab: I_faOpenedDocumentTab
): I_faOpenedDocumentTab {
  return {
    ...tab,
    documentBackgroundColorDraft: tab.documentBackgroundColorDraft ?? '',
    documentTextColorDraft: tab.documentTextColorDraft ?? '',
    isCategoryDraft: tab.isCategoryDraft ?? false,
    isFinishedDraft: tab.isFinishedDraft ?? false,
    isMinorDraft: tab.isMinorDraft ?? false,
    isDeadDraft: tab.isDeadDraft ?? false,
    savedDocumentBackgroundColor: tab.savedDocumentBackgroundColor ?? '',
    savedDocumentTextColor: tab.savedDocumentTextColor ?? '',
    savedIsCategory: tab.savedIsCategory ?? false,
    savedIsFinished: tab.savedIsFinished ?? false,
    savedIsMinor: tab.savedIsMinor ?? false,
    savedIsDead: tab.savedIsDead ?? false,
    parentDocumentIdDraft: tab.parentDocumentIdDraft ?? '',
    savedParentDocumentId: tab.savedParentDocumentId ?? '',
    treeOrderNumberDraft: tab.treeOrderNumberDraft ?? '',
    savedTreeOrderNumber: tab.savedTreeOrderNumber ?? FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    extraClassesDraft: tab.extraClassesDraft ?? '',
    savedExtraClasses: tab.savedExtraClasses ?? '',
    tagsDraft: tab.tagsDraft ?? [],
    savedTags: tab.savedTags ?? []
  }
}
