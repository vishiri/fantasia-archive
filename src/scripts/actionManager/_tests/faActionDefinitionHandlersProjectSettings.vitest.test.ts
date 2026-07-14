/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

const { updateProjectSettingsMock, persistWorldsSnapshotMock, persistDocumentTemplatesSnapshotMock, notifyCreateMock, refreshWorkspaceWorldsMock, refreshHierarchyLayoutMock } = vi.hoisted(() => ({
  notifyCreateMock: vi.fn(),
  persistDocumentTemplatesSnapshotMock: vi.fn(async () => undefined),
  persistWorldsSnapshotMock: vi.fn(async () => undefined),
  refreshHierarchyLayoutMock: vi.fn(async () => undefined),
  refreshWorkspaceWorldsMock: vi.fn(async () => undefined),
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
        refreshLayout: refreshHierarchyLayoutMock
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
  refreshHierarchyLayoutMock.mockReset()
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
  expect(updateProjectSettingsMock).toHaveBeenCalledWith(patch)
  expect(persistWorldsSnapshotMock).not.toHaveBeenCalled()
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
  expect(updateProjectSettingsMock).toHaveBeenCalledWith({ projectName: 'Renamed' })
  expect(persistWorldsSnapshotMock).toHaveBeenCalledWith(worlds)
  expect(refreshWorkspaceWorldsMock).toHaveBeenCalledTimes(1)
  expect(refreshHierarchyLayoutMock).toHaveBeenCalledTimes(1)
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
  expect(updateProjectSettingsMock).toHaveBeenCalledWith({ projectName: 'Renamed' })
  expect(persistDocumentTemplatesSnapshotMock).toHaveBeenCalledWith(documentTemplates)
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
