import { ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  applyFaOpenedDocumentBackgroundColorDraft,
  applyFaOpenedDocumentDisplayNameDraft,
  applyFaOpenedDocumentIsCategoryDraft,
  applyFaOpenedDocumentIsDeadDraft,
  applyFaOpenedDocumentIsFinishedDraft,
  applyFaOpenedDocumentIsMinorDraft,
  applyFaOpenedDocumentTabAfterDisplayNameSave,
  applyFaOpenedDocumentTabEditState,
  applyFaOpenedDocumentTextColorDraft,
  buildFaOpenedDocumentsSnapshot,
  createFaOpenedDocumentTabFromOpenMeta,
  hydrateFaOpenedDocumentsTabsFromSnapshot
} from '../faOpenedDocumentsStoreActions'
import {
  applyFaOpenedDocumentParentIdDraft,
  applyFaOpenedDocumentParentIdSyncFromHierarchy
} from '../faOpenedDocumentsParentIdStoreActions'
import { applyFaOpenedDocumentTreeOrderNumberDraft } from '../faOpenedDocumentsTreeOrderNumberStoreActions'
import {
  removeFaOpenedDocumentTabAtIndex,
  resolveFaOpenedDocumentOpenFromTree,
  resolveFaOpenedDocumentsActiveDocumentSyncTarget
} from '../faOpenedDocumentsTabSessionWiring'

const baseTab: I_faOpenedDocumentTab = {
  documentId: 'doc-1',
  persistenceState: 'persisted',
  tabLabel: 'Hero',
  templateIcon: 'mdi-account',
  displayNameDraft: 'Hero',
  savedDisplayName: 'Hero',
  documentTextColorDraft: '',
  savedDocumentTextColor: '',
  documentBackgroundColorDraft: '',
  savedDocumentBackgroundColor: '',
  isCategoryDraft: false,
  savedIsCategory: false,
  isFinishedDraft: false,
  isMinorDraft: false,
  isDeadDraft: false,
  savedIsFinished: false,
  savedIsMinor: false,
  savedIsDead: false,
  parentDocumentIdDraft: '',
  savedParentDocumentId: '',
  treeOrderNumberDraft: '',
  savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  hasUnsavedChanges: false,
  editState: false
}

/**
 * resolveFaOpenedDocumentOpenFromTree
 * Left navigate on an existing tab focuses without appending.
 */
test('Test that resolveFaOpenedDocumentOpenFromTree focuses an existing tab on left navigate', () => {
  const tabs = ref([baseTab])
  const activeDocumentId = ref<string | null>(null)
  const result = resolveFaOpenedDocumentOpenFromTree({
    activeDocumentId,
    documentId: 'doc-1',
    mode: 'leftNavigate',
    newTab: baseTab,
    tabs
  })
  expect(result.shouldNavigate).toBe(true)
  expect(result.navigateDocumentId).toBe('doc-1')
  expect(tabs.value).toHaveLength(1)
  expect(activeDocumentId.value).toBe('doc-1')
})

/**
 * resolveFaOpenedDocumentOpenFromTree
 * Middle background on an existing tab focuses and navigates.
 */
test('Test that resolveFaOpenedDocumentOpenFromTree focuses an existing tab on middle background', () => {
  const tabs = ref([baseTab])
  const activeDocumentId = ref<string | null>(null)
  const result = resolveFaOpenedDocumentOpenFromTree({
    activeDocumentId,
    documentId: 'doc-1',
    mode: 'middleBackground',
    newTab: baseTab,
    tabs
  })
  expect(result.shouldNavigate).toBe(true)
  expect(result.navigateDocumentId).toBe('doc-1')
  expect(tabs.value).toHaveLength(1)
  expect(activeDocumentId.value).toBe('doc-1')
})

test('Test that resolveFaOpenedDocumentOpenFromTree appends middle background tab with navigation', () => {
  const tabs = ref<I_faOpenedDocumentTab[]>([])
  const activeDocumentId = ref<string | null>(null)
  const newTab = createFaOpenedDocumentTabFromOpenMeta({
    displayName: 'Side quest',
    documentId: 'doc-2',
    treeMeta: {
      tabLabel: 'Quest',
      templateIcon: 'mdi-map'
    },
    worldId: 'world-1'
  })
  const result = resolveFaOpenedDocumentOpenFromTree({
    activeDocumentId,
    documentId: 'doc-2',
    mode: 'middleBackground',
    newTab,
    tabs
  })
  expect(result.shouldNavigate).toBe(true)
  expect(result.navigateDocumentId).toBe('doc-2')
  expect(tabs.value).toHaveLength(1)
  expect(activeDocumentId.value).toBe('doc-2')
})

