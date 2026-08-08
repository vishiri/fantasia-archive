import type { Ref, watch as watchFn } from 'vue'

import type { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import type {
  I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions,
  I_faProjectHierarchyTreeUiState
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

/**
 * Force-resync tag chrome, then restore prior expand snapshot.
 * skipAncestorPrune keeps tag ids latent while noTags hides rows (else prune wipes them).
 */
export function createProjectHierarchyTreeTagSettingsForceResyncWithExpandRestore (input: {
  forceResyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
  uiState: Ref<I_faProjectHierarchyTreeUiState>
}): () => void {
  return () => {
    const expandedNodeIds = [...input.uiState.value.expandedNodeIds]
    input.forceResyncTreeDataFromLayout()
    void input.restoreExpandedSnapshot(expandedNodeIds, {
      skipAncestorPrune: true
    })
  }
}

/**
 * Rebuilds hierarchy tag chrome when tagsAtTop / noTags / compactTags change.
 */
export function bindProjectHierarchyTreeTagSettingsResyncWatch (deps: {
  S_FaUserSettings: typeof S_FaUserSettings
  forceResyncTreeDataFromLayout: () => void
  watch: typeof watchFn
}): void {
  deps.watch(
    () => {
      const userSettingsStore = deps.S_FaUserSettings()
      const settings = userSettingsStore.settings
      const preview = userSettingsStore.appSettingsDialogPreview
      return [
        preview?.compactTags ?? settings?.compactTags ?? FA_USER_SETTINGS_DEFAULTS.compactTags,
        preview?.noTags ?? settings?.noTags ?? FA_USER_SETTINGS_DEFAULTS.noTags,
        preview?.tagsAtTop ?? settings?.tagsAtTop ?? FA_USER_SETTINGS_DEFAULTS.tagsAtTop
      ].join('|')
    },
    () => {
      deps.forceResyncTreeDataFromLayout()
    }
  )
}
