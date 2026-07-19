import { beforeEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_CONTENT_IPC } from 'app/src-electron/electron-ipc-bridge'

const { handleMock, runWorkMock } = vi.hoisted(() => ({
  handleMock: vi.fn(),
  runWorkMock: vi.fn(async (_event: unknown, work: (db: unknown) => unknown) => {
    return await work({})
  })
}))

vi.mock('../runFaProjectContentIpcWorkWiring', () => ({
  runFaProjectContentIpcWork: runWorkMock
}))

vi.mock(
  'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectHierarchyTreePersistWiring',
  () => ({
    listFaProjectWorkspaceHierarchyLayout: vi.fn(() => ({ worlds: [] })),
    listFaProjectPlacementDocumentChildren: vi.fn(() => ({ items: [] })),
    moveFaProjectDocumentInHierarchy: vi.fn(() => ({
      id: 'doc-1',
      displayName: 'Doc',
      placementId: 'place-1',
      parentDocumentId: null,
      sortOrder: 0,
      isCategory: false,
      hasChildren: false
    })),
    reindexFaProjectHierarchyDocumentSiblings: vi.fn(() => ({
      movedDocumentId: '550e8400-e29b-41d4-a716-446655440000',
      orderedDocumentIds: [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
      ]
    })),
    searchFaProjectHierarchy: vi.fn(() => ({
      query: 'q',
      hits: []
    }))
  })
)

beforeEach(() => {
  handleMock.mockReset()
  runWorkMock.mockClear()
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = handleMock.mock.calls.find((c) => c[0]! === channel)
  expect(call).toBeDefined()
  return call?.[1]! as (...args: unknown[]) => unknown
}

/**
 * wireFaProjectContentHierarchyTreeIpcHandlers
 * Registers all hierarchy tree content IPC channels on ipcMain.
 */
test('Test that wireFaProjectContentHierarchyTreeIpcHandlers registers hierarchy channels', async () => {
  const { wireFaProjectContentHierarchyTreeIpcHandlers } = await import(
    '../registerFaProjectContentHierarchyTreeIpcHandlersWiring'
  )
  wireFaProjectContentHierarchyTreeIpcHandlers({ handle: handleMock } as never)
  expect(handlerFor(FA_PROJECT_CONTENT_IPC.listWorkspaceHierarchyLayoutAsync)).toBeTypeOf('function')
  expect(handlerFor(FA_PROJECT_CONTENT_IPC.searchProjectHierarchyAsync)).toBeTypeOf('function')
})

/**
 * wireFaProjectContentHierarchyTreeIpcHandlers
 * Each handler delegates through runFaProjectContentIpcWork.
 */
test('Test that hierarchy IPC handlers delegate through runFaProjectContentIpcWork', async () => {
  const { wireFaProjectContentHierarchyTreeIpcHandlers } = await import(
    '../registerFaProjectContentHierarchyTreeIpcHandlersWiring'
  )
  wireFaProjectContentHierarchyTreeIpcHandlers({ handle: handleMock } as never)
  const event = {}
  await handlerFor(FA_PROJECT_CONTENT_IPC.listWorkspaceHierarchyLayoutAsync)(event)
  await handlerFor(FA_PROJECT_CONTENT_IPC.listPlacementDocumentChildrenAsync)(event, {
    placementId: '550e8400-e29b-41d4-a716-446655440000'
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.moveDocumentInHierarchyAsync)(event, {
    documentId: '550e8400-e29b-41d4-a716-446655440000',
    targetParentDocumentId: null,
    targetSortOrder: 0
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.reindexDocumentSiblingsInHierarchyAsync)(event, {
    movedDocumentId: '550e8400-e29b-41d4-a716-446655440000',
    orderedDocumentIds: [
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    ],
    parentDocumentId: null,
    placementId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.searchProjectHierarchyAsync)(event, { query: 'hero' })
  expect(runWorkMock).toHaveBeenCalledTimes(5)
})
