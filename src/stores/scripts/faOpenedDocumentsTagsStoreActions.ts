import { ResultAsync } from 'neverthrow'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type {
  I_faProjectDocumentTagAssignmentInput,
  I_faProjectDocumentTagRef
} from 'app/types/I_faProjectTagDomain'

import {
  getFaComponentTestingProjectContentOverrides,
  listFaProjectDocumentTagsForRenderer,
  setFaProjectDocumentTagsForRenderer
} from 'app/src/scripts/componentTesting/componentTesting_manager'
import { collectProjectHierarchyTreeLoadedTagNodeIdsForRefresh } from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreeLoadedTagNodeIds'
import {
  mapOpenedDocumentSavedTagsToDraft,
  mapOpenedDocumentTagsDraftToSetInput,
  openedDocumentSavedTagIdSetsDiffer,
  recomputeOpenedDocumentTabHasUnsavedChanges,
  resolveOpenedDocumentTagsFingerprint
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'

export function applyFaOpenedDocumentTagsDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: I_faProjectDocumentTagAssignmentInput[]
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    tagsDraft: nextDraft
  }
  const hasUnsavedChanges = recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  return {
    ...nextTab,
    hasUnsavedChanges
  }
}

async function loadOpenedDocumentSavedTagsForHydrate (
  documentId: string
): Promise<I_faProjectDocumentTagRef[] | null> {
  const overrides = getFaComponentTestingProjectContentOverrides()
  if (overrides === null) {
    const api = window.faContentBridgeAPIs?.projectContent
    if (typeof api?.listDocumentTags !== 'function') {
      return null
    }
  }
  const tagsResult = await ResultAsync.fromPromise(
    listFaProjectDocumentTagsForRenderer({ documentId }),
    (error): unknown => error
  )
  if (tagsResult.isErr()) {
    return null
  }
  return tagsResult.value.items
}

/**
 * Reloads tag membership on project hydrate when the tab draft matches the snapshot.
 * A missing list API or a failed read leaves the snapshot tags in place.
 */
export async function reconcileOpenedDocumentTabTagsOnHydrate (
  tab: I_faOpenedDocumentTab
): Promise<{
  savedTags: I_faOpenedDocumentTab['savedTags']
  tagsDraft: I_faOpenedDocumentTab['tagsDraft']
}> {
  const tagsDraftAtStart = tab.tagsDraft
  const tagsDirty = tagsDraftAtStart !== undefined &&
    resolveOpenedDocumentTagsFingerprint(tagsDraftAtStart) !==
    resolveOpenedDocumentTagsFingerprint(tab.savedTags ?? [])
  if (tagsDirty) {
    const savedTags = tab.savedTags
    const tagsDraft = tab.tagsDraft
    return {
      savedTags,
      tagsDraft
    }
  }
  const loadedTags = await loadOpenedDocumentSavedTagsForHydrate(tab.documentId)
  if (loadedTags === null) {
    const savedTags = tab.savedTags
    const tagsDraft = tab.tagsDraft
    return {
      savedTags,
      tagsDraft
    }
  }
  const savedTags = loadedTags
  const tagsDraft = mapOpenedDocumentSavedTagsToDraft(loadedTags)
  return {
    savedTags,
    tagsDraft
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
  if (tab.tagsDraft === undefined) {
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
  const hasUnsavedChanges = recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  return {
    ...nextTab,
    hasUnsavedChanges
  }
}

/**
 * Tag rows to reload after a save. Null when saved membership did not change
 * and the caller did not ask to refresh an unchanged set.
 * Newly assigned ids are included even when that tag row is still unloaded.
 */
export function resolveOpenedDocumentTagRefreshNodeIdsAfterSave (
  treeNodes: readonly I_faProjectHierarchyTreeHeTreeNode[],
  previousSavedTagIds: readonly string[],
  nextSavedTagIds: readonly string[],
  refreshWhenMembershipUnchanged = false
): string[] | null {
  const membershipChanged = openedDocumentSavedTagIdSetsDiffer(
    previousSavedTagIds,
    nextSavedTagIds
  )
  if (!membershipChanged && !refreshWhenMembershipUnchanged) {
    return null
  }
  const affectedTagIds = [...new Set([...previousSavedTagIds, ...nextSavedTagIds])]
  const newlyAssignedTagIds = nextSavedTagIds.filter((tagId) => {
    return !previousSavedTagIds.includes(tagId)
  })
  return collectProjectHierarchyTreeLoadedTagNodeIdsForRefresh(
    treeNodes,
    affectedTagIds,
    newlyAssignedTagIds
  )
}
