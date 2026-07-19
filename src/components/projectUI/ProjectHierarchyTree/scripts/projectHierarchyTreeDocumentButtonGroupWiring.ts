import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

import { resolveProjectHierarchyTreeDocumentButtonVisibility } from '../functions/projectHierarchyTreeDocumentButtonVisibility'
import { buildProjectHierarchyTreeDocumentButtonActionHandlers } from './projectHierarchyTreeDocumentButtonActionWiring'

export function createProjectHierarchyTreeDocumentButtonGroupWiring (deps: {
  S_FaUserSettings: typeof S_FaUserSettings
  computed: <T>(getter: () => T) => I_computedRef<T>
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  storeToRefs: T_piniaStoreToRefs
}): {
    documentButtonVisibility: I_computedRef<{
      showsAddUnder: boolean
      showsEdit: boolean
      showsOpen: boolean
    }>
    onDocumentRowAddUnderButtonClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
    onDocumentRowEditButtonClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
    onDocumentRowOpenButtonClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
  } {
  const { appSettingsDialogPreview, settings } = deps.storeToRefs(deps.S_FaUserSettings())!

  const documentButtonVisibility = deps.computed(() => {
    return resolveProjectHierarchyTreeDocumentButtonVisibility(
      settings!.value,
      appSettingsDialogPreview!.value,
      {
        hideTreeIconAddUnder: FA_USER_SETTINGS_DEFAULTS.hideTreeIconAddUnder,
        hideTreeIconEdit: FA_USER_SETTINGS_DEFAULTS.hideTreeIconEdit,
        hideTreeIconView: FA_USER_SETTINGS_DEFAULTS.hideTreeIconView
      }
    )
  })

  const actionHandlers = buildProjectHierarchyTreeDocumentButtonActionHandlers({
    runFaAction: deps.runFaAction
  })

  const onDocumentRowOpenButtonClick = actionHandlers.onDocumentRowOpenButtonClick
  const onDocumentRowEditButtonClick = actionHandlers.onDocumentRowEditButtonClick
  const onDocumentRowAddUnderButtonClick = actionHandlers.onDocumentRowAddUnderButtonClick

  return {
    documentButtonVisibility,
    onDocumentRowAddUnderButtonClick,
    onDocumentRowEditButtonClick,
    onDocumentRowOpenButtonClick
  }
}
