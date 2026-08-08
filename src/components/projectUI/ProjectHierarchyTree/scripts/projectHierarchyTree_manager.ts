import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { dragContext } from '@he-tree/vue'
import { useRoute } from 'vue-router'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { resolveFaDocumentWorkspaceRouteDocumentId } from 'app/src/scripts/appRouting/appRouting_manager'

import { i18n } from 'app/i18n/externalFileLoader'
import { createUseProjectHierarchyTree } from './createUseProjectHierarchyTree'
import { resolveProjectHierarchyTreePlacementDisplayIcon } from './projectHierarchyTreeDisplayChromeWiring'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import './projectHierarchyTreeVirtualListBufferWiring'

export {
  applyProjectHierarchyTreeTreeNodeKindClass,
  clearProjectHierarchyTreeTreeNodeKindClass,
  resolveProjectHierarchyTreeDocumentAppearanceChrome
} from './projectHierarchyTreeDisplayChromeWiring'

export { resolveProjectHierarchyTreeHeTreeNodeKey } from '../functions/projectHierarchyTreeHeTreeNodeKey'
export { resolveProjectHierarchyTreeWorldDisplayColor } from '../functions/resolveProjectHierarchyTreeWorldDisplayColor'
export { resolveProjectHierarchyTreeNodeContextMenuLabels } from './projectHierarchyTreeNodeContextMenuWiring'
export { resolveProjectHierarchyTreePlacementDisplayIcon }
export { buildFaColorGlyphCssCustomProperties } from 'app/src/scripts/faColorContrast/faColorContrast_manager'

export const useProjectHierarchyTree = createUseProjectHierarchyTree({
  S_FaActiveProject,
  S_FaOpenedDocuments,
  S_FaProjectHierarchyTree,
  S_FaUserSettings,
  computed,
  dragContext,
  i18nT: (key) => String(i18n.global.t(key)),
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  resolveFaDocumentWorkspaceRouteDocumentId,
  runFaAction,
  storeToRefs,
  useRoute,
  watch
})
