/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

const { updateProjectSettingsMock, persistWorldsSnapshotMock, persistDocumentTemplatesSnapshotMock, notifyCreateMock, refreshWorkspaceWorldsMock, bumpDocumentCensusRefreshGenerationMock, reloadDocumentIndexFromBridgeMock } = vi.hoisted(() => ({
  bumpDocumentCensusRefreshGenerationMock: vi.fn(),
  notifyCreateMock: vi.fn(),
  persistDocumentTemplatesSnapshotMock: vi.fn(async () => undefined),
  persistWorldsSnapshotMock: vi.fn(async () => undefined),
  refreshWorkspaceWorldsMock: vi.fn(async () => undefined),
  reloadDocumentIndexFromBridgeMock: vi.fn(async () => undefined),
  updateProjectSettingsMock: vi.fn(async () => undefined)
}))

vi.mock('quasar', () => {
  return {
    Notify: { create: notifyCreateMock },
    copyToClipboard: vi.fn(async () => undefined)
  }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: {
      global: {
        t: (key: string) => key
      }
    }
  }
})

vi.mock('app/src/stores/scripts/sFaProjectWorldsBridge', () => ({
  faProjectWorldsPersistSnapshotFromDialog: persistWorldsSnapshotMock
}))

vi.mock('app/src/stores/scripts/sFaProjectDocumentTemplatesBridge', () => ({
  faProjectDocumentTemplatesPersistSnapshotFromDialog: persistDocumentTemplatesSnapshotMock
}))

vi.mock('app/src/stores/S_FaProjectSettings', () => {
  return {
    S_FaProjectSettings: () => {
      return {
        updateProjectSettings: updateProjectSettingsMock
      }
    }
  }
})

vi.mock('app/src/stores/S_FaProjectWorkspaceWorlds', () => {
  return {
    S_FaProjectWorkspaceWorlds: () => {
      return {
        refreshWorkspaceWorlds: refreshWorkspaceWorldsMock
      }
    }
  }
})

vi.mock('app/src/stores/S_FaProjectHierarchyTree', () => {
  return {
    S_FaProjectHierarchyTree: () => {
      return {
        bumpDocumentCensusRefreshGeneration: bumpDocumentCensusRefreshGenerationMock,
        reloadDocumentIndexFromBridge: reloadDocumentIndexFromBridgeMock
      }
    }
  }
})

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetModules()
  notifyCreateMock.mockReset()
  updateProjectSettingsMock.mockReset()
  persistWorldsSnapshotMock.mockReset()
  persistDocumentTemplatesSnapshotMock.mockReset()
  refreshWorkspaceWorldsMock.mockReset()
  bumpDocumentCensusRefreshGenerationMock.mockReset()
  reloadDocumentIndexFromBridgeMock.mockReset()
  S_FaActiveProject().clearActiveProject()
})

/**
 * handleSaveProjectSettings
 * Rejects when no active project session is loaded.
 */
test('Test that handleSaveProjectSettings throws when no project is active', async () => {
  const { handleSaveProjectSettings } = await import('../faActionDefinitionHandlers_manager')
  await expect(
    handleSaveProjectSettings({ settings: { projectName: 'X' } })
  ).rejects.toThrow('globalFunctionality.faProjectSettings.saveError')
})

/**
 * handleSaveProjectSettings
 * Delegates persistence to S_FaProjectSettings when a project is loaded.
 */
test('Test that handleSaveProjectSettings delegates to S_FaProjectSettings', async () => {
  const { handleSaveProjectSettings } = await import('../faActionDefinitionHandlers_manager')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const patch = { projectName: 'Renamed' }
  await handleSaveProjectSettings({ settings: patch })
  expect(updateProjectSettingsMock).toHaveBeenCalledWith(patch, expect.any(Number))
  expect(persistWorldsSnapshotMock).not.toHaveBeenCalled()
  expect(bumpDocumentCensusRefreshGenerationMock).not.toHaveBeenCalled()
})

/**
 * handleSaveProjectSettings
 * Persists an optional worlds snapshot after project settings when provided.
 */
