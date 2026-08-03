import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { computeOpenedDocumentHasUnsavedChanges } from './functions/openedDocumentTabAppearance'
import { resolveOpenedDocumentTreeOrderNumberDraftForPersist } from './functions/openedDocumentTreeOrderNumber'

export {
  computeOpenedDocumentHasUnsavedChanges,
  normalizeOpenedDocumentTabAppearanceColors,
  resolveOpenedDocumentAppearanceColorDraftForPersist
} from './functions/openedDocumentTabAppearance'
export {
  normalizeOpenedDocumentAppearanceColorFromDb,
  normalizeOpenedDocumentExtraClassesFromDb,
  normalizeOpenedDocumentParentIdFromDb
} from './functions/openedDocumentNullableStringFromDb'
export {
  resolveOpenedDocumentParentIdDraftForPersist,
  resolveOpenedDocumentParentMoveAppendSortOrder
} from './functions/openedDocumentParentId'

/**
 * Recomputes hasUnsavedChanges from current tab draft and saved fields.
 * Resolves tree-order draft through the shared persist helper before compare.
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
    savedParentDocumentId: tab.savedParentDocumentId,
    treeOrderNumber: resolveOpenedDocumentTreeOrderNumberDraftForPersist(
      tab.treeOrderNumberDraft
    ),
    savedTreeOrderNumber: tab.savedTreeOrderNumber,
    extraClassesDraft: tab.extraClassesDraft,
    savedExtraClasses: tab.savedExtraClasses
  })
}
