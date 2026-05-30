import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const patchActiveProjectDisplayNameMock = vi.fn()
const refreshRecentProjectsMock = vi.fn(async () => undefined)

vi.mock('app/src/stores/S_FaActiveProject', () => ({
  S_FaActiveProject: () => ({
    patchActiveProjectDisplayName: patchActiveProjectDisplayNameMock
  })
}))

vi.mock('app/src/stores/S_FaRecentProjects', () => ({
  S_FaRecentProjects: () => ({
    refreshRecentProjects: refreshRecentProjectsMock
  })
}))

beforeEach(() => {
  setActivePinia(createPinia())
  patchActiveProjectDisplayNameMock.mockReset()
  refreshRecentProjectsMock.mockReset()
})

/**
 * propagateFaProjectSettingsToAppConsumers
 * Patches active project display name and refreshes recent projects MRU.
 */
test('Test that propagateFaProjectSettingsToAppConsumers updates active project and MRU', async () => {
  const { propagateFaProjectSettingsToAppConsumers } = await import(
    '../faProjectSettingsConsumerPropagation_manager'
  )
  propagateFaProjectSettingsToAppConsumers({
    projectName: 'Renamed Via Settings',
    schemaVersion: 1
  })
  expect(patchActiveProjectDisplayNameMock).toHaveBeenCalledWith('Renamed Via Settings')
  expect(refreshRecentProjectsMock).toHaveBeenCalledOnce()
})
