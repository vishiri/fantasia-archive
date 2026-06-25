import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'
import type { Pinia } from 'app/types/I_vuePiniaInjected'

export function patchFaComponentTestingStores (
  pinia: Pinia,
  seed: I_faComponentTestingStoreSeed
): void {
  if (seed.activeProject !== undefined) {
    const activeProjectStore = S_FaActiveProject(pinia)
    if (seed.activeProject === null) {
      activeProjectStore.clearActiveProject()
    } else {
      activeProjectStore.setActiveProject(seed.activeProject)
    }
  }

  if (seed.hidePlushes !== undefined || seed.hideTooltipsProject !== undefined) {
    const settingsStore = S_FaUserSettings(pinia)
    const nextSettings = {
      ...settingsStore.settings
    }

    if (seed.hidePlushes !== undefined) {
      nextSettings.hidePlushes = seed.hidePlushes
    }

    if (seed.hideTooltipsProject !== undefined) {
      nextSettings.hideTooltipsProject = seed.hideTooltipsProject
    }

    settingsStore.$patch({
      settings: nextSettings
    })
  }
}
