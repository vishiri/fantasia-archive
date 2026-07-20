import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

import { resolveProjectHierarchyTreeShowsOrderNumberBadge } from '../functions/projectHierarchyTreeOrderNumberBadgeVisibility'

export function createProjectHierarchyTreeOrderNumberBadgeWiring (deps: {
  S_FaUserSettings: typeof S_FaUserSettings
  computed: <T>(getter: () => T) => I_computedRef<T>
  storeToRefs: T_piniaStoreToRefs
}): {
    showsOrderNumberBadge: I_computedRef<boolean>
  } {
  const { appSettingsDialogPreview, settings } = deps.storeToRefs(deps.S_FaUserSettings())!

  const showsOrderNumberBadge = deps.computed(() => {
    return resolveProjectHierarchyTreeShowsOrderNumberBadge(
      settings!.value,
      appSettingsDialogPreview!.value,
      {
        hideTreeOrderNumbers: FA_USER_SETTINGS_DEFAULTS.hideTreeOrderNumbers
      }
    )
  })

  return {
    showsOrderNumberBadge
  }
}
