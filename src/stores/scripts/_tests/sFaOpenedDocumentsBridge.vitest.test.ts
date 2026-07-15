/** @vitest-environment jsdom */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { reactive } from 'vue'

import { FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT } from 'app/types/I_faOpenedDocumentsDomain'

import {
  createEmptyFaOpenedDocumentsSnapshot,
  faOpenedDocumentsPersistSnapshotFromBridge,
  faOpenedDocumentsRefreshSnapshotFromBridge
} from '../sFaOpenedDocumentsBridge'

const getOpenedDocumentsSnapshotMock = vi.fn()
const saveOpenedDocumentsSnapshotMock = vi.fn()

beforeEach(() => {
  getOpenedDocumentsSnapshotMock.mockReset()
  saveOpenedDocumentsSnapshotMock.mockReset()
  window.faContentBridgeAPIs = {
    projectManagement: {
      getOpenedDocumentsSnapshot: getOpenedDocumentsSnapshotMock,
      saveOpenedDocumentsSnapshot: saveOpenedDocumentsSnapshotMock
    }
  } as never
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('Test that faOpenedDocumentsRefreshSnapshotFromBridge returns null when bridge missing', async () => {
  window.faContentBridgeAPIs = {} as never
  await expect(faOpenedDocumentsRefreshSnapshotFromBridge()).resolves.toBeNull()
})

test('Test that faOpenedDocumentsRefreshSnapshotFromBridge reads snapshot from bridge', async () => {
  getOpenedDocumentsSnapshotMock.mockResolvedValue(FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT)
  await expect(faOpenedDocumentsRefreshSnapshotFromBridge()).resolves.toEqual(
    FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT
  )
})

test('Test that faOpenedDocumentsPersistSnapshotFromBridge writes snapshot via bridge', async () => {
  saveOpenedDocumentsSnapshotMock.mockResolvedValue(true)
  const snapshot = createEmptyFaOpenedDocumentsSnapshot()
  await expect(faOpenedDocumentsPersistSnapshotFromBridge(snapshot)).resolves.toBe(true)
  expect(saveOpenedDocumentsSnapshotMock).toHaveBeenCalledWith(snapshot)
})

test('Test that faOpenedDocumentsPersistSnapshotFromBridge serializes nested tab arrays for IPC', async () => {
  saveOpenedDocumentsSnapshotMock.mockResolvedValue(true)
  const sourceIds = reactive(['doc-parent', 'doc-root'])
  const snapshot = {
    ...createEmptyFaOpenedDocumentsSnapshot(),
    activeDocumentId: 'temp-1',
    tabs: [{
      documentId: 'temp-1',
      persistenceState: 'temporary' as const,
      worldId: 'world-1',
      templateId: 'tpl-1',
      parentDocumentId: 'doc-parent',
      temporaryParentResolveDocumentIds: sourceIds,
      tabLabel: 'Character',
      templateIcon: 'mdi-account',
      displayNameDraft: 'Aria',
      savedDisplayName: 'Aria',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      hasUnsavedChanges: false,
      editState: true
    }]
  }
  await expect(faOpenedDocumentsPersistSnapshotFromBridge(snapshot)).resolves.toBe(true)
  const passedSnapshot = saveOpenedDocumentsSnapshotMock.mock.calls[0]![0] as {
    tabs: Array<{ temporaryParentResolveDocumentIds?: string[] }>
  }
  expect(passedSnapshot.tabs[0]?.temporaryParentResolveDocumentIds).toEqual([
    'doc-parent',
    'doc-root'
  ])
  expect(passedSnapshot.tabs[0]?.temporaryParentResolveDocumentIds).not.toBe(sourceIds)
})

test('Test that faOpenedDocumentsRefreshSnapshotFromBridge returns null on bridge read failure', async () => {
  getOpenedDocumentsSnapshotMock.mockRejectedValue(new Error('read failed'))
  await expect(faOpenedDocumentsRefreshSnapshotFromBridge()).resolves.toBeNull()
})

test('Test that faOpenedDocumentsPersistSnapshotFromBridge returns false on write failure', async () => {
  saveOpenedDocumentsSnapshotMock.mockRejectedValue(new Error('write failed'))
  await expect(
    faOpenedDocumentsPersistSnapshotFromBridge(createEmptyFaOpenedDocumentsSnapshot())
  ).resolves.toBe(false)
})

test('Test that faOpenedDocumentsPersistSnapshotFromBridge returns false when bridge returns false', async () => {
  saveOpenedDocumentsSnapshotMock.mockResolvedValue(false)
  await expect(
    faOpenedDocumentsPersistSnapshotFromBridge(createEmptyFaOpenedDocumentsSnapshot())
  ).resolves.toBe(false)
})

test('Test that faOpenedDocumentsPersistSnapshotFromBridge returns false when save API is unavailable', async () => {
  window.faContentBridgeAPIs = {
    projectManagement: {}
  } as never
  await expect(
    faOpenedDocumentsPersistSnapshotFromBridge(createEmptyFaOpenedDocumentsSnapshot())
  ).resolves.toBe(false)
})
