import { beforeEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_CONTENT_IPC } from 'app/src-electron/electron-ipc-bridge'

const { handleMock, runWithDbMock } = vi.hoisted(() => ({
  handleMock: vi.fn(),
  runWithDbMock: vi.fn(async (_event: unknown, work: (db: unknown) => unknown) => {
    return {
      ok: true as const,
      value: await work({})
    }
  })
}))

vi.mock('electron', () => ({
  ipcMain: {
    handle: handleMock
  }
}))

vi.mock('app/src-electron/mainScripts/projectManagement/projectManagement_manager', () => ({
  runWithFaProjectDatabaseForIpcAsync: runWithDbMock
}))

vi.mock(
  'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectWorldsPersistWiring',
  () => ({
    createFaProjectWorld: vi.fn(() => ({ id: 'w' })),
    updateFaProjectWorld: vi.fn(() => ({ id: 'w' })),
    deleteFaProjectWorld: vi.fn(),
    getFaProjectWorldById: vi.fn(() => ({ id: 'w' })),
    listFaProjectWorlds: vi.fn(() => ({ items: [] })),
    listFaProjectWorldsForProjectSettings: vi.fn(() => ({ items: [] })),
    replaceFaProjectWorldsSnapshot: vi.fn()
  })
)

vi.mock(
  'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectMediaPersistWiring',
  () => ({
    createFaProjectMedia: vi.fn(() => ({ id: 'm' })),
    updateFaProjectMedia: vi.fn(() => ({ id: 'm' })),
    deleteFaProjectMedia: vi.fn(),
    getFaProjectMediaById: vi.fn(() => ({ id: 'm' })),
    listFaProjectMedia: vi.fn(() => ({ items: [] }))
  })
)

vi.mock(
  'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectDocumentTemplatesPersistWiring',
  () => ({
    createFaProjectDocumentTemplate: vi.fn(() => ({ id: 't' })),
    updateFaProjectDocumentTemplate: vi.fn(() => ({ id: 't' })),
    deleteFaProjectDocumentTemplate: vi.fn(),
    getFaProjectDocumentTemplateById: vi.fn(() => ({ id: 't' })),
    listFaProjectDocumentTemplates: vi.fn(() => ({ items: [] }))
  })
)

vi.mock(
  'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectDocumentsPersistWiring',
  () => ({
    createFaProjectDocument: vi.fn(() => ({ id: 'd' })),
    updateFaProjectDocument: vi.fn(() => ({ id: 'd' })),
    deleteFaProjectDocument: vi.fn(),
    getFaProjectDocumentById: vi.fn(() => ({ id: 'd' })),
    listFaProjectDocuments: vi.fn(() => ({ items: [] })),
    setFaProjectDocumentWorld: vi.fn(() => ({ id: 'd' })),
    setFaProjectDocumentTemplate: vi.fn(() => ({ id: 'd' }))
  })
)

vi.mock(
  'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectDocumentMediaLinksWiring',
  () => ({
    linkFaProjectDocumentMedia: vi.fn(),
    unlinkFaProjectDocumentMedia: vi.fn(),
    listFaProjectMediaForDocument: vi.fn(() => ({ items: [] }))
  })
)

vi.mock(
  'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectWorldDocumentTemplateLinksWiring',
  () => ({
    linkFaProjectWorldDocumentTemplate: vi.fn(),
    unlinkFaProjectWorldDocumentTemplate: vi.fn(),
    listFaProjectDocumentTemplatesForWorld: vi.fn(() => ({ items: [] })),
    listFaProjectWorldsForDocumentTemplate: vi.fn(() => ({ items: [] }))
  })
)

