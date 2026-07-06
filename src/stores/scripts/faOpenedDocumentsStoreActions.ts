import type { Ref } from 'vue'

import type {
  I_faOpenedDocumentTab,
  I_faOpenedDocumentTreeOpenMeta,
  I_faOpenedDocumentsSnapshot,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'
import { normalizeOpenedDocumentTabEditState } from 'app/src/scripts/openedDocuments/functions/openedDocumentEditStateDomain'
import {
  appendOpenedDocumentTabToRight,
  computeOpenedDocumentHasUnsavedChanges,
  duplicateOpenedDocumentTabs,
  findOpenedDocumentTabIndexByDocumentId,
  removeOpenedDocumentTabAtIndex,
  resolveOpenedDocumentTabFocusIndexAfterClose
} from 'app/src/scripts/openedDocuments/functions/openedDocumentTabDomain'
import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'

export function buildFaOpenedDocumentsSnapshot (input: {
  activeDocumentId: string | null
  tabs: readonly I_faOpenedDocumentTab[]
}): I_faOpenedDocumentsSnapshot {
  return {
    schemaVersion: 1,
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
    tabs: duplicateOpenedDocumentTabs(snapshot.tabs).map(normalizeOpenedDocumentTabEditState)
  }
}

export function createFaOpenedDocumentTabFromOpenMeta (input: {
  documentId: string
  displayName: string
  treeMeta: I_faOpenedDocumentTreeOpenMeta
}): I_faOpenedDocumentTab {
  return {
    documentId: input.documentId,
    tabLabel: input.treeMeta.tabLabel,
    templateIcon: input.treeMeta.templateIcon,
    displayNameDraft: input.displayName,
    savedDisplayName: input.displayName,
    hasUnsavedChanges: false,
    editState: FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE
  }
}

export function applyFaOpenedDocumentDisplayNameDraft (
  tab: I_faOpenedDocumentTab,
  nextDraft: string
): I_faOpenedDocumentTab {
  const hasUnsavedChanges = computeOpenedDocumentHasUnsavedChanges(
    nextDraft,
    tab.savedDisplayName
  )
  return {
    ...tab,
    displayNameDraft: nextDraft,
    hasUnsavedChanges
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
  }
): I_faOpenedDocumentTab {
  return {
    ...tab,
    displayNameDraft: input.savedDisplayName,
    editState: input.keepEditMode ? tab.editState : FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE,
    hasUnsavedChanges: false,
    savedDisplayName: input.savedDisplayName
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
  if (existingIndex !== -1) {
    if (deps.mode === 'middleBackground') {
      return {
        shouldNavigate: false,
        navigateDocumentId: null
      }
    }
    deps.activeDocumentId.value = deps.documentId
    return {
      shouldNavigate: true,
      navigateDocumentId: deps.documentId
    }
  }
  deps.tabs.value = appendOpenedDocumentTabToRight(deps.tabs.value, deps.newTab)
  if (deps.mode === 'leftNavigate') {
    deps.activeDocumentId.value = deps.documentId
    return {
      shouldNavigate: true,
      navigateDocumentId: deps.documentId
    }
  }
  return {
    shouldNavigate: false,
    navigateDocumentId: null
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
