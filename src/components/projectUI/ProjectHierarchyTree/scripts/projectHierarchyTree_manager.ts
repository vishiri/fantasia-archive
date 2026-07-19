import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { dragContext } from '@he-tree/vue'
import { useRoute } from 'vue-router'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { resolveFaDocumentWorkspaceRouteDocumentId } from 'app/src/scripts/appRouting/appRouting_manager'

import { createUseProjectHierarchyTree } from './createUseProjectHierarchyTree'
import { resolveProjectHierarchyTreePlacementDisplayIcon } from './projectHierarchyTreePlacementDisplayIconWiring'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

export {
  applyProjectHierarchyTreeTreeNodeKindClass,
  clearProjectHierarchyTreeTreeNodeKindClass
} from './projectHierarchyTreeTreeNodeKindClassWiring'

export { resolveProjectHierarchyTreeHeTreeNodeKey } from '../functions/projectHierarchyTreeHeTreeNodeKey'
export { resolveProjectHierarchyTreeWorldDisplayColor } from '../functions/resolveProjectHierarchyTreeWorldDisplayColor'
export { resolveProjectHierarchyTreeDocumentAppearanceChrome } from './projectHierarchyTreeDocumentAppearanceChromeWiring'
export { resolveProjectHierarchyTreePlacementDisplayIcon }

export const useProjectHierarchyTree = createUseProjectHierarchyTree({
  S_FaActiveProject,
  S_FaOpenedDocuments,
  S_FaProjectHierarchyTree,
  S_FaUserSettings,
  computed,
  dragContext,
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
