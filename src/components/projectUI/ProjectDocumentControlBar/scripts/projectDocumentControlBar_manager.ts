import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { resolveFaDocumentWorkspaceRouteDocumentId } from 'app/src/scripts/appRouting/appRouting_manager'

import { createUseProjectDocumentControlBar } from '../functions/createUseProjectDocumentControlBar'
import {
  resolveProjectDocumentControlBarSaveButtonColor,
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
import { assembleProjectDocumentControlBarApi } from './projectDocumentControlBarSessionWiring'

export {
  FA_PROJECT_DOCUMENT_CONTROL_BAR_HEADER_MOUNT_SELECTOR
}

export const useProjectDocumentControlBar = createUseProjectDocumentControlBar({
  assembleProjectDocumentControlBarApi,
  computed,
  resolveActiveDocumentTabName,
  resolveDocumentTabLabelFromOpenedTab,
  resolveFaDocumentWorkspaceRouteDocumentId,
  resolveShowDocumentControlBarStrip,
  resolveShowDocumentTabs,
  resolveShowProjectDocumentControlBarEditButton,
  resolveShowProjectDocumentControlBarSaveButtons,
  resolveProjectDocumentControlBarSaveButtonColor,
  S_FaOpenedDocuments,
  S_FaUserSettings,
  storeToRefs,
  useRoute
})
