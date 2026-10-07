import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_openedDocumentTabUnsavedCompareInput } from 'app/types/I_faOpenedDocumentsDomain'

/**
 * Local sentinel alias; functions/ cannot value-import from types/.
 * Keep equal to FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY in types/I_faDocumentTreeOrderNumber.
 */
const FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY = Number.MIN_SAFE_INTEGER

const FA_DOCUMENT_APPEARANCE_COLOR_HEX = /^#[0-9A-F]{6}$/
const FA_DOCUMENT_APPEARANCE_COLOR_SHORT_HEX = /^#([0-9A-F])([0-9A-F])([0-9A-F])$/

/**
 * Maps a trimmed uppercase draft to #RRGGBB. Short #RGB expands. Anything else is empty.
 */
function resolveOpenedDocumentAppearanceStorageColor (trimmedUpper: string): string | null {
  if (FA_DOCUMENT_APPEARANCE_COLOR_HEX.test(trimmedUpper)) {
    return trimmedUpper
  }
  const shortMatch = FA_DOCUMENT_APPEARANCE_COLOR_SHORT_HEX.exec(trimmedUpper)
  if (shortMatch === null) {
    return null
  }
  const red = shortMatch[1] ?? ''
  const green = shortMatch[2] ?? ''
  const blue = shortMatch[3] ?? ''
  return `#${red}${red}${green}${green}${blue}${blue}`
}

/**
 * Maps tab appearance color drafts to nullable SQLite values.
 * Invalid text becomes null so a bad color does not fail the document save or the tab snapshot.
 */
export function resolveOpenedDocumentAppearanceColorDraftForPersist (
  draft: string
): string | null {
  const trimmedUpper = draft.trim().toUpperCase()
  if (trimmedUpper.length === 0) {
    return null
  }
  return resolveOpenedDocumentAppearanceStorageColor(trimmedUpper)
}

function normalizeOpenedDocumentAppearanceColorField (draft: string | undefined): string {
  const stored = resolveOpenedDocumentAppearanceColorDraftForPersist(draft ?? '')
  if (stored === null) {
    return ''
  }
  return stored
}

/**
 * Same stored #RRGGBB with only letter case differing is not a draft change.
 * Invalid text and short #RGB stay unequal to the saved string.
 */
function openedDocumentAppearanceColorsMatch (draft: string, saved: string): boolean {
  if (draft === saved) {
    return true
  }
  const storedDraft = resolveOpenedDocumentAppearanceColorDraftForPersist(draft)
  const storedSaved = resolveOpenedDocumentAppearanceColorDraftForPersist(saved)
  if (storedDraft === null || storedSaved === null || storedDraft !== storedSaved) {
    return false
  }
  return draft.toUpperCase() === saved.toUpperCase()
}

/**
 * Whether any wired opened-document tab draft differs from saved baselines.
 * Callers must pass treeOrderNumber already resolved via
 * resolveOpenedDocumentTreeOrderNumberDraftForPersist.
 */
export function computeOpenedDocumentHasUnsavedChanges (
  input: I_openedDocumentTabUnsavedCompareInput
): boolean {
  const textColorChanged = !openedDocumentAppearanceColorsMatch(
    input.documentTextColorDraft,
    input.savedDocumentTextColor
  )
  const backgroundColorChanged = !openedDocumentAppearanceColorsMatch(
    input.documentBackgroundColorDraft,
    input.savedDocumentBackgroundColor
  )
  return (
    input.displayNameDraft !== input.savedDisplayName ||
    textColorChanged ||
    backgroundColorChanged ||
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
 * A dirty tab keeps an edited draft. A snapshot that never stored the field
 * uses the database value, so a later save does not wipe it.
 */
export function resolveOpenedDocumentHydrateUnsavedDraft<Draft, Saved> (input: {
  databaseDraft: Draft
  hasUnsavedChanges: boolean
  missingDraft: Draft
  missingSaved: Saved
  snapshotDraft: Draft
  snapshotSaved: Saved
}): Draft {
  const snapshotFieldMissing = input.snapshotDraft === input.missingDraft &&
    input.snapshotSaved === input.missingSaved
  if (!input.hasUnsavedChanges || snapshotFieldMissing) {
    return input.databaseDraft
  }
  return input.snapshotDraft
}

/**
 * Ensures tab rows loaded from persistence always carry appearance color baselines.
 */
export function normalizeOpenedDocumentTabAppearanceColors (
  tab: I_faOpenedDocumentTab
): I_faOpenedDocumentTab {
  const documentBackgroundColorDraft = normalizeOpenedDocumentAppearanceColorField(
    tab.documentBackgroundColorDraft
  )
  const documentTextColorDraft = normalizeOpenedDocumentAppearanceColorField(
    tab.documentTextColorDraft
  )
  const isCategoryDraft = tab.isCategoryDraft ?? false
  const isFinishedDraft = tab.isFinishedDraft ?? false
  const isMinorDraft = tab.isMinorDraft ?? false
  const isDeadDraft = tab.isDeadDraft ?? false
  const savedDocumentBackgroundColor = normalizeOpenedDocumentAppearanceColorField(
    tab.savedDocumentBackgroundColor
  )
  const savedDocumentTextColor = normalizeOpenedDocumentAppearanceColorField(
    tab.savedDocumentTextColor
  )
  const savedIsCategory = tab.savedIsCategory ?? false
  const savedIsFinished = tab.savedIsFinished ?? false
  const savedIsMinor = tab.savedIsMinor ?? false
  const savedIsDead = tab.savedIsDead ?? false
  const parentDocumentIdDraft = tab.parentDocumentIdDraft ?? ''
  const savedParentDocumentId = tab.savedParentDocumentId ?? ''
  const treeOrderNumberDraft = tab.treeOrderNumberDraft ?? ''
  const savedTreeOrderNumber = tab.savedTreeOrderNumber ?? FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
  const extraClassesDraft = tab.extraClassesDraft ?? ''
  const savedExtraClasses = tab.savedExtraClasses ?? ''
  const tagsDraft = tab.tagsDraft
  const savedTags = tab.savedTags
  return {
    ...tab,
    documentBackgroundColorDraft,
    documentTextColorDraft,
    extraClassesDraft,
    isCategoryDraft,
    isDeadDraft,
    isFinishedDraft,
    isMinorDraft,
    parentDocumentIdDraft,
    savedDocumentBackgroundColor,
    savedDocumentTextColor,
    savedExtraClasses,
    savedIsCategory,
    savedIsDead,
    savedIsFinished,
    savedIsMinor,
    savedParentDocumentId,
    savedTags,
    savedTreeOrderNumber,
    tagsDraft,
    treeOrderNumberDraft
  }
}
