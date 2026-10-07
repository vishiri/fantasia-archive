import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  recomputeOpenedDocumentTabHasUnsavedChanges,
  resolveOpenedDocumentTagsFingerprint
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'

function resolveOpenedDocumentDraftAfterSave<T> (
  draftAtSaveStart: I_faOpenedDocumentTab | undefined,
  live: T,
  atStart: T,
  saved: T
): T {
  if (draftAtSaveStart === undefined) {
    return saved
  }
  if (live !== atStart) {
    return live
  }
  return saved
}

export function openedDocumentDraftDriftedDuringSave (
  live: I_faOpenedDocumentTab,
  atStart: I_faOpenedDocumentTab
): boolean {
  if (live.displayNameDraft !== atStart.displayNameDraft) {
    return true
  }
  if (live.documentTextColorDraft !== atStart.documentTextColorDraft) {
    return true
  }
  if (live.documentBackgroundColorDraft !== atStart.documentBackgroundColorDraft) {
    return true
  }
  if (live.isCategoryDraft !== atStart.isCategoryDraft) {
    return true
  }
  if (live.isFinishedDraft !== atStart.isFinishedDraft) {
    return true
  }
  if (live.isMinorDraft !== atStart.isMinorDraft) {
    return true
  }
  if (live.isDeadDraft !== atStart.isDeadDraft) {
    return true
  }
  if (live.parentDocumentIdDraft !== atStart.parentDocumentIdDraft) {
    return true
  }
  if (live.treeOrderNumberDraft !== atStart.treeOrderNumberDraft) {
    return true
  }
  return live.extraClassesDraft !== atStart.extraClassesDraft
}

export function resolveOpenedDocumentFieldDraftsAfterSave (
  tab: I_faOpenedDocumentTab,
  draftAtSaveStart: I_faOpenedDocumentTab | undefined,
  saved: {
    extraClasses: string
    isCategory: boolean
    isDead: boolean
    isFinished: boolean
    isMinor: boolean
    parentDocumentId: string
    backgroundColor: string
    textColor: string
    displayName: string
    treeOrderNumberDraft: string
  }
): {
    displayNameDraft: string
    documentBackgroundColorDraft: string
    documentTextColorDraft: string
    extraClassesDraft: string
    isCategoryDraft: boolean
    isDeadDraft: boolean
    isFinishedDraft: boolean
    isMinorDraft: boolean
    parentDocumentIdDraft: string
    treeOrderNumberDraft: string
  } {
  const displayNameDraft = resolveOpenedDocumentDraftAfterSave(
    draftAtSaveStart,
    tab.displayNameDraft,
    draftAtSaveStart?.displayNameDraft ?? saved.displayName,
    saved.displayName
  )
  const documentTextColorDraft = resolveOpenedDocumentDraftAfterSave(
    draftAtSaveStart,
    tab.documentTextColorDraft,
    draftAtSaveStart?.documentTextColorDraft ?? saved.textColor,
    saved.textColor
  )
  const documentBackgroundColorDraft = resolveOpenedDocumentDraftAfterSave(
    draftAtSaveStart,
    tab.documentBackgroundColorDraft,
    draftAtSaveStart?.documentBackgroundColorDraft ?? saved.backgroundColor,
    saved.backgroundColor
  )
  const isCategoryDraft = resolveOpenedDocumentDraftAfterSave(
    draftAtSaveStart,
    tab.isCategoryDraft,
    draftAtSaveStart?.isCategoryDraft ?? saved.isCategory,
    saved.isCategory
  )
  const isFinishedDraft = resolveOpenedDocumentDraftAfterSave(
    draftAtSaveStart,
    tab.isFinishedDraft,
    draftAtSaveStart?.isFinishedDraft ?? saved.isFinished,
    saved.isFinished
  )
  const isMinorDraft = resolveOpenedDocumentDraftAfterSave(
    draftAtSaveStart,
    tab.isMinorDraft,
    draftAtSaveStart?.isMinorDraft ?? saved.isMinor,
    saved.isMinor
  )
  const isDeadDraft = resolveOpenedDocumentDraftAfterSave(
    draftAtSaveStart,
    tab.isDeadDraft,
    draftAtSaveStart?.isDeadDraft ?? saved.isDead,
    saved.isDead
  )
  const parentDocumentIdDraft = resolveOpenedDocumentDraftAfterSave(
    draftAtSaveStart,
    tab.parentDocumentIdDraft,
    draftAtSaveStart?.parentDocumentIdDraft ?? saved.parentDocumentId,
    saved.parentDocumentId
  )
  const treeOrderNumberDraft = resolveOpenedDocumentDraftAfterSave(
    draftAtSaveStart,
    tab.treeOrderNumberDraft,
    draftAtSaveStart?.treeOrderNumberDraft ?? saved.treeOrderNumberDraft,
    saved.treeOrderNumberDraft
  )
  const extraClassesDraft = resolveOpenedDocumentDraftAfterSave(
    draftAtSaveStart,
    tab.extraClassesDraft,
    draftAtSaveStart?.extraClassesDraft ?? saved.extraClasses,
    saved.extraClasses
  )
  return {
    displayNameDraft,
    documentBackgroundColorDraft,
    documentTextColorDraft,
    extraClassesDraft,
    isCategoryDraft,
    isDeadDraft,
    isFinishedDraft,
    isMinorDraft,
    parentDocumentIdDraft,
    treeOrderNumberDraft
  }
}

