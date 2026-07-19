import type {
  I_faOpenedDocumentTab,
  I_faOpenedDocumentTreeOpenMeta,
  I_faOpenedDocumentsSnapshot
} from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENTS_SNAPSHOT_SCHEMA_VERSION } from 'app/types/I_faOpenedDocumentsDomain'
import {
  normalizeOpenedDocumentAppearanceColorFromDb,
  normalizeOpenedDocumentParentIdFromDb,
  normalizeOpenedDocumentTabAppearanceColors,
  recomputeOpenedDocumentTabHasUnsavedChanges
} from 'app/src/scripts/openedDocuments/openedDocumentTabAppearanceWiring'
import {
  duplicateOpenedDocumentTabs
} from 'app/src/scripts/openedDocuments/functions/openedDocumentTabDomain'
import { normalizeOpenedDocumentTabEditState } from 'app/src/scripts/openedDocuments/functions/openedDocumentEditStateDomain'
import { normalizeOpenedDocumentTabPersistenceState } from 'app/src/scripts/openedDocuments/functions/openedDocumentTemporaryDomain'
import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'

export function buildFaOpenedDocumentsSnapshot (input: {
  activeDocumentId: string | null
  tabs: readonly I_faOpenedDocumentTab[]
}): I_faOpenedDocumentsSnapshot {
  return {
    schemaVersion: FA_OPENED_DOCUMENTS_SNAPSHOT_SCHEMA_VERSION,
    activeDocumentId: input.activeDocumentId,
    tabs: duplicateOpenedDocumentTabs(input.tabs)
  }
}

export function hydrateFaOpenedDocumentsTabsFromSnapshot (
  snapshot: I_faOpenedDocumentsSnapshot
): {
    activeDocumentId: string | null
    tabs: I_faOpenedDocumentTab[]
  } {
  return {
    activeDocumentId: snapshot.activeDocumentId,
    tabs: duplicateOpenedDocumentTabs(snapshot.tabs)
      .map(normalizeOpenedDocumentTabPersistenceState)
      .map(normalizeOpenedDocumentTabAppearanceColors)
      .map(normalizeOpenedDocumentTabEditState)
  }
}

export function createFaOpenedDocumentTabFromOpenMeta (input: {
  documentId: string
  displayName: string
  treeMeta: I_faOpenedDocumentTreeOpenMeta
  worldId: string
  documentTextColor?: string | null | undefined
  documentBackgroundColor?: string | null | undefined
  isCategory?: boolean | undefined
  isFinished?: boolean | undefined
  isMinor?: boolean | undefined
  isDead?: boolean | undefined
  parentDocumentId?: string | null | undefined
}): I_faOpenedDocumentTab {
  const documentTextColor = normalizeOpenedDocumentAppearanceColorFromDb(input.documentTextColor)
  const documentBackgroundColor = normalizeOpenedDocumentAppearanceColorFromDb(
    input.documentBackgroundColor
  )
  const parentDocumentId = normalizeOpenedDocumentParentIdFromDb(input.parentDocumentId)
  const isCategory = input.isCategory === true
  const isFinished = input.isFinished === true
  const isMinor = input.isMinor === true
  const isDead = input.isDead === true
  return {
    documentId: input.documentId,
    persistenceState: 'persisted',
    tabLabel: input.treeMeta.tabLabel,
    templateIcon: input.treeMeta.templateIcon,
    displayNameDraft: input.displayName,
    savedDisplayName: input.displayName,
    documentTextColorDraft: documentTextColor,
    savedDocumentTextColor: documentTextColor,
    documentBackgroundColorDraft: documentBackgroundColor,
    savedDocumentBackgroundColor: documentBackgroundColor,
    isCategoryDraft: isCategory,
    savedIsCategory: isCategory,
    isFinishedDraft: isFinished,
    savedIsFinished: isFinished,
    isMinorDraft: isMinor,
    savedIsMinor: isMinor,
    isDeadDraft: isDead,
    savedIsDead: isDead,
    parentDocumentIdDraft: parentDocumentId,
    savedParentDocumentId: parentDocumentId,
    hasUnsavedChanges: false,
    editState: FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE,
    worldId: input.worldId
  }
}

export function applyFaOpenedDocumentDisplayNameDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: string
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    displayNameDraft: nextDraft
  }
  return {
    ...nextTab,
    hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  }
}

export function applyFaOpenedDocumentTextColorDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: string
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    documentTextColorDraft: nextDraft
  }
  return {
    ...nextTab,
    hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  }
}

export function applyFaOpenedDocumentBackgroundColorDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: string
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    documentBackgroundColorDraft: nextDraft
  }
  return {
    ...nextTab,
    hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  }
}

export function applyFaOpenedDocumentIsCategoryDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: boolean
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    isCategoryDraft: nextDraft
  }
  return {
    ...nextTab,
    hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  }
}

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

export function applyFaOpenedDocumentTabEditState (
  tab: I_faOpenedDocumentTab,
  editState: boolean
): I_faOpenedDocumentTab {
  return {
    ...tab,
    editState
  }
}

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
  }
): I_faOpenedDocumentTab {
  return {
    ...tab,
    displayNameDraft: input.savedDisplayName,
    documentTextColorDraft: input.savedDocumentTextColor,
    documentBackgroundColorDraft: input.savedDocumentBackgroundColor,
    editState: input.keepEditMode ? tab.editState : FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE,
    hasUnsavedChanges: false,
    isCategoryDraft: input.savedIsCategory,
    isFinishedDraft: input.savedIsFinished,
    isMinorDraft: input.savedIsMinor,
    isDeadDraft: input.savedIsDead,
    parentDocumentIdDraft: input.savedParentDocumentId,
    savedDisplayName: input.savedDisplayName,
    savedDocumentTextColor: input.savedDocumentTextColor,
    savedDocumentBackgroundColor: input.savedDocumentBackgroundColor,
    savedIsCategory: input.savedIsCategory,
    savedIsFinished: input.savedIsFinished,
    savedIsMinor: input.savedIsMinor,
    savedIsDead: input.savedIsDead,
    savedParentDocumentId: input.savedParentDocumentId
  }
}
