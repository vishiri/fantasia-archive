import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectDocumentTagAssignmentInput } from 'app/types/I_faProjectTagDomain'

import {
  getFaComponentTestingProjectContentOverrides,
  setFaProjectDocumentTagsForRenderer
} from 'app/src/scripts/componentTesting/componentTesting_manager'
import {
  mapOpenedDocumentSavedTagsToDraft,
  mapOpenedDocumentTagsDraftToSetInput,
  recomputeOpenedDocumentTabHasUnsavedChanges
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'

export function applyFaOpenedDocumentTagsDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: I_faProjectDocumentTagAssignmentInput[]
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    tagsDraft: nextDraft
  }
  return {
    ...nextTab,
    hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  }
}

function canPersistFaOpenedDocumentTags (): boolean {
  const overrides = getFaComponentTestingProjectContentOverrides()
  if (overrides !== null) {
    return true
  }
  const api = window.faContentBridgeAPIs?.projectContent
  return typeof api?.setDocumentTags === 'function'
}

/**
 * Persists Tags field via setDocumentTags and returns tab with saved/draft aligned.
 */
export async function persistFaOpenedDocumentTagsAfterSave (
  tab: I_faOpenedDocumentTab,
  documentId: string
): Promise<I_faOpenedDocumentTab> {
  if (!canPersistFaOpenedDocumentTags()) {
    return tab
  }
  const result = await setFaProjectDocumentTagsForRenderer({
    documentId,
    tags: mapOpenedDocumentTagsDraftToSetInput(tab.tagsDraft ?? [])
  })
  const savedTags = result.items
  const nextTab = {
    ...tab,
    savedTags,
    tagsDraft: mapOpenedDocumentSavedTagsToDraft(savedTags)
  }
  return {
    ...nextTab,
    hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  }
}
