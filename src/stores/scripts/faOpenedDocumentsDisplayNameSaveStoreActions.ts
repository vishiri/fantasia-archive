import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'

import {
  normalizeOpenedDocumentTreeOrderNumberFromDb,
  recomputeOpenedDocumentTabHasUnsavedChanges
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'
import {
  openedDocumentDraftDriftedDuringSave,
  resolveOpenedDocumentFieldDraftsAfterSave
} from './faOpenedDocumentsDraftTypedDuringSave'

export function applyFaOpenedDocumentTabAfterDisplayNameSave (
  tab: I_faOpenedDocumentTab,
  input: {
    keepEditMode: boolean
    savedDisplayName: string
    savedDocumentTextColor: string
    savedDocumentBackgroundColor: string
    savedIsCategory: boolean
    savedIsFinished: boolean
    savedIsMinor: boolean
    savedIsDead: boolean
    savedParentDocumentId: string
    savedTreeOrderNumber: number
    savedExtraClasses: string
    draftAtSaveStart?: I_faOpenedDocumentTab
  }
): I_faOpenedDocumentTab {
  const {
    keepEditMode,
    savedDisplayName,
    savedDocumentTextColor,
    savedDocumentBackgroundColor,
    savedIsCategory,
    savedIsFinished,
    savedIsMinor,
    savedIsDead,
    savedParentDocumentId,
    savedTreeOrderNumber,
    savedExtraClasses,
    draftAtSaveStart
  } = input
  const editState = keepEditMode ? tab.editState : FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE
  const savedTreeOrderNumberDraft = normalizeOpenedDocumentTreeOrderNumberFromDb(savedTreeOrderNumber)
  const fieldDrafts = resolveOpenedDocumentFieldDraftsAfterSave(tab, draftAtSaveStart, {
    backgroundColor: savedDocumentBackgroundColor,
    displayName: savedDisplayName,
    extraClasses: savedExtraClasses,
    isCategory: savedIsCategory,
    isDead: savedIsDead,
    isFinished: savedIsFinished,
    isMinor: savedIsMinor,
    parentDocumentId: savedParentDocumentId,
    textColor: savedDocumentTextColor,
    treeOrderNumberDraft: savedTreeOrderNumberDraft
  })
  const {
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
  } = fieldDrafts
  const savedTab = {
    ...tab,
    displayNameDraft,
    documentTextColorDraft,
    documentBackgroundColorDraft,
    editState,
    isCategoryDraft,
    isFinishedDraft,
    isMinorDraft,
    isDeadDraft,
    parentDocumentIdDraft,
    treeOrderNumberDraft,
    extraClassesDraft,
    savedDisplayName,
    savedDocumentTextColor,
    savedDocumentBackgroundColor,
    savedIsCategory,
    savedIsFinished,
    savedIsMinor,
    savedIsDead,
    savedParentDocumentId,
    savedTreeOrderNumber,
    savedExtraClasses
  }
  const draftDrifted = draftAtSaveStart !== undefined &&
    openedDocumentDraftDriftedDuringSave(tab, draftAtSaveStart)
  const hasUnsavedChanges = draftDrifted
    ? recomputeOpenedDocumentTabHasUnsavedChanges(savedTab)
    : false
  return {
    ...savedTab,
    hasUnsavedChanges
  }
}
