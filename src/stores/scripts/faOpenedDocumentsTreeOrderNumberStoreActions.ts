import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { recomputeOpenedDocumentTabHasUnsavedChanges } from 'app/src/scripts/openedDocuments/openedDocumentTabAppearanceWiring'

export function applyFaOpenedDocumentTreeOrderNumberDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: string
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    treeOrderNumberDraft: nextDraft
  }
  return {
    ...nextTab,
    hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  }
}
