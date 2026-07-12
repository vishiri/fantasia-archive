import { computed } from 'vue'
import { copyToClipboard } from 'quasar'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import { resolveFaDocumentWorkspaceRouteDocumentId } from 'app/src/scripts/appRouting/appRouting_manager'
import { formatFaKeybindCommandLabelFromSnapshot } from 'app/src/scripts/keybinds/keybinds_manager'

import { createUseProjectDocumentControlBar } from '../functions/createUseProjectDocumentControlBar'
import {
  resolveProjectDocumentControlBarSaveButtonColor,
  resolveShowProjectDocumentControlBarDeleteButton,
  resolveShowProjectDocumentControlBarEditButton,
  resolveShowProjectDocumentControlBarSaveButtons
} from '../functions/projectDocumentControlBarEditMode'
import {
  FA_PROJECT_DOCUMENT_CONTROL_BAR_HEADER_MOUNT_SELECTOR,
  resolveActiveDocumentTabName,
  resolveDocumentTabLabelFromOpenedTab,
  resolveShowDocumentControlBarStrip,
  resolveShowDocumentTabs
} from '../functions/projectDocumentControlBarVisibility'
import { buildProjectDocumentControlBarAssembleInput } from './projectDocumentControlBarAssembleInput'
import {
  getProjectDocumentControlBarKeybindsSnapshot,
  notifyCreateForProjectDocumentControlBar
} from './projectDocumentControlBarManagerDepsWiring'
import { assembleProjectDocumentControlBarApi } from './projectDocumentControlBarSessionWiring'

export {
  FA_PROJECT_DOCUMENT_CONTROL_BAR_HEADER_MOUNT_SELECTOR
}

export const useProjectDocumentControlBar = createUseProjectDocumentControlBar({
  assembleProjectDocumentControlBarApi,
  buildProjectDocumentControlBarAssembleInput,
  computed,
  copyToClipboard,
  notifyCreate: notifyCreateForProjectDocumentControlBar,
  resolveActiveDocumentTabName,
  resolveDocumentTabLabelFromOpenedTab,
  resolveFaDocumentWorkspaceRouteDocumentId,
  resolveShowDocumentControlBarStrip,
  resolveShowDocumentTabs,
  resolveShowProjectDocumentControlBarEditButton,
  resolveShowProjectDocumentControlBarDeleteButton,
  resolveShowProjectDocumentControlBarSaveButtons,
  resolveProjectDocumentControlBarSaveButtonColor,
  formatFaKeybindCommandLabelFromSnapshot,
  getKeybindsSnapshot: getProjectDocumentControlBarKeybindsSnapshot,
  runFaAction,
  S_FaOpenedDocuments,
  S_FaProjectHierarchyTree,
  S_FaUserSettings,
  storeToRefs,
  useI18n,
  useRoute
})
