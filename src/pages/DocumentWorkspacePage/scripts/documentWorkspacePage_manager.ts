import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import { i18n } from 'app/i18n/externalFileLoader'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { navigateToWorkspaceHomeRoute } from 'app/src/scripts/appInternals/faAppRouterSession_manager'
import { parseFaProjectWorldColorPaletteToHexList } from 'app/src/scripts/projectWorlds/functions/faProjectWorldColorPaletteHexList'
import {
  resolveOpenedDocumentDisplayNameFromTab,
  resolveOpenedDocumentTabIsInEditMode,
  resolveOpenedDocumentTabIsInPreviewMode
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'

import { createUseDocumentWorkspacePage } from './createUseDocumentWorkspacePageWiring'
import { createDocumentWorkspacePageColorPickers } from './functions/createDocumentWorkspacePageColorPickers'
import { createDocumentWorkspacePageDocumentBooleanToggle } from './functions/createDocumentWorkspacePageDocumentBooleanToggle'
import { createDocumentWorkspacePageIsCategoryToggle } from './functions/createDocumentWorkspacePageIsCategoryToggle'
import { createDocumentWorkspacePageRouteEffects } from './documentWorkspacePageRouteEffectsWiring'

export const useDocumentWorkspacePage = createUseDocumentWorkspacePage({
  S_FaOpenedDocuments,
  S_FaProjectHierarchyTree,
  computed,
  createDocumentWorkspacePageColorPickers,
  createDocumentWorkspacePageDocumentBooleanToggle,
  createDocumentWorkspacePageIsCategoryToggle,
  createDocumentWorkspacePageRouteEffects,
  i18n,
  navigateToWorkspaceHomeRoute,
  onMounted,
  parseFaProjectWorldColorPaletteToHexList,
  ref,
  resolveOpenedDocumentDisplayNameFromTab,
  resolveOpenedDocumentTabIsInEditMode,
  resolveOpenedDocumentTabIsInPreviewMode,
  storeToRefs,
  useRoute,
  watch
})