test('Test that handleSaveProjectSettings persists worlds snapshot when provided', async () => {
  const { handleSaveProjectSettings } = await import('../faActionDefinitionHandlers_manager')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const worlds = [
    {
      displayNameTranslations: { 'en-US': 'Realm' },
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  ]
  await handleSaveProjectSettings({
    settings: { projectName: 'Renamed' },
    worlds
  })
  expect(updateProjectSettingsMock).toHaveBeenCalledWith({ projectName: 'Renamed' }, expect.any(Number))
  expect(persistWorldsSnapshotMock).toHaveBeenCalledWith(worlds)
  expect(refreshWorkspaceWorldsMock).toHaveBeenCalledTimes(1)
  expect(reloadDocumentIndexFromBridgeMock).toHaveBeenCalledTimes(1)
  expect(bumpDocumentCensusRefreshGenerationMock).toHaveBeenCalledTimes(1)
})

/**
 * handleSaveProjectSettings
 * Persists an optional document-templates snapshot after project settings when provided.
 */
test('Test that handleSaveProjectSettings persists document templates snapshot when provided', async () => {
  const { handleSaveProjectSettings } = await import('../faActionDefinitionHandlers_manager')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const documentTemplates = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      titlePluralTranslations: { 'en-US': 'Character' },
      titleSingularTranslations: {},
    }
  ]
  await handleSaveProjectSettings({
    documentTemplates,
    settings: { projectName: 'Renamed' }
  })
  expect(updateProjectSettingsMock).toHaveBeenCalledWith({ projectName: 'Renamed' }, expect.any(Number))
  expect(persistDocumentTemplatesSnapshotMock).toHaveBeenCalledWith(documentTemplates)
  expect(reloadDocumentIndexFromBridgeMock).not.toHaveBeenCalled()
  expect(bumpDocumentCensusRefreshGenerationMock).toHaveBeenCalledTimes(1)
})

/**
 * handleSaveProjectSettings
 * Persists document templates before worlds when both snapshots are provided.
 */
test('Test that handleSaveProjectSettings persists document templates before worlds snapshot', async () => {
  const { handleSaveProjectSettings } = await import('../faActionDefinitionHandlers_manager')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const documentTemplates = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      titlePluralTranslations: { 'en-US': 'Character' },
      titleSingularTranslations: {},
    }
  ]
  const worlds = [
    {
      displayNameTranslations: { 'en-US': 'Realm' },
      id: '550e8400-e29b-41d4-a716-446655440001'
    }
  ]
  await handleSaveProjectSettings({
    documentTemplates,
    settings: { projectName: 'Renamed' },
    worlds
  })
  expect(persistDocumentTemplatesSnapshotMock.mock.invocationCallOrder[0]!).toBeLessThan(
    persistWorldsSnapshotMock.mock.invocationCallOrder[0]! ?? Number.POSITIVE_INFINITY
  )
  expect(reloadDocumentIndexFromBridgeMock).toHaveBeenCalledTimes(1)
  expect(bumpDocumentCensusRefreshGenerationMock).toHaveBeenCalledTimes(1)
})

/**
 * handleSaveProjectSettings
 * Emits a success notify after all persistence steps complete.
 */
test('Test that handleSaveProjectSettings emits success notify after persistence', async () => {
  const { handleSaveProjectSettings } = await import('../faActionDefinitionHandlers_manager')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  await handleSaveProjectSettings({
    documentTemplates: [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {},
      }
    ],
    settings: { projectName: 'Renamed' },
    worlds: [
      {
        displayNameTranslations: { 'en-US': 'Realm' },
        id: '550e8400-e29b-41d4-a716-446655440001'
      }
    ]
  })
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    message: 'globalFunctionality.faProjectSettings.saveSuccess',
    type: 'positive'
  })
})

function activeProjectFixture (id: string): {
  filePath: string
  id: string
  name: string
} {
  const filePath = `C:\\${id}.faproject`
  const name = id
  return {
    filePath,
    id,
    name
  }
}

/**
 * handleSaveProjectSettings
 * A project switch during the settings write must not persist templates or worlds.
 */