/**
 * removeFaOpenedDocumentTabAtIndex
 * Closing the last tab requests navigation home.
 */
test('Test that removeFaOpenedDocumentTabAtIndex navigates home when the last tab closes', () => {
  const tabs = ref([baseTab])
  const activeDocumentId = ref<string | null>('doc-1')
  const lastRemovedIndex = ref(-1)
  const result = removeFaOpenedDocumentTabAtIndex({
    activeDocumentId,
    lastRemovedIndex,
    removedIndex: 0,
    tabs
  })
  expect(result.shouldNavigateHome).toBe(true)
  expect(result.nextActiveDocumentId).toBeNull()
  expect(tabs.value).toHaveLength(0)
})

/**
 * applyFaOpenedDocumentDisplayNameDraft
 * Draft edits mark tabs dirty when they differ from the saved baseline.
 */
test('Test that applyFaOpenedDocumentDisplayNameDraft marks unsaved changes', () => {
  const next = applyFaOpenedDocumentDisplayNameDraft(baseTab, 'Renamed Hero')
  expect(next.hasUnsavedChanges).toBe(true)
  expect(next.displayNameDraft).toBe('Renamed Hero')
})

test('Test that applyFaOpenedDocumentTextColorDraft marks unsaved changes', () => {
  const next = applyFaOpenedDocumentTextColorDraft(baseTab, '#AABBCC')
  expect(next.documentTextColorDraft).toBe('#AABBCC')
  expect(next.hasUnsavedChanges).toBe(true)
})

test('Test that applyFaOpenedDocumentBackgroundColorDraft marks unsaved changes', () => {
  const next = applyFaOpenedDocumentBackgroundColorDraft(baseTab, '#112233')
  expect(next.documentBackgroundColorDraft).toBe('#112233')
  expect(next.hasUnsavedChanges).toBe(true)
})

test('Test that applyFaOpenedDocumentIsCategoryDraft marks unsaved changes', () => {
  const next = applyFaOpenedDocumentIsCategoryDraft(baseTab, true)
  expect(next.isCategoryDraft).toBe(true)
  expect(next.hasUnsavedChanges).toBe(true)
})

test('Test that applyFaOpenedDocumentIsMinorDraft marks unsaved changes', () => {
  const next = applyFaOpenedDocumentIsMinorDraft(baseTab, true)
  expect(next.isMinorDraft).toBe(true)
  expect(next.hasUnsavedChanges).toBe(true)
})

test('Test that applyFaOpenedDocumentIsFinishedDraft marks unsaved changes', () => {
  const next = applyFaOpenedDocumentIsFinishedDraft(baseTab, true)
  expect(next.isFinishedDraft).toBe(true)
  expect(next.hasUnsavedChanges).toBe(true)
})

test('Test that applyFaOpenedDocumentIsDeadDraft marks unsaved changes', () => {
  const next = applyFaOpenedDocumentIsDeadDraft(baseTab, true)
  expect(next.isDeadDraft).toBe(true)
  expect(next.hasUnsavedChanges).toBe(true)
})

test('Test that applyFaOpenedDocumentParentIdSyncFromHierarchy clears parent dirty state', () => {
  const dirtyTab = {
    ...baseTab,
    displayNameDraft: 'Dirty',
    hasUnsavedChanges: true,
    parentDocumentIdDraft: 'new-parent',
    savedParentDocumentId: 'old-parent',
    treeOrderNumberDraft: '',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  }
  const synced = applyFaOpenedDocumentParentIdSyncFromHierarchy(dirtyTab, 'tree-parent')
  expect(synced.parentDocumentIdDraft).toBe('tree-parent')
  expect(synced.savedParentDocumentId).toBe('tree-parent')
  expect(synced.hasUnsavedChanges).toBe(true)
})

test('Test that applyFaOpenedDocumentTreeOrderNumberDraft marks unsaved changes when order drifts', () => {
  const next = applyFaOpenedDocumentTreeOrderNumberDraft(baseTab, '7')
  expect(next.treeOrderNumberDraft).toBe('7')
  expect(next.hasUnsavedChanges).toBe(true)
})

