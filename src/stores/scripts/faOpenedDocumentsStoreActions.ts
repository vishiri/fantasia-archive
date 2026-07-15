import type { Ref } from 'vue'

import type {
  I_faOpenedDocumentTab,
  I_faOpenedDocumentTreeOpenMeta,
  I_faOpenedDocumentsSnapshot,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENTS_SNAPSHOT_SCHEMA_VERSION } from 'app/types/I_faOpenedDocumentsDomain'
import {
  normalizeOpenedDocumentAppearanceColorFromDb,
  normalizeOpenedDocumentTabAppearanceColors,
  recomputeOpenedDocumentTabHasUnsavedChanges
} from 'app/src/scripts/openedDocuments/openedDocumentTabAppearanceWiring'
import {
  appendOpenedDocumentTabToRight,
  duplicateOpenedDocumentTabs,
  findOpenedDocumentTabIndexByDocumentId,
  removeOpenedDocumentTabAtIndex,
  resolveOpenedDocumentTabFocusIndexAfterClose
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
}): I_faOpenedDocumentTab {
  const documentTextColor = normalizeOpenedDocumentAppearanceColorFromDb(input.documentTextColor)
  const documentBackgroundColor = normalizeOpenedDocumentAppearanceColorFromDb(
    input.documentBackgroundColor
  )
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
  }
): I_faOpenedDocumentTab {
  return {
    ...tab,
    displayNameDraft: input.savedDisplayName,
    documentTextColorDraft: input.savedDocumentTextColor,
    documentBackgroundColorDraft: input.savedDocumentBackgroundColor,
    editState: input.keepEditMode ? tab.editState : FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE,
    hasUnsavedChanges: false,
    savedDisplayName: input.savedDisplayName,
    savedDocumentTextColor: input.savedDocumentTextColor,
    savedDocumentBackgroundColor: input.savedDocumentBackgroundColor
  }
}

export function resolveFaOpenedDocumentOpenFromTree (deps: {
  documentId: string
  mode: T_faOpenedDocumentOpenMode
  tabs: Ref<I_faOpenedDocumentTab[]>
  activeDocumentId: Ref<string | null>
  newTab: I_faOpenedDocumentTab
}): {
    shouldNavigate: boolean
    navigateDocumentId: string | null
  } {
  const existingIndex = findOpenedDocumentTabIndexByDocumentId(
    deps.tabs.value,
    deps.documentId
  )
  if (existingIndex === -1) {
    deps.tabs.value = appendOpenedDocumentTabToRight(deps.tabs.value, deps.newTab)
  }
  deps.activeDocumentId.value = deps.documentId
  return {
    shouldNavigate: true,
    navigateDocumentId: deps.documentId
  }
}

export function removeFaOpenedDocumentTabAtIndex (deps: {
  tabs: Ref<I_faOpenedDocumentTab[]>
  activeDocumentId: Ref<string | null>
  lastRemovedIndex: Ref<number>
  removedIndex: number
}): {
    nextActiveDocumentId: string | null
    shouldNavigateHome: boolean
  } {
  deps.lastRemovedIndex.value = deps.removedIndex
  const nextTabs = removeOpenedDocumentTabAtIndex(deps.tabs.value, deps.removedIndex)
  deps.tabs.value = nextTabs
  const focusIndex = resolveOpenedDocumentTabFocusIndexAfterClose(
    deps.removedIndex,
    nextTabs.length
  )
  if (focusIndex < 0) {
    deps.activeDocumentId.value = null
    return {
      nextActiveDocumentId: null,
      shouldNavigateHome: true
    }
  }
  const nextTab = nextTabs[focusIndex]
  if (nextTab === undefined) {
    deps.activeDocumentId.value = null
    return {
      nextActiveDocumentId: null,
      shouldNavigateHome: true
    }
  }
  deps.activeDocumentId.value = nextTab.documentId
  return {
    nextActiveDocumentId: nextTab.documentId,
    shouldNavigateHome: false
  }
}

export function resolveFaOpenedDocumentsActiveDocumentSyncTarget (input: {
  currentActiveDocumentId: string | null
  routeDocumentId: string | null
  routePath: string
  tabs: readonly I_faOpenedDocumentTab[]
}): string | null {
  if (input.routeDocumentId !== null) {
    if (findOpenedDocumentTabIndexByDocumentId(input.tabs, input.routeDocumentId) === -1) {
      return input.currentActiveDocumentId
    }
    return input.routeDocumentId
  }

  if (input.routePath === '/home') {
    return null
  }

  return input.currentActiveDocumentId
}
