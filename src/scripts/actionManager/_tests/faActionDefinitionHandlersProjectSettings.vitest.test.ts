/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

const updateProjectSettingsMock = vi.fn(async () => undefined)

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: {
      global: {
        t: (key: string) => key
      }
    }
  }
})

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
  S_FaActiveProject().clearActiveProject()
})

/**
 * handleSaveProjectSettings
 * Rejects when no active project session is loaded.
 */
test('Test that handleSaveProjectSettings throws when no project is active', async () => {
  const { handleSaveProjectSettings } = await import('../faActionDefinitionHandlers')
  await expect(
    handleSaveProjectSettings({ settings: { projectName: 'X' } })
  ).rejects.toThrow('globalFunctionality.faProjectSettings.saveError')
})

/**
 * handleSaveProjectSettings
 * Delegates persistence to S_FaProjectSettings when a project is loaded.
 */
test('Test that handleSaveProjectSettings delegates to S_FaProjectSettings', async () => {
  const { handleSaveProjectSettings } = await import('../faActionDefinitionHandlers')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const patch = { projectName: 'Renamed' }
  await handleSaveProjectSettings({ settings: patch })
  expect(updateProjectSettingsMock).toHaveBeenCalledWith(patch)
})