test('Test that applyFaOpenedDocumentParentIdDraft marks unsaved changes when parent drifts', () => {
  const next = applyFaOpenedDocumentParentIdDraft(baseTab, 'parent-2')
  expect(next.parentDocumentIdDraft).toBe('parent-2')
  expect(next.hasUnsavedChanges).toBe(true)
})

test('Test that applyFaOpenedDocumentTabEditState updates editState only', () => {
  const next = applyFaOpenedDocumentTabEditState(baseTab, true)
  expect(next.editState).toBe(true)
  expect(next.displayNameDraft).toBe(baseTab.displayNameDraft)
})

test('Test that applyFaOpenedDocumentTabAfterDisplayNameSave exits edit mode by default', () => {
  const editingTab = applyFaOpenedDocumentTabEditState(baseTab, true)
  const saved = applyFaOpenedDocumentTabAfterDisplayNameSave(editingTab, {
    keepEditMode: false,
    savedDisplayName: 'Saved Hero',
    savedDocumentBackgroundColor: '#112233',
    savedDocumentTextColor: '#AABBCC',
    savedIsCategory: true,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    savedParentDocumentId: '',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER
  })
  expect(saved.savedDisplayName).toBe('Saved Hero')
  expect(saved.hasUnsavedChanges).toBe(false)
  expect(saved.editState).toBe(false)
})

test('Test that applyFaOpenedDocumentTabAfterDisplayNameSave can keep edit mode', () => {
  const editingTab = applyFaOpenedDocumentTabEditState(baseTab, true)
  const saved = applyFaOpenedDocumentTabAfterDisplayNameSave(editingTab, {
    keepEditMode: true,
    savedDisplayName: 'Saved Hero',
    savedDocumentBackgroundColor: '',
    savedDocumentTextColor: '',
    savedIsCategory: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    savedParentDocumentId: '',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER
  })
  expect(saved.editState).toBe(true)
})

/**
 * buildFaOpenedDocumentsSnapshot
 * Snapshot builder copies active id and tab rows.
 */
test('Test that buildFaOpenedDocumentsSnapshot copies tabs and active document id', () => {
  const snapshot = buildFaOpenedDocumentsSnapshot({
    activeDocumentId: 'doc-1',
    tabs: [baseTab]
  })
  expect(snapshot.schemaVersion).toBe(2)
  expect(snapshot.activeDocumentId).toBe('doc-1')
  expect(snapshot.tabs[0]?.documentId).toBe('doc-1')
})

test('Test that buildFaOpenedDocumentsSnapshot clones temporaryParentResolveDocumentIds', () => {
  const sourceIds = ['doc-parent', 'doc-root']
  const snapshot = buildFaOpenedDocumentsSnapshot({
    activeDocumentId: 'temp-1',
    tabs: [{
      ...baseTab,
      documentId: 'temp-1',
      parentDocumentId: 'doc-parent',
      persistenceState: 'temporary',
      templateId: 'tpl-1',
      temporaryParentResolveDocumentIds: sourceIds,
      worldId: 'world-1'
    }]
  })
  expect(snapshot.tabs[0]?.temporaryParentResolveDocumentIds).toEqual(sourceIds)
  expect(snapshot.tabs[0]?.temporaryParentResolveDocumentIds).not.toBe(sourceIds)
})

/**
 * createFaOpenedDocumentTabFromOpenMeta
 * New tabs seed draft and saved names from document display name.
 */
test('Test that createFaOpenedDocumentTabFromOpenMeta seeds draft from display name', () => {
  const tab = createFaOpenedDocumentTabFromOpenMeta({
    displayName: 'Villain',
    documentId: 'doc-2',
    treeMeta: {
      tabLabel: 'Character',
      templateIcon: 'mdi-skull'
    },
    worldId: 'world-1'
  })
  expect(tab.displayNameDraft).toBe('Villain')
  expect(tab.savedDisplayName).toBe('Villain')
  expect(tab.tabLabel).toBe('Character')
  expect(tab.editState).toBe(false)
  expect(tab.worldId).toBe('world-1')
})

test('Test that createFaOpenedDocumentTabFromOpenMeta seeds appearance colors from database values', () => {
  const tab = createFaOpenedDocumentTabFromOpenMeta({
    displayName: 'Villain',
    documentBackgroundColor: '#112233',
    documentId: 'doc-2',
    documentTextColor: '#AABBCC',
    treeMeta: {
      tabLabel: 'Character',
      templateIcon: 'mdi-skull'
    },
    worldId: 'world-1'
  })
  expect(tab.documentTextColorDraft).toBe('#AABBCC')
  expect(tab.savedDocumentTextColor).toBe('#AABBCC')
  expect(tab.documentBackgroundColorDraft).toBe('#112233')
  expect(tab.savedDocumentBackgroundColor).toBe('#112233')
})

