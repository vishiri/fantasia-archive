import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import { resolveFaDocumentWorkspaceRouteDocumentId } from 'app/src/scripts/appRouting/appRouting_manager'
import { formatFaKeybindCommandLabelFromSnapshot } from 'app/src/scripts/keybinds/keybinds_manager'

import { createUseProjectAppControlBar } from '../functions/createUseProjectAppControlBar'
import {
  resolveProjectAppControlBarSaveButtonColor,
  resolveShowProjectAppControlBarDeleteButton,
  resolveShowProjectAppControlBarEditButton,
  resolveShowProjectAppControlBarSaveButtons
} from '../functions/projectAppControlBarEditMode'
import {
  FA_PROJECT_APP_CONTROL_BAR_HEADER_MOUNT_SELECTOR,
  resolveActiveDocumentTabName,
  resolveDocumentTabLabelFromOpenedTab,
  resolveShowAppControlBarStrip,
  resolveShowDocumentTabs
} from '../functions/projectAppControlBarVisibility'
import { buildProjectAppControlBarAssembleInput } from './projectAppControlBarAssembleInput'
import {
  getProjectAppControlBarKeybindsSnapshot
} from './projectAppControlBarManagerDepsWiring'
import { assembleProjectAppControlBarApi } from './projectAppControlBarSessionWiring'
import { createProjectAppControlBarI18nTooltips } from './projectAppControlBarI18nTooltipsWiring'
import { resolveProjectAppControlBarHideHierarchyTree } from './projectAppControlBarHideHierarchyTreeWiring'

export {
  FA_PROJECT_APP_CONTROL_BAR_HEADER_MOUNT_SELECTOR
}

export const useProjectAppControlBarI18nTooltips = createProjectAppControlBarI18nTooltips({
  computed,
  useI18n
})

export const useProjectAppControlBar = createUseProjectAppControlBar({
  assembleProjectAppControlBarApi,
  buildProjectAppControlBarAssembleInput,
  computed,
  resolveHideHierarchyTree: resolveProjectAppControlBarHideHierarchyTree,
  resolveActiveDocumentTabName,
  resolveDocumentTabLabelFromOpenedTab,
  resolveFaDocumentWorkspaceRouteDocumentId,
  resolveShowAppControlBarStrip,
  resolveShowDocumentTabs,
  resolveShowProjectAppControlBarEditButton,
  resolveShowProjectAppControlBarDeleteButton,
  resolveShowProjectAppControlBarSaveButtons,
  resolveProjectAppControlBarSaveButtonColor,
  formatFaKeybindCommandLabelFromSnapshot,
  getKeybindsSnapshot: getProjectAppControlBarKeybindsSnapshot,
  runFaAction,
  S_FaOpenedDocuments,
  S_FaProjectHierarchyTree,
  S_FaUserSettings,
  storeToRefs,
  useRoute
})
