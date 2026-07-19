import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { recomputeOpenedDocumentTabHasUnsavedChanges } from 'app/src/scripts/openedDocuments/openedDocumentTabAppearanceWiring'

export function applyFaOpenedDocumentParentIdDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: string
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    parentDocumentIdDraft: nextDraft
  }
  return {
    ...nextTab,
    hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  }
}

export function applyFaOpenedDocumentParentIdSyncFromHierarchy (
  tab: I_faOpenedDocumentTab,
  parentDocumentId: string
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    parentDocumentIdDraft: parentDocumentId,
    savedParentDocumentId: parentDocumentId
  }
  return {
    ...nextTab,
    hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  }
}
