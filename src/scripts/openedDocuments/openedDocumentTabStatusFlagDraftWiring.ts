import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { recomputeOpenedDocumentTabHasUnsavedChanges } from './openedDocumentTabAppearanceWiring'

export function applyFaOpenedDocumentIsFinishedDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: boolean
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    isFinishedDraft: nextDraft
  }
  return {
    ...nextTab,
    hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  }
}

export function applyFaOpenedDocumentIsMinorDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: boolean
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    isMinorDraft: nextDraft
  }
  return {
    ...nextTab,
    hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  }
}

export function applyFaOpenedDocumentIsDeadDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: boolean
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    isDeadDraft: nextDraft
  }
  return {
    ...nextTab,
    hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  }
}
