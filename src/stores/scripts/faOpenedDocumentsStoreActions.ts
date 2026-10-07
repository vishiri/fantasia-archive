import type {
  I_faOpenedDocumentTab,
  I_faOpenedDocumentTreeOpenMeta,
  I_faOpenedDocumentsSnapshot
} from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENTS_SNAPSHOT_SCHEMA_VERSION } from 'app/types/I_faOpenedDocumentsDomain'
import {
  duplicateOpenedDocumentTabs,
  normalizeOpenedDocumentAppearanceColorFromDb,
  normalizeOpenedDocumentExtraClassesFromDb,
  normalizeOpenedDocumentParentIdFromDb,
  normalizeOpenedDocumentTabAppearanceColors,
  normalizeOpenedDocumentTabEditState,
  normalizeOpenedDocumentTabPersistenceState,
  normalizeOpenedDocumentTreeOrderNumberFromDb,
  recomputeOpenedDocumentTabHasUnsavedChanges
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'
import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY } from 'app/types/I_faDocumentTreeOrderNumber'

function withFaOpenedDocumentRecomputedUnsavedChanges (
  nextTab: I_faOpenedDocumentTab
): I_faOpenedDocumentTab {
  const hasUnsavedChanges = recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
  return {
    ...nextTab,
    hasUnsavedChanges
  }
}

export function buildFaOpenedDocumentsSnapshot (input: {
  activeDocumentId: string | null
  tabs: readonly I_faOpenedDocumentTab[]
}): I_faOpenedDocumentsSnapshot {
  const activeDocumentId = input.activeDocumentId
  const tabs = duplicateOpenedDocumentTabs(input.tabs)
  return {
    schemaVersion: FA_OPENED_DOCUMENTS_SNAPSHOT_SCHEMA_VERSION,
    activeDocumentId,
    tabs
  }
}

export function hydrateFaOpenedDocumentsTabsFromSnapshot (
  snapshot: I_faOpenedDocumentsSnapshot
): {
    activeDocumentId: string | null
    tabs: I_faOpenedDocumentTab[]
  } {
  const activeDocumentId = snapshot.activeDocumentId
  const tabs = duplicateOpenedDocumentTabs(snapshot.tabs)
    .map(normalizeOpenedDocumentTabPersistenceState)
    .map(normalizeOpenedDocumentTabAppearanceColors)
    .map(normalizeOpenedDocumentTabEditState)
  return {
    activeDocumentId,
    tabs
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
  treeOrderNumber?: number | undefined
  extraClasses?: string | null | undefined
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
  const treeOrderNumberDraft = normalizeOpenedDocumentTreeOrderNumberFromDb(input.treeOrderNumber)
  const savedTreeOrderNumber = input.treeOrderNumber ?? FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
  const savedExtraClasses = normalizeOpenedDocumentExtraClassesFromDb(input.extraClasses)
  const documentId = input.documentId
  const tabLabel = input.treeMeta.tabLabel
  const templateIcon = input.treeMeta.templateIcon
  const displayNameDraft = input.displayName
  const worldId = input.worldId
  const tagsDraft: I_faOpenedDocumentTab['tagsDraft'] = []
  const savedTags: I_faOpenedDocumentTab['savedTags'] = []
  return {
    documentId,
    persistenceState: 'persisted',
    tabLabel,
    templateIcon,
    displayNameDraft,
    savedDisplayName: displayNameDraft,
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
    treeOrderNumberDraft,
    savedTreeOrderNumber,
    extraClassesDraft: savedExtraClasses,
    savedExtraClasses,
    tagsDraft,
    savedTags,
    hasUnsavedChanges: false,
    editState: FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE,
    worldId
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
  return withFaOpenedDocumentRecomputedUnsavedChanges(nextTab)
}

export function applyFaOpenedDocumentTextColorDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: string
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    documentTextColorDraft: nextDraft
  }
  return withFaOpenedDocumentRecomputedUnsavedChanges(nextTab)
}

export function applyFaOpenedDocumentBackgroundColorDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: string
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    documentBackgroundColorDraft: nextDraft
  }
  return withFaOpenedDocumentRecomputedUnsavedChanges(nextTab)
}

export function applyFaOpenedDocumentIsCategoryDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: boolean
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    isCategoryDraft: nextDraft
  }
  return withFaOpenedDocumentRecomputedUnsavedChanges(nextTab)
}

export function applyFaOpenedDocumentIsFinishedDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: boolean
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    isFinishedDraft: nextDraft
  }
  return withFaOpenedDocumentRecomputedUnsavedChanges(nextTab)
}

export function applyFaOpenedDocumentIsMinorDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: boolean
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    isMinorDraft: nextDraft
  }
  return withFaOpenedDocumentRecomputedUnsavedChanges(nextTab)
}

export function applyFaOpenedDocumentIsDeadDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: boolean
): I_faOpenedDocumentTab {
  const nextTab = {
    ...tab,
    isDeadDraft: nextDraft
  }
  return withFaOpenedDocumentRecomputedUnsavedChanges(nextTab)
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
