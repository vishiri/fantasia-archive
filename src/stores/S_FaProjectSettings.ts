import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'

import type {
  I_faProjectSettingsPatch,
  I_faProjectSettingsRoot
} from 'app/types/I_faProjectSettingsDomain'

import {
  faProjectSettingsPersistPatchFromStore,
  faProjectSettingsRefreshFromBridge
} from './scripts/sFaProjectSettingsBridge'

/**
 * Canonical project settings mirrored from the active '.faproject' SQLite KV table.
 */
export const S_FaProjectSettings = defineStore('S_FaProjectSettings', () => {
  const root: Ref<I_faProjectSettingsRoot | null> = ref(null)

  function applyRoot (next: I_faProjectSettingsRoot): void {
    root.value = next
  }

  /**
   * @returns false when preload bridge misses 'getProjectSettings'.
   */
  async function refreshProjectSettings (): Promise<boolean> {
    return faProjectSettingsRefreshFromBridge({ applyRoot })
  }

  async function updateProjectSettings (patch: I_faProjectSettingsPatch): Promise<void> {
    await faProjectSettingsPersistPatchFromStore({
      applyRoot,
      patch
    })
  }

  const applyRootBinding = applyRoot
  const refreshProjectSettingsBinding = refreshProjectSettings
  const updateProjectSettingsBinding = updateProjectSettings

  return {
    applyRoot: applyRootBinding,
    refreshProjectSettings: refreshProjectSettingsBinding,
    root,
    updateProjectSettings: updateProjectSettingsBinding
  }
})