test('Test that handleSaveProjectSettings skips snapshots after the project changes', async () => {
  let releaseUpdate = (): void => undefined
  updateProjectSettingsMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      releaseUpdate = () => {
        resolve(undefined)
      }
    })
  })
  const { handleSaveProjectSettings } = await import('../faActionDefinitionHandlers_manager')
  const { FaActionUserCanceledError } = await import('../functions/faActionUserCanceledError')
  S_FaActiveProject().setActiveProject(activeProjectFixture('project-a'))
  const pending = handleSaveProjectSettings({
    documentTemplates: [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {}
      }
    ],
    settings: { projectName: 'Renamed' },
    worlds: [
      {
        displayNameTranslations: { 'en-US': 'Realm' },
        id: '550e8400-e29b-41d4-a716-446655440001'
      }
    ]
  })
  S_FaActiveProject().setActiveProject(activeProjectFixture('project-b'))
  releaseUpdate()
  await expect(pending).rejects.toBeInstanceOf(FaActionUserCanceledError)
  expect(persistDocumentTemplatesSnapshotMock).not.toHaveBeenCalled()
  expect(persistWorldsSnapshotMock).not.toHaveBeenCalled()
  expect(refreshWorkspaceWorldsMock).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * handleSaveProjectSettings
 * An open already in flight has not moved the epoch yet. Snapshot writes must still stop.
 */
test('Test that handleSaveProjectSettings skips snapshots while a project open is in flight', async () => {
  let releaseUpdate = (): void => undefined
  updateProjectSettingsMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      releaseUpdate = () => {
        resolve(undefined)
      }
    })
  })
  const { handleSaveProjectSettings } = await import('../faActionDefinitionHandlers_manager')
  const { FaActionUserCanceledError } = await import('../functions/faActionUserCanceledError')
  const { S_FaActiveProject: activeProjectStore } = await import('app/src/stores/S_FaActiveProject')
  activeProjectStore().setActiveProject(activeProjectFixture('project-a'))
  const pending = handleSaveProjectSettings({
    documentTemplates: [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {}
      }
    ],
    settings: { projectName: 'Renamed' },
    worlds: [
      {
        displayNameTranslations: { 'en-US': 'Realm' },
        id: '550e8400-e29b-41d4-a716-446655440001'
      }
    ]
  })
  vi.spyOn(activeProjectStore(), 'isProjectReplacementInFlight').mockReturnValue(true)
  releaseUpdate()
  await expect(pending).rejects.toBeInstanceOf(FaActionUserCanceledError)
  expect(persistDocumentTemplatesSnapshotMock).not.toHaveBeenCalled()
  expect(persistWorldsSnapshotMock).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * handleSaveProjectSettings
 * A project switch during the template snapshot must not persist worlds.
 */
test('Test that handleSaveProjectSettings skips worlds after templates when the project changes', async () => {
  let releaseTemplates = (): void => undefined
  persistDocumentTemplatesSnapshotMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      releaseTemplates = () => {
        resolve(undefined)
      }
    })
  })
  const { handleSaveProjectSettings } = await import('../faActionDefinitionHandlers_manager')
  const { FaActionUserCanceledError } = await import('../functions/faActionUserCanceledError')
  S_FaActiveProject().setActiveProject(activeProjectFixture('project-a'))
  const pending = handleSaveProjectSettings({
    documentTemplates: [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {}
      }
    ],
    settings: { projectName: 'Renamed' },
    worlds: [
      {
        displayNameTranslations: { 'en-US': 'Realm' },
        id: '550e8400-e29b-41d4-a716-446655440001'
      }
    ]
  })
  await vi.waitUntil(() => persistDocumentTemplatesSnapshotMock.mock.calls.length === 1)
  S_FaActiveProject().setActiveProject(activeProjectFixture('project-b'))
  releaseTemplates()
  await expect(pending).rejects.toBeInstanceOf(FaActionUserCanceledError)
  expect(persistWorldsSnapshotMock).not.toHaveBeenCalled()
  expect(refreshWorkspaceWorldsMock).not.toHaveBeenCalled()
  expect(reloadDocumentIndexFromBridgeMock).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})
