import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  recomputeOpenedDocumentTabHasUnsavedChanges,
  resolveOpenedDocumentTagsFingerprint
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'

function keepOpenedDocumentHydrateDraft<T> (live: T, start: T, reconciled: T): T {
  if (live !== start) {
    return live
  }
  return reconciled
}

function keepOpenedDocumentHydrateTagsDraft (
  live: I_faOpenedDocumentTab['tagsDraft'],
  start: I_faOpenedDocumentTab['tagsDraft'],
  reconciled: I_faOpenedDocumentTab['tagsDraft']
): I_faOpenedDocumentTab['tagsDraft'] {
  if (live === start) {
    return reconciled
  }
  if (live === undefined || start === undefined) {
    return live
  }
  const liveFingerprint = resolveOpenedDocumentTagsFingerprint(live)
  const startFingerprint = resolveOpenedDocumentTagsFingerprint(start)
  if (liveFingerprint === startFingerprint) {
    return reconciled
  }
  return live
}

/**
 * Applies a document-row reconcile onto the tab the user still has open.
 * Drafts changed while the row was loading stay. Unchanged drafts take the reconcile.
 */
export function applyOpenedDocumentHydrateReconcileOntoLiveTab (
  startTab: I_faOpenedDocumentTab,
  liveTab: I_faOpenedDocumentTab,
  reconciledTab: I_faOpenedDocumentTab
): I_faOpenedDocumentTab {
  const displayNameDraft = keepOpenedDocumentHydrateDraft(
    liveTab.displayNameDraft,
    startTab.displayNameDraft,
    reconciledTab.displayNameDraft
  )
  const documentTextColorDraft = keepOpenedDocumentHydrateDraft(
    liveTab.documentTextColorDraft,
    startTab.documentTextColorDraft,
    reconciledTab.documentTextColorDraft
  )
  const documentBackgroundColorDraft = keepOpenedDocumentHydrateDraft(
    liveTab.documentBackgroundColorDraft,
    startTab.documentBackgroundColorDraft,
    reconciledTab.documentBackgroundColorDraft
  )
  const isCategoryDraft = keepOpenedDocumentHydrateDraft(
    liveTab.isCategoryDraft,
    startTab.isCategoryDraft,
    reconciledTab.isCategoryDraft
  )
  const isFinishedDraft = keepOpenedDocumentHydrateDraft(
    liveTab.isFinishedDraft,
    startTab.isFinishedDraft,
    reconciledTab.isFinishedDraft
  )
  const isMinorDraft = keepOpenedDocumentHydrateDraft(
    liveTab.isMinorDraft,
    startTab.isMinorDraft,
    reconciledTab.isMinorDraft
  )
  const isDeadDraft = keepOpenedDocumentHydrateDraft(
    liveTab.isDeadDraft,
    startTab.isDeadDraft,
    reconciledTab.isDeadDraft
  )
  const parentDocumentIdDraft = keepOpenedDocumentHydrateDraft(
    liveTab.parentDocumentIdDraft,
    startTab.parentDocumentIdDraft,
    reconciledTab.parentDocumentIdDraft
  )
  const treeOrderNumberDraft = keepOpenedDocumentHydrateDraft(
    liveTab.treeOrderNumberDraft,
    startTab.treeOrderNumberDraft,
    reconciledTab.treeOrderNumberDraft
  )
  const extraClassesDraft = keepOpenedDocumentHydrateDraft(
    liveTab.extraClassesDraft,
    startTab.extraClassesDraft,
    reconciledTab.extraClassesDraft
  )
  const editState = keepOpenedDocumentHydrateDraft(
    liveTab.editState,
    startTab.editState,
    reconciledTab.editState
  )
  const tabLabel = keepOpenedDocumentHydrateDraft(
    liveTab.tabLabel,
    startTab.tabLabel,
    reconciledTab.tabLabel
  )
  const tagsDraft = keepOpenedDocumentHydrateTagsDraft(
    liveTab.tagsDraft,
    startTab.tagsDraft,
    reconciledTab.tagsDraft
  )
  const nextTab = {
    ...reconciledTab,
    displayNameDraft,
    documentBackgroundColorDraft,
    documentTextColorDraft,
    editState,
    extraClassesDraft,
    isCategoryDraft,
    isDeadDraft,
    isFinishedDraft,
    isMinorDraft,
    parentDocumentIdDraft,
    tabLabel,
    tagsDraft,
    treeOrderNumberDraft
  }
  const hasUnsavedChanges = recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  const mergedTab = {
    ...nextTab,
    hasUnsavedChanges
  }
  return mergedTab
}

/**
 * Keeps the live tab order. Tabs opened during reconcile stay.
 * Tabs closed during reconcile stay closed. Missing rows stay dropped.
 */
export function mergeOpenedDocumentHydrateReconcileOntoLiveTabs (input: {
  droppedDocumentIds: ReadonlySet<string>
  liveTabs: readonly I_faOpenedDocumentTab[]
  reconciledByDocumentId: ReadonlyMap<string, I_faOpenedDocumentTab>
  startTabs: readonly I_faOpenedDocumentTab[]
}): I_faOpenedDocumentTab[] {
  const startByDocumentId = new Map<string, I_faOpenedDocumentTab>()
  for (const startTab of input.startTabs) {
    startByDocumentId.set(startTab.documentId, startTab)
  }
  const nextTabs: I_faOpenedDocumentTab[] = []
  for (const liveTab of input.liveTabs) {
    const startTab = startByDocumentId.get(liveTab.documentId)
    if (startTab === undefined) {
      nextTabs.push(liveTab)
      continue
    }
    if (input.droppedDocumentIds.has(liveTab.documentId)) {
      continue
    }
    const reconciledTab = input.reconciledByDocumentId.get(liveTab.documentId)
    if (reconciledTab === undefined) {
      nextTabs.push(liveTab)
      continue
    }
    nextTabs.push(applyOpenedDocumentHydrateReconcileOntoLiveTab(
      startTab,
      liveTab,
      reconciledTab
    ))
  }
  return nextTabs
}

/**
 * Snapshot apply must keep tabs opened while the snapshot read was in flight.
 * A focus chosen during that read stays active.
 */
export function mergeOpenedDocumentHydrateSnapshotOntoLiveTabs (input: {
  liveActiveDocumentId: string | null
  liveTabs: readonly I_faOpenedDocumentTab[]
  snapshotActiveDocumentId: string | null
  snapshotTabs: readonly I_faOpenedDocumentTab[]
}): {
    activeDocumentId: string | null
    tabs: I_faOpenedDocumentTab[]
  } {
  const snapshotDocumentIds = new Set<string>()
  for (const snapshotTab of input.snapshotTabs) {
    snapshotDocumentIds.add(snapshotTab.documentId)
  }
  const tabsOpenedDuringSnapshotRead = input.liveTabs.filter((liveTab) => {
    return !snapshotDocumentIds.has(liveTab.documentId)
  })
  const tabs = [...input.snapshotTabs, ...tabsOpenedDuringSnapshotRead]
  const liveActiveStillOpen = input.liveActiveDocumentId !== null &&
    tabs.some((tab) => tab.documentId === input.liveActiveDocumentId)
  const activeDocumentId = liveActiveStillOpen
    ? input.liveActiveDocumentId
    : input.snapshotActiveDocumentId
  return {
    activeDocumentId,
    tabs
  }
}
