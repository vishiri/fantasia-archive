import type { Ref } from 'vue'

import type {
  I_faOpenedDocumentTab,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'
import {
  appendOpenedDocumentTabToRight,
  findOpenedDocumentTabIndexByDocumentId,
  removeOpenedDocumentTabAtIndex,
  resolveOpenedDocumentTabFocusIndexAfterClose
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'

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
  if (deps.mode === 'middleBackground') {
    return {
      shouldNavigate: false,
      navigateDocumentId: null
    }
  }
  deps.activeDocumentId.value = deps.documentId
  const navigateDocumentId = deps.documentId
  return {
    shouldNavigate: true,
    navigateDocumentId
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
  const removedTab = deps.tabs.value[deps.removedIndex]
  const removedDocumentId = removedTab?.documentId
  deps.lastRemovedIndex.value = deps.removedIndex
  const nextTabs = removeOpenedDocumentTabAtIndex(deps.tabs.value, deps.removedIndex)
  deps.tabs.value = nextTabs
  const removedWasActive = removedDocumentId !== undefined &&
    deps.activeDocumentId.value === removedDocumentId
  if (!removedWasActive) {
    const nextActiveDocumentId = deps.activeDocumentId.value
    const shouldNavigateHome = false
    return {
      nextActiveDocumentId,
      shouldNavigateHome
    }
  }
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
  const nextActiveDocumentId = nextTab.documentId
  deps.activeDocumentId.value = nextActiveDocumentId
  return {
    nextActiveDocumentId,
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
