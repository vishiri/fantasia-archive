import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import { i18n } from 'app/i18n/externalFileLoader'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { navigateToWorkspaceHomeRoute } from 'app/src/scripts/appInternals/faAppRouterSession_manager'
import {
  resolveOpenedDocumentDisplayNameFromTab,
  resolveOpenedDocumentTabIsInEditMode,
  resolveOpenedDocumentTabIsInPreviewMode
} from 'app/src/scripts/openedDocuments/functions/openedDocumentEditStateDomain'

import { createUseDocumentWorkspacePage } from './functions/createUseDocumentWorkspacePage'
import { createDocumentWorkspacePageRouteEffects } from './documentWorkspacePageRouteEffects'

export const useDocumentWorkspacePage = createUseDocumentWorkspacePage({
  S_FaOpenedDocuments,
  computed,
  createDocumentWorkspacePageRouteEffects,
  i18n,
  navigateToWorkspaceHomeRoute,
  onMounted,
  resolveOpenedDocumentDisplayNameFromTab,
  resolveOpenedDocumentTabIsInEditMode,
  resolveOpenedDocumentTabIsInPreviewMode,
  storeToRefs,
  useRoute,
  watch
})