beforeEach(() => {
  vi.resetModules()
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
  const call = handleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call?.[1] as (...args: unknown[]) => unknown
}

/**
 * registerFaProjectContentIpc
 * Registers ipcMain handlers for project content channels.
 */
test('Test that registerFaProjectContentIpc registers all project content channels', async () => {
  const { registerFaProjectContentIpc } = await import('../registerFaProjectContentIpc')
  registerFaProjectContentIpc()
  const channels = handleMock.mock.calls.map((call) => call[0])
  expect(channels).toContain(FA_PROJECT_CONTENT_IPC.createWorldAsync)
  expect(channels).toContain(FA_PROJECT_CONTENT_IPC.listDocumentMediaAsync)
  expect(channels.length).toBeGreaterThan(20)
})

/**
 * registerFaProjectContentIpc
 * createWorldAsync delegates through runWithFaProjectDatabaseForIpcAsync.
 */
test('Test that createWorldAsync handler uses runWithFaProjectDatabaseForIpcAsync', async () => {
  const { registerFaProjectContentIpc } = await import('../registerFaProjectContentIpc')
  registerFaProjectContentIpc()
  const handler = handlerFor(FA_PROJECT_CONTENT_IPC.createWorldAsync)
  await handler({}, { displayName: 'A' })
  expect(runWithDbMock).toHaveBeenCalled()
})

const SAMPLE_UUID = '550e8400-e29b-41d4-a716-446655440000'
const SAMPLE_UUID_B = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/**
 * registerFaProjectContentIpc
 * Each registered handler accepts a valid payload and delegates to runWithFaProjectDatabaseForIpcAsync.
 */
test('Test that every project content IPC handler runs through runWithFaProjectDatabaseForIpcAsync', async () => {
  const { registerFaProjectContentIpc } = await import('../registerFaProjectContentIpc')
  registerFaProjectContentIpc()
  const event = {}

  await handlerFor(FA_PROJECT_CONTENT_IPC.createWorldAsync)(event, { displayName: 'W' })
  await handlerFor(FA_PROJECT_CONTENT_IPC.updateWorldAsync)(event, {
    id: SAMPLE_UUID,
    patch: { displayName: 'W2' }
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.deleteWorldAsync)(event, { id: SAMPLE_UUID })
  await handlerFor(FA_PROJECT_CONTENT_IPC.getWorldByIdAsync)(event, { id: SAMPLE_UUID })
  await handlerFor(FA_PROJECT_CONTENT_IPC.listWorldsAsync)(event)
  const listWorldsForSettingsResult =
    await handlerFor(FA_PROJECT_CONTENT_IPC.listWorldsForProjectSettingsAsync)(event)
  expect(listWorldsForSettingsResult).toEqual({ items: [] })
  expect(listWorldsForSettingsResult).not.toHaveProperty('ok')
  await handlerFor(FA_PROJECT_CONTENT_IPC.saveWorldsSnapshotAsync)(event, {
    items: [
      {
        displayName: 'W',
        id: SAMPLE_UUID
      }
    ]
  })

  await handlerFor(FA_PROJECT_CONTENT_IPC.createMediaAsync)(event, { displayName: 'M' })
  await handlerFor(FA_PROJECT_CONTENT_IPC.updateMediaAsync)(event, {
    id: SAMPLE_UUID,
    patch: { displayName: 'M2' }
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.deleteMediaAsync)(event, { id: SAMPLE_UUID })
  await handlerFor(FA_PROJECT_CONTENT_IPC.getMediaByIdAsync)(event, { id: SAMPLE_UUID })
  await handlerFor(FA_PROJECT_CONTENT_IPC.listMediaAsync)(event)

  await handlerFor(FA_PROJECT_CONTENT_IPC.createDocumentTemplateAsync)(event, { displayName: 'T' })
  await handlerFor(FA_PROJECT_CONTENT_IPC.updateDocumentTemplateAsync)(event, {
    id: SAMPLE_UUID,
    patch: {}
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.deleteDocumentTemplateAsync)(event, { id: SAMPLE_UUID })
  await handlerFor(FA_PROJECT_CONTENT_IPC.getDocumentTemplateByIdAsync)(event, { id: SAMPLE_UUID })
  await handlerFor(FA_PROJECT_CONTENT_IPC.listDocumentTemplatesAsync)(event)

  await handlerFor(FA_PROJECT_CONTENT_IPC.createDocumentAsync)(event, {
    displayName: 'D',
    worldId: SAMPLE_UUID
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.updateDocumentAsync)(event, {
    id: SAMPLE_UUID,
    patch: { displayName: 'D2' }
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.deleteDocumentAsync)(event, { id: SAMPLE_UUID })
  await handlerFor(FA_PROJECT_CONTENT_IPC.getDocumentByIdAsync)(event, { id: SAMPLE_UUID })
  await handlerFor(FA_PROJECT_CONTENT_IPC.listDocumentsAsync)(event, { worldId: SAMPLE_UUID })
  await handlerFor(FA_PROJECT_CONTENT_IPC.setDocumentWorldAsync)(event, {
    documentId: SAMPLE_UUID,
    worldId: SAMPLE_UUID_B
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.setDocumentTemplateAsync)(event, {
    documentId: SAMPLE_UUID,
    templateId: null
  })

  await handlerFor(FA_PROJECT_CONTENT_IPC.linkDocumentMediaAsync)(event, {
    documentId: SAMPLE_UUID,
    mediaId: SAMPLE_UUID_B
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.unlinkDocumentMediaAsync)(event, {
    documentId: SAMPLE_UUID,
    mediaId: SAMPLE_UUID_B
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.listDocumentMediaAsync)(event, { documentId: SAMPLE_UUID })

  await handlerFor(FA_PROJECT_CONTENT_IPC.linkWorldDocumentTemplateAsync)(event, {
    worldId: SAMPLE_UUID,
    documentTemplateId: SAMPLE_UUID_B
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.unlinkWorldDocumentTemplateAsync)(event, {
    worldId: SAMPLE_UUID,
    documentTemplateId: SAMPLE_UUID_B
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.listDocumentTemplatesForWorldAsync)(event, {
    worldId: SAMPLE_UUID
  })
  await handlerFor(FA_PROJECT_CONTENT_IPC.listWorldsForDocumentTemplateAsync)(event, {
    documentTemplateId: SAMPLE_UUID
  })

  expect(runWithDbMock.mock.calls.length).toBeGreaterThanOrEqual(31)
})

/**
 * registerFaProjectContentIpc
 * A second register call is a no-op after the first registration.
 */
test('Test that registerFaProjectContentIpc ignores duplicate registration', async () => {
  const { registerFaProjectContentIpc } = await import('../registerFaProjectContentIpc')
  registerFaProjectContentIpc()
  const callCount = handleMock.mock.calls.length
  registerFaProjectContentIpc()
  expect(handleMock.mock.calls.length).toBe(callCount)
})
