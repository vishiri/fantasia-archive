import { defineStore } from 'pinia'
import debounce from 'lodash-es/debounce.js'
import { readonly, ref, watch } from 'vue'

import type { Ref } from 'vue'

import type {
  I_faOpenedDocumentTab,
  I_faOpenedDocumentTreeOpenMeta,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT } from 'app/types/I_faOpenedDocumentsDomain'
import {
  navigateToOpenedDocumentRoute,
  navigateToWorkspaceHomeRoute
} from 'app/src/scripts/appInternals/faAppRouterSession_manager'
import {
  applyFaOpenedDocumentDisplayNameDraft,
  applyFaOpenedDocumentTabAfterDisplayNameSave,
  applyFaOpenedDocumentTabEditState,
  buildFaOpenedDocumentsSnapshot,
  createFaOpenedDocumentTabFromOpenMeta,
  hydrateFaOpenedDocumentsTabsFromSnapshot,
  removeFaOpenedDocumentTabAtIndex,
  resolveFaOpenedDocumentOpenFromTree,
  resolveFaOpenedDocumentsActiveDocumentSyncTarget
} from 'app/src/stores/scripts/faOpenedDocumentsStoreActions'
import {
  duplicateOpenedDocumentTabs,
  findOpenedDocumentTabIndexByDocumentId
} from 'app/src/scripts/openedDocuments/functions/openedDocumentTabDomain'
import { resolveFaDocumentWorkspaceRouteDocumentId } from 'app/src/scripts/appRouting/appRouting_manager'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import {
  faOpenedDocumentsPersistSnapshotFromBridge,
  faOpenedDocumentsRefreshSnapshotFromBridge
} from 'app/src/stores/scripts/sFaOpenedDocumentsBridge'

const OPENED_DOCUMENTS_PERSIST_DEBOUNCE_MS = 500

/**
 * Workspace session state for opened document tabs, drafts, and SQLite snapshot persistence.
 */
