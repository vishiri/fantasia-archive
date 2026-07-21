import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { recomputeOpenedDocumentTabHasUnsavedChanges } from 'app/src/scripts/openedDocuments/openedDocumentTabAppearanceWiring'

export function applyFaOpenedDocumentExtraClassesDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: string
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    extraClassesDraft: nextDraft
  }
  return {
    ...nextTab,
    hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  }
}
