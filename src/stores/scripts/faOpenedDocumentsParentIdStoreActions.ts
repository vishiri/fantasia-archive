import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { recomputeOpenedDocumentTabHasUnsavedChanges } from 'app/src/scripts/openedDocuments/openedDocuments_manager'

export function applyFaOpenedDocumentParentIdDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: string
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    parentDocumentIdDraft: nextDraft
  }
  const hasUnsavedChanges = recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  return {
    ...nextTab,
    hasUnsavedChanges
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
  const hasUnsavedChanges = recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  return {
    ...nextTab,
    hasUnsavedChanges
  }
}
