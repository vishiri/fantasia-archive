import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import type { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

import { resolveProjectHierarchyTreeShowsProjectNameTitle } from '../functions/projectHierarchyTreeProjectNameTitleVisibility'

export function createProjectHierarchyTreeProjectNameTitleWiring (deps: {
  S_FaActiveProject: typeof S_FaActiveProject
  S_FaUserSettings: typeof S_FaUserSettings
  computed: <T>(getter: () => T) => I_computedRef<T>
  storeToRefs: T_piniaStoreToRefs
  worldCount: I_computedRef<number>
}): {
    projectDisplayName: I_computedRef<string>
    showsProjectNameTitle: I_computedRef<boolean>
  } {
  const { activeProject } = deps.storeToRefs(deps.S_FaActiveProject())!
  const { appSettingsDialogPreview, settings } = deps.storeToRefs(deps.S_FaUserSettings())!

  const projectDisplayName = deps.computed(() => {
    return activeProject!.value?.name ?? ''
  })

  const showsProjectNameTitle = deps.computed(() => {
    return resolveProjectHierarchyTreeShowsProjectNameTitle(
      deps.worldCount.value,
      projectDisplayName.value,
      settings!.value,
      appSettingsDialogPreview!.value,
      {
        noProjectName: FA_USER_SETTINGS_DEFAULTS.noProjectName
      }
    )
  })

  return {
    projectDisplayName,
    showsProjectNameTitle
  }
}
