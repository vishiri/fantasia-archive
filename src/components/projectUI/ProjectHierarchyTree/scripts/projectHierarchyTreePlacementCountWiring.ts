import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

import { resolveProjectHierarchyTreePlacementCountSegments } from '../functions/projectHierarchyTreePlacementCountSegments'
import { resolveProjectHierarchyTreePlacementCountVisibility } from '../functions/projectHierarchyTreePlacementCountVisibility'

export function createProjectHierarchyTreePlacementCountWiring (deps: {
  S_FaUserSettings: typeof S_FaUserSettings
  computed: <T>(getter: () => T) => I_computedRef<T>
  storeToRefs: T_piniaStoreToRefs
}): {
    placementCountVisibility: I_computedRef<ReturnType<typeof resolveProjectHierarchyTreePlacementCountVisibility>>
    resolvePlacementCountDisplayForCounts: (
      counts: { categoryCount: number, documentCount: number }
    ) => ReturnType<typeof resolveProjectHierarchyTreePlacementCountSegments>
  } {
  const { appSettingsDialogPreview, settings } = deps.storeToRefs(deps.S_FaUserSettings())!

  const placementCountVisibility = deps.computed(() => {
    return resolveProjectHierarchyTreePlacementCountVisibility(
      settings!.value,
      appSettingsDialogPreview!.value,
      {
        disableCategoryCount: FA_USER_SETTINGS_DEFAULTS.disableCategoryCount,
        disableDocumentCounts: FA_USER_SETTINGS_DEFAULTS.disableDocumentCounts,
        invertCategoryPosition: FA_USER_SETTINGS_DEFAULTS.invertCategoryPosition
      }
    )
  })

  function resolvePlacementCountDisplayForCounts (
    counts: { categoryCount: number, documentCount: number }
  ): ReturnType<typeof resolveProjectHierarchyTreePlacementCountSegments> {
    const visibility = placementCountVisibility.value
    return resolveProjectHierarchyTreePlacementCountSegments({
      categoryCount: counts.categoryCount,
      disableCategoryCount: visibility.disableCategoryCount,
      disableDocumentCounts: visibility.disableDocumentCounts,
      documentCount: counts.documentCount,
      invertCategoryPosition: visibility.invertCategoryPosition
    })
  }

  return {
    placementCountVisibility,
    resolvePlacementCountDisplayForCounts
  }
}
