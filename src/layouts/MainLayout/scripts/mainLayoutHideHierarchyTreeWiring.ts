import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { storeToRefs } from 'pinia'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { resolveMainLayoutHideHierarchyTree } from './functions/resolveMainLayoutHideHierarchyTree'

export function useMainLayoutHideHierarchyTree (): {
  hideHierarchyTree: ComputedRef<boolean>
} {
  const userSettingsStore = S_FaUserSettings()
  const { appSettingsDialogPreview, settings } = storeToRefs(userSettingsStore)

  const hideHierarchyTree = computed((): boolean => {
    return resolveMainLayoutHideHierarchyTree(
      settings.value,
      appSettingsDialogPreview.value,
      FA_USER_SETTINGS_DEFAULTS
    )
  })

  return {
    hideHierarchyTree
  }
}
