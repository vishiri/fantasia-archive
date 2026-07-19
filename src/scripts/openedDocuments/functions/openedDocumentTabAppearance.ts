import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_openedDocumentTabUnsavedCompareInput } from 'app/types/I_faOpenedDocumentsDomain'

/**
 * Maps nullable SQLite document appearance colors to tab session empty-string baseline.
 */
export function normalizeOpenedDocumentAppearanceColorFromDb (
  value: string | null | undefined
): string {
  if (value === null || value === undefined) {
    return ''
  }
  return value
}

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
    input.parentDocumentIdDraft !== input.savedParentDocumentId
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
    savedParentDocumentId: tab.savedParentDocumentId ?? ''
  }
}

/**
 * Recomputes hasUnsavedChanges from current tab draft and saved fields.
 */
export function recomputeOpenedDocumentTabHasUnsavedChanges (
  tab: I_faOpenedDocumentTab
): boolean {
  return computeOpenedDocumentHasUnsavedChanges({
    displayNameDraft: tab.displayNameDraft,
    documentBackgroundColorDraft: tab.documentBackgroundColorDraft,
    documentTextColorDraft: tab.documentTextColorDraft,
    isCategoryDraft: tab.isCategoryDraft,
    isFinishedDraft: tab.isFinishedDraft,
    isMinorDraft: tab.isMinorDraft,
    isDeadDraft: tab.isDeadDraft,
    savedDisplayName: tab.savedDisplayName,
    savedDocumentBackgroundColor: tab.savedDocumentBackgroundColor,
    savedDocumentTextColor: tab.savedDocumentTextColor,
    savedIsCategory: tab.savedIsCategory,
    savedIsFinished: tab.savedIsFinished,
    savedIsMinor: tab.savedIsMinor,
    savedIsDead: tab.savedIsDead,
    parentDocumentIdDraft: tab.parentDocumentIdDraft,
    savedParentDocumentId: tab.savedParentDocumentId
  })
}
