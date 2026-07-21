import { beforeEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import { FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT } from 'app/types/I_faOpenedDocumentsDomain'

const { handleMock, runWithDbMock } = vi.hoisted(() => ({
  handleMock: vi.fn(),
  runWithDbMock: vi.fn() as ReturnType<typeof vi.fn>
}))

vi.mock('electron', () => ({
  ipcMain: {
    handle: handleMock
  }
}))

vi.mock('app/src-electron/mainScripts/projectManagement/projectManagement_manager', () => ({
  readFaProjectOpenedDocumentsSnapshot: vi.fn(() => ({
    schemaVersion: 1,
    activeDocumentId: 'doc-1',
    tabs: []
  })),
  runWithFaProjectDatabaseForIpcAsync: runWithDbMock,
  upsertFaProjectOpenedDocumentsSnapshot: vi.fn()
}))

beforeEach(() => {
  handleMock.mockReset()
  runWithDbMock.mockReset()
  runWithDbMock.mockImplementation(async (_event: unknown, work: (db: unknown) => unknown) => {
    return {
      ok: true as const,
      value: await work({})
    }
  })
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = handleMock.mock.calls.find((c) => c[0]! === channel)
  expect(call).toBeDefined()
  return call?.[1]! as (...args: unknown[]) => unknown
}

/**
 * registerFaProjectManagementOpenedDocumentsIpc
 * Registers get/save handlers for opened documents snapshots.
 */
test('Test that registerFaProjectManagementOpenedDocumentsIpc registers handlers', async () => {
  const { registerFaProjectManagementOpenedDocumentsIpc } = await import(
    '../registerFaProjectManagementOpenedDocumentsIpc'
  )
  registerFaProjectManagementOpenedDocumentsIpc()
  expect(handlerFor(FA_PROJECT_MANAGEMENT_IPC.getOpenedDocumentsSnapshotAsync)).toBeTypeOf('function')
  expect(handlerFor(FA_PROJECT_MANAGEMENT_IPC.saveOpenedDocumentsSnapshotAsync)).toBeTypeOf('function')
})

/**
 * registerFaProjectManagementOpenedDocumentsIpc
 * getOpenedDocumentsSnapshotAsync returns empty snapshot when DB is unavailable.
 */
test('Test that getOpenedDocumentsSnapshotAsync returns empty snapshot when DB is unavailable', async () => {
  runWithDbMock.mockResolvedValueOnce({
    ok: false as const,
    reason: 'no-db'
  })
  const { registerFaProjectManagementOpenedDocumentsIpc } = await import(
    '../registerFaProjectManagementOpenedDocumentsIpc'
  )
  registerFaProjectManagementOpenedDocumentsIpc()
  const result = await handlerFor(FA_PROJECT_MANAGEMENT_IPC.getOpenedDocumentsSnapshotAsync)({})
  expect(result).toEqual(FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT)
})

/**
 * registerFaProjectManagementOpenedDocumentsIpc
 * getOpenedDocumentsSnapshotAsync returns a cloned snapshot when DB is available.
 */
test('Test that getOpenedDocumentsSnapshotAsync returns cloned tabs when DB is available', async () => {
  const sourceSnapshot = {
    schemaVersion: 2 as const,
    activeDocumentId: 'doc-1',
    tabs: [{
      documentId: 'doc-1',
      persistenceState: 'persisted' as const,
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      hasUnsavedChanges: false,
      editState: false
    }]
  }
  const { readFaProjectOpenedDocumentsSnapshot } = await import(
    'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
  )
  vi.mocked(readFaProjectOpenedDocumentsSnapshot).mockReturnValueOnce(sourceSnapshot)
  const { registerFaProjectManagementOpenedDocumentsIpc } = await import(
    '../registerFaProjectManagementOpenedDocumentsIpc'
  )
  registerFaProjectManagementOpenedDocumentsIpc()
  const result = await handlerFor(FA_PROJECT_MANAGEMENT_IPC.getOpenedDocumentsSnapshotAsync)({}) as {
    activeDocumentId: string | null
    tabs: Array<{ tabLabel: string }>
  }
  expect(result.activeDocumentId).toBe('doc-1')
  expect(result.tabs).toHaveLength(1)
  result.tabs[0]!.tabLabel = 'Mutated'
  expect(sourceSnapshot.tabs[0]?.tabLabel).toBe('Hero')
})

/**
 * registerFaProjectManagementOpenedDocumentsIpc
 * saveOpenedDocumentsSnapshotAsync returns false when DB is unavailable.
 */
test('Test that saveOpenedDocumentsSnapshotAsync returns false when DB is unavailable', async () => {
  runWithDbMock.mockResolvedValueOnce({
    ok: false as const,
    reason: 'no-db'
  })
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const { registerFaProjectManagementOpenedDocumentsIpc } = await import(
    '../registerFaProjectManagementOpenedDocumentsIpc'
  )
  registerFaProjectManagementOpenedDocumentsIpc()
  const result = await handlerFor(FA_PROJECT_MANAGEMENT_IPC.saveOpenedDocumentsSnapshotAsync)(
    {},
    FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT
  )
  expect(result).toBe(false)
  warnSpy.mockRestore()
})

/**
 * registerFaProjectManagementOpenedDocumentsIpc
 * saveOpenedDocumentsSnapshotAsync persists when DB is available.
 */
test('Test that saveOpenedDocumentsSnapshotAsync returns true when DB is available', async () => {
  const { upsertFaProjectOpenedDocumentsSnapshot } = await import(
    'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
  )
  const { registerFaProjectManagementOpenedDocumentsIpc } = await import(
    '../registerFaProjectManagementOpenedDocumentsIpc'
  )
  registerFaProjectManagementOpenedDocumentsIpc()
  const result = await handlerFor(FA_PROJECT_MANAGEMENT_IPC.saveOpenedDocumentsSnapshotAsync)(
    {},
    FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT
  )
  expect(result).toBe(true)
  expect(upsertFaProjectOpenedDocumentsSnapshot).toHaveBeenCalled()
})
