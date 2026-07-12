import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import { i18n } from 'app/i18n/externalFileLoader'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { navigateToWorkspaceHomeRoute } from 'app/src/scripts/appInternals/faAppRouterSession_manager'
import { parseFaProjectWorldColorPalleteToHexList } from 'app/src/scripts/projectWorlds/functions/faProjectWorldColorPalleteHexList'
import {
  resolveOpenedDocumentDisplayNameFromTab,
  resolveOpenedDocumentTabIsInEditMode,
  resolveOpenedDocumentTabIsInPreviewMode
} from 'app/src/scripts/openedDocuments/functions/openedDocumentEditStateDomain'

import { createUseDocumentWorkspacePage } from './functions/createUseDocumentWorkspacePage'
import { createDocumentWorkspacePageColorPickers } from './functions/createDocumentWorkspacePageColorPickers'
import { createDocumentWorkspacePageRouteEffects } from './documentWorkspacePageRouteEffects'

export const useDocumentWorkspacePage = createUseDocumentWorkspacePage({
  S_FaOpenedDocuments,
  S_FaProjectHierarchyTree,
  computed,
  createDocumentWorkspacePageColorPickers,
  createDocumentWorkspacePageRouteEffects,
  i18n,
  navigateToWorkspaceHomeRoute,
  onMounted,
  parseFaProjectWorldColorPalleteToHexList,
  resolveOpenedDocumentDisplayNameFromTab,
  resolveOpenedDocumentTabIsInEditMode,
  resolveOpenedDocumentTabIsInPreviewMode,
  storeToRefs,
  useRoute,
  watch
})
