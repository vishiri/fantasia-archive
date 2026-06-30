import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { dragContext } from '@he-tree/vue'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'

import { createUseProjectHierarchyTree } from './createUseProjectHierarchyTree'

export {
  applyProjectHierarchyTreeTreeNodeKindClass,
  clearProjectHierarchyTreeTreeNodeKindClass
} from './projectHierarchyTreeTreeNodeKindClassWiring'

export const useProjectHierarchyTree = createUseProjectHierarchyTree({
  S_FaActiveProject,
  S_FaProjectHierarchyTree,
  computed,
  dragContext,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  storeToRefs,
  watch
})