test('Test that resolveFaOpenedDocumentsActiveDocumentSyncTarget keeps active id on unknown routes', () => {
  const next = resolveFaOpenedDocumentsActiveDocumentSyncTarget({
    currentActiveDocumentId: 'doc-1',
    routeDocumentId: null,
    routePath: '/settings',
    tabs: [baseTab]
  })
  expect(next).toBe('doc-1')
})

test('Test that removeFaOpenedDocumentTabAtIndex navigates home when focus resolves to a missing tab row', () => {
  const ghostTab = undefined as unknown as I_faOpenedDocumentTab
  const tabs = ref([ghostTab, baseTab])
  const activeDocumentId = ref<string | null>('doc-1')
  const lastRemovedIndex = ref(-1)
  const result = removeFaOpenedDocumentTabAtIndex({
    activeDocumentId,
    lastRemovedIndex,
    removedIndex: 1,
    tabs
  })
  expect(result.shouldNavigateHome).toBe(true)
  expect(result.nextActiveDocumentId).toBeNull()
  expect(activeDocumentId.value).toBeNull()
  expect(tabs.value).toHaveLength(1)
})

test('Test that hydrateFaOpenedDocumentsTabsFromSnapshot normalizes legacy tab rows', () => {
  const hydrated = hydrateFaOpenedDocumentsTabsFromSnapshot({
    activeDocumentId: 'doc-1',
    schemaVersion: 2,
    tabs: [{
      ...baseTab,
      editState: undefined as unknown as boolean,
      persistenceState: undefined as unknown as 'persisted',
      savedDocumentBackgroundColor: undefined as unknown as string,
      savedDocumentTextColor: undefined as unknown as string
    }]
  })
  expect(hydrated.activeDocumentId).toBe('doc-1')
  expect(hydrated.tabs[0]?.editState).toBe(false)
  expect(hydrated.tabs[0]?.persistenceState).toBe('persisted')
  expect(hydrated.tabs[0]?.savedDocumentTextColor).toBe('')
  expect(hydrated.tabs[0]?.savedDocumentBackgroundColor).toBe('')
})

test('Test that resolveFaOpenedDocumentsActiveDocumentSyncTarget follows workspace document routes', () => {
  const next = resolveFaOpenedDocumentsActiveDocumentSyncTarget({
    currentActiveDocumentId: 'doc-1',
    routeDocumentId: 'doc-1',
    routePath: '/home/document/doc-1',
    tabs: [baseTab]
  })
  expect(next).toBe('doc-1')
})

test('Test that resolveFaOpenedDocumentsActiveDocumentSyncTarget clears active id on home route', () => {
  const next = resolveFaOpenedDocumentsActiveDocumentSyncTarget({
    currentActiveDocumentId: 'doc-1',
    routeDocumentId: null,
    routePath: '/home',
    tabs: [baseTab]
  })
  expect(next).toBeNull()
})

test('Test that resolveFaOpenedDocumentsActiveDocumentSyncTarget keeps active id when route document is not open', () => {
  const next = resolveFaOpenedDocumentsActiveDocumentSyncTarget({
    currentActiveDocumentId: 'doc-1',
    routeDocumentId: 'doc-missing',
    routePath: '/home/document/doc-missing',
    tabs: [baseTab]
  })
  expect(next).toBe('doc-1')
})

test('Test that removeFaOpenedDocumentTabAtIndex focuses the previous tab when closing the last tab in a pair', () => {
  const secondTab: I_faOpenedDocumentTab = {
    ...baseTab,
    documentId: 'doc-2',
    persistenceState: 'persisted',
    displayNameDraft: 'Villain',
    savedDisplayName: 'Villain',
    tabLabel: 'Villain'
  }
  const tabs = ref([baseTab, secondTab])
  const activeDocumentId = ref<string | null>('doc-2')
  const lastRemovedIndex = ref(-1)
  const result = removeFaOpenedDocumentTabAtIndex({
    activeDocumentId,
    lastRemovedIndex,
    removedIndex: 1,
    tabs
  })
  expect(result.shouldNavigateHome).toBe(false)
  expect(result.nextActiveDocumentId).toBe('doc-1')
  expect(activeDocumentId.value).toBe('doc-1')
})
