/** @vitest-environment jsdom */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

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