export function keepOpenedDocumentDraftsTypedDuringSave (
  savedTab: I_faOpenedDocumentTab,
  liveTab: I_faOpenedDocumentTab,
  draftAtSaveStart: I_faOpenedDocumentTab
): I_faOpenedDocumentTab {
  if (!openedDocumentDraftDriftedDuringSave(liveTab, draftAtSaveStart)) {
    return savedTab
  }
  const fieldDrafts = resolveOpenedDocumentFieldDraftsAfterSave(liveTab, draftAtSaveStart, {
    backgroundColor: savedTab.documentBackgroundColorDraft,
    displayName: savedTab.displayNameDraft,
    extraClasses: savedTab.extraClassesDraft,
    isCategory: savedTab.isCategoryDraft,
    isDead: savedTab.isDeadDraft,
    isFinished: savedTab.isFinishedDraft,
    isMinor: savedTab.isMinorDraft,
    parentDocumentId: savedTab.parentDocumentIdDraft,
    textColor: savedTab.documentTextColorDraft,
    treeOrderNumberDraft: savedTab.treeOrderNumberDraft
  })
  const nextTab = {
    ...savedTab,
    ...fieldDrafts
  }
  const hasUnsavedChanges = recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  return {
    ...nextTab,
    hasUnsavedChanges
  }
}

/**
 * Keep-edit saves follow the live preview/edit toggle. Leave-edit saves return to preview.
 */
export function resolveOpenedDocumentEditStateAfterSave (
  keepEditMode: boolean,
  liveEditState: boolean
): boolean {
  if (keepEditMode) {
    return liveEditState
  }
  return false
}

function openedDocumentTagsDraftUnchangedDuringSave (
  liveTags: I_faOpenedDocumentTab['tagsDraft'],
  startTags: I_faOpenedDocumentTab['tagsDraft']
): boolean {
  if (liveTags === undefined || startTags === undefined) {
    return liveTags === startTags
  }
  const liveTagsFingerprint = resolveOpenedDocumentTagsFingerprint(liveTags)
  const startTagsFingerprint = resolveOpenedDocumentTagsFingerprint(startTags)
  return liveTagsFingerprint === startTagsFingerprint
}

export function mergeOpenedDocumentSaveOntoLiveTab (
  saveAppliedTab: I_faOpenedDocumentTab,
  liveTab: I_faOpenedDocumentTab,
  draftAtSaveStart: I_faOpenedDocumentTab
): I_faOpenedDocumentTab {
  const merged = keepOpenedDocumentDraftsTypedDuringSave(
    saveAppliedTab,
    liveTab,
    draftAtSaveStart
  )
  const tagsUnchanged = openedDocumentTagsDraftUnchangedDuringSave(
    liveTab.tagsDraft,
    draftAtSaveStart.tagsDraft
  )
  if (tagsUnchanged) {
    return merged
  }
  const nextTab = {
    ...merged,
    tagsDraft: liveTab.tagsDraft
  }
  const hasUnsavedChanges = recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  return {
    ...nextTab,
    hasUnsavedChanges
  }
}
