/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

const { updateProjectSettingsMock, persistWorldsSnapshotMock } = vi.hoisted(() => ({
  persistWorldsSnapshotMock: vi.fn(async () => undefined),
  updateProjectSettingsMock: vi.fn(async () => undefined)
}))

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

vi.mock('app/src/stores/S_FaProjectSettings', () => {
  return {
    S_FaProjectSettings: () => {
      return {
        updateProjectSettings: updateProjectSettingsMock
      }
    }
  }
})

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetModules()
  updateProjectSettingsMock.mockReset()
  persistWorldsSnapshotMock.mockReset()
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
      displayName: 'Realm',
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  ]
  await handleSaveProjectSettings({
    settings: { projectName: 'Renamed' },
    worlds
  })
  expect(updateProjectSettingsMock).toHaveBeenCalledWith({ projectName: 'Renamed' })
  expect(persistWorldsSnapshotMock).toHaveBeenCalledWith(worlds)
})
