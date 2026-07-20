import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
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

  if (
    seed.hidePlushes !== undefined ||
    seed.hideTooltipsProject !== undefined ||
    seed.disableAppControlBar !== undefined ||
    seed.disableAppControlBarGuides !== undefined
  ) {
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

    if (seed.disableAppControlBar !== undefined) {
      nextSettings.disableAppControlBar = seed.disableAppControlBar
    }

    if (seed.disableAppControlBarGuides !== undefined) {
      nextSettings.disableAppControlBarGuides = seed.disableAppControlBarGuides
    }

    settingsStore.$patch({
      settings: nextSettings
    })
  }

  if (seed.openedDocuments !== undefined) {
    const openedDocumentsStore = S_FaOpenedDocuments(pinia)
    openedDocumentsStore.replaceSessionForComponentTesting({
      activeDocumentId: seed.openedDocuments.activeDocumentId,
      tabs: seed.openedDocuments.tabs
    })
  }
}
