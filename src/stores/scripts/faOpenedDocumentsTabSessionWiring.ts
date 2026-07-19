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
} from 'app/src/scripts/openedDocuments/functions/openedDocumentTabDomain'

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