export const S_FaOpenedDocuments = defineStore('S_FaOpenedDocuments', () => {
  const tabs: Ref<I_faOpenedDocumentTab[]> = ref([])
  const activeDocumentId: Ref<string | null> = ref(null)
  const lastRemovedIndex: Ref<number> = ref(-1)
  const pendingCloseDocumentId: Ref<string | null> = ref(null)
  const hydrationComplete: Ref<boolean> = ref(false)

  let persistInFlight: Promise<boolean> | null = null

  function buildCurrentSnapshot () {
    return buildFaOpenedDocumentsSnapshot({
      activeDocumentId: activeDocumentId.value,
      tabs: tabs.value
    })
  }

  const schedulePersistSnapshot = debounce(() => {
    void flushPersistSnapshot()
  }, OPENED_DOCUMENTS_PERSIST_DEBOUNCE_MS)

  async function flushPersistSnapshot (): Promise<boolean> {
    if (!S_FaActiveProject().hasActiveProject) {
      return false
    }
    const snapshot = buildCurrentSnapshot()
    const write = faOpenedDocumentsPersistSnapshotFromBridge(snapshot)
    persistInFlight = write
    const ok = await write
    if (persistInFlight === write) {
      persistInFlight = null
    }
    return ok
  }

  function resetSessionState (): void {
    tabs.value = []
    activeDocumentId.value = null
    lastRemovedIndex.value = -1
    pendingCloseDocumentId.value = null
    hydrationComplete.value = false
    schedulePersistSnapshot.cancel()
  }

  async function validateAndFilterTabsFromSnapshot (): Promise<void> {
    const api = window.faContentBridgeAPIs?.projectContent
    if (typeof api?.getDocumentById !== 'function') {
      return
    }
    const nextTabs: I_faOpenedDocumentTab[] = []
    for (const tab of tabs.value) {
      try {
        const doc = await api.getDocumentById(tab.documentId)
        const savedDisplayName = doc.displayName
        const displayNameDraft = tab.hasUnsavedChanges ? tab.displayNameDraft : savedDisplayName
        nextTabs.push({
          ...tab,
          displayNameDraft,
          savedDisplayName,
          hasUnsavedChanges: displayNameDraft !== savedDisplayName
        })
      } catch {
        // Drop tabs whose document row no longer exists.
      }
    }
    tabs.value = nextTabs
    if (
      activeDocumentId.value !== null &&
      findOpenedDocumentTabIndexByDocumentId(tabs.value, activeDocumentId.value) === -1
    ) {
      const lastTab = tabs.value[tabs.value.length - 1]
      activeDocumentId.value = lastTab?.documentId ?? null
    }
  }

  async function hydrateFromProjectDatabase (): Promise<void> {
    resetSessionState()
    if (!S_FaActiveProject().hasActiveProject) {
      hydrationComplete.value = true
      return
    }
    const snapshot = await faOpenedDocumentsRefreshSnapshotFromBridge()
    const resolved = snapshot ?? FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT
    const hydrated = hydrateFaOpenedDocumentsTabsFromSnapshot(resolved)
    tabs.value = hydrated.tabs
    activeDocumentId.value = hydrated.activeDocumentId
    await validateAndFilterTabsFromSnapshot()
    hydrationComplete.value = true
    if (activeDocumentId.value !== null) {
      await navigateToOpenedDocumentRoute(activeDocumentId.value)
    }
  }

  async function clearSession (): Promise<void> {
    schedulePersistSnapshot.cancel()
    if (persistInFlight !== null) {
      await persistInFlight
    }
    resetSessionState()
  }

  async function seedDocumentBaselineIfNeeded (
    documentId: string,
    treeMeta: I_faOpenedDocumentTreeOpenMeta
  ): Promise<I_faOpenedDocumentTab | null> {
    const api = window.faContentBridgeAPIs?.projectContent
    if (typeof api?.getDocumentById !== 'function') {
      return null
    }
    try {
      const doc = await api.getDocumentById(documentId)
      return createFaOpenedDocumentTabFromOpenMeta({
        documentId,
        displayName: doc.displayName,
        treeMeta
      })
    } catch {
      return null
    }
  }

  async function openFromTree (
    documentId: string,
    mode: T_faOpenedDocumentOpenMode,
    treeMeta: I_faOpenedDocumentTreeOpenMeta
  ): Promise<void> {
    const existingIndex = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    let newTab: I_faOpenedDocumentTab | null = null
    if (existingIndex === -1) {
      newTab = await seedDocumentBaselineIfNeeded(documentId, treeMeta)
      if (newTab === null) {
        return
      }
    } else {
      newTab = tabs.value[existingIndex] ?? null
      if (newTab === null) {
        return
      }
    }
    const openResult = resolveFaOpenedDocumentOpenFromTree({
      activeDocumentId,
      documentId,
      mode,
      newTab,
      tabs
    })
    schedulePersistSnapshot()
    if (openResult.shouldNavigate && openResult.navigateDocumentId !== null) {
      await navigateToOpenedDocumentRoute(openResult.navigateDocumentId)
    }
  }

  async function focusTab (documentId: string): Promise<void> {
    if (findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId) === -1) {
      return
    }
    activeDocumentId.value = documentId
    schedulePersistSnapshot()
    await navigateToOpenedDocumentRoute(documentId)
  }

  function updateDisplayNameDraft (documentId: string, value: string): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentDisplayNameDraft(current, value)
    tabs.value = nextTabs
    schedulePersistSnapshot()
  }

  function setDocumentEditState (documentId: string, editState: boolean): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    if (current.editState === editState) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentTabEditState(current, editState)
    tabs.value = nextTabs
    schedulePersistSnapshot()
  }

  function enterDocumentEditMode (documentId: string): void {
    setDocumentEditState(documentId, true)
  }

  async function saveDocumentDisplayName (
    documentId: string,
    input: { keepEditMode: boolean }
  ): Promise<boolean> {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return false
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return false
    }
    const api = window.faContentBridgeAPIs?.projectContent
    if (typeof api?.updateDocument !== 'function') {
      return false
    }
    const trimmedDraft = current.displayNameDraft.trim()
    if (trimmedDraft.length === 0) {
      return false
    }
    if (!input.keepEditMode && typeof document !== 'undefined') {
      const activeElement = document.activeElement
      if (activeElement instanceof HTMLElement) {
        activeElement.blur()
      }
    }
    try {
      const savedDocument = await api.updateDocument(documentId, {
        displayName: trimmedDraft
      })
      const nextTabs = [...tabs.value]
      nextTabs[index] = applyFaOpenedDocumentTabAfterDisplayNameSave(current, {
        keepEditMode: input.keepEditMode,
        savedDisplayName: savedDocument.displayName
      })
      tabs.value = nextTabs
      schedulePersistSnapshot.flush()
      await flushPersistSnapshot()
      S_FaProjectHierarchyTree().refreshDocumentsInTree([documentId])
      return true
    } catch (error) {
      console.error('[S_FaOpenedDocuments] saveDocumentDisplayName failed', error)
      return false
    }
  }

  function requestCloseTab (documentId: string): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const tab = tabs.value[index]
    if (tab === undefined) {
      return
    }
    if (tab.hasUnsavedChanges) {
      pendingCloseDocumentId.value = documentId
      return
    }
    void confirmDiscardAndClose(documentId)
  }

  function dismissPendingClose (): void {
    pendingCloseDocumentId.value = null
  }

  async function confirmDiscardAndClose (documentId: string): Promise<void> {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      pendingCloseDocumentId.value = null
      return
    }
    const wasActive = activeDocumentId.value === documentId
    const closeResult = removeFaOpenedDocumentTabAtIndex({
      activeDocumentId,
      lastRemovedIndex,
      removedIndex: index,
      tabs
    })
    pendingCloseDocumentId.value = null
    schedulePersistSnapshot.flush()
    if (wasActive) {
      if (closeResult.shouldNavigateHome) {
        await navigateToWorkspaceHomeRoute()
      } else if (closeResult.nextActiveDocumentId !== null) {
        await navigateToOpenedDocumentRoute(closeResult.nextActiveDocumentId)
      }
    }
    await flushPersistSnapshot()
  }

  function findTabByDocumentId (documentId: string): I_faOpenedDocumentTab | null {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return null
    }
    return tabs.value[index] ?? null
  }

  function syncActiveDocumentIdFromWorkspaceRoute (routePath: string): void {
    if (!hydrationComplete.value) {
      return
    }
    const nextActiveDocumentId = resolveFaOpenedDocumentsActiveDocumentSyncTarget({
      currentActiveDocumentId: activeDocumentId.value,
      routeDocumentId: resolveFaDocumentWorkspaceRouteDocumentId(routePath),
      routePath,
      tabs: tabs.value
    })
    if (nextActiveDocumentId === activeDocumentId.value) {
      return
    }
    activeDocumentId.value = nextActiveDocumentId
    schedulePersistSnapshot()
  }

  function replaceSessionForComponentTesting (input: {
    activeDocumentId: string | null
    tabs: I_faOpenedDocumentTab[]
  }): void {
    tabs.value = duplicateOpenedDocumentTabs(input.tabs)
    activeDocumentId.value = input.activeDocumentId
    hydrationComplete.value = true
  }

  watch(
    () => [tabs.value, activeDocumentId.value] as const,
    () => {
      if (!hydrationComplete.value) {
        return
      }
      schedulePersistSnapshot()
    },
    { deep: true }
  )

  return {
    activeDocumentId: readonly(activeDocumentId),
    confirmDiscardAndClose,
    dismissPendingClose,
    findTabByDocumentId,
    flushPersistSnapshot,
    focusTab,
    hydrateFromProjectDatabase,
    hydrationComplete: readonly(hydrationComplete),
    clearSession,
    enterDocumentEditMode,
    openFromTree,
    pendingCloseDocumentId: readonly(pendingCloseDocumentId),
    replaceSessionForComponentTesting,
    requestCloseTab,
    saveDocumentDisplayName,
    setDocumentEditState,
    syncActiveDocumentIdFromWorkspaceRoute,
    tabs: readonly(tabs),
    updateDisplayNameDraft
  }
})
