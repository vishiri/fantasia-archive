import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import type { watch as watchFn } from 'vue'
import { storeToRefs } from 'pinia'
import { dragContext } from '@he-tree/vue'

import type { Ref } from 'vue'

import type { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import type { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeSessionWiring } from './projectHierarchyTreeSessionWiring'

type T_useProjectHierarchyTreeOptions = {
  onDocumentClick: (documentId: string) => void
}

type T_useProjectHierarchyTree = (
  opts: T_useProjectHierarchyTreeOptions
) => ReturnType<typeof createProjectHierarchyTreeSessionWiring>

export function createUseProjectHierarchyTree (deps: {
  S_FaActiveProject: typeof S_FaActiveProject
  S_FaProjectHierarchyTree: typeof S_FaProjectHierarchyTree
  computed: typeof computed
  dragContext: typeof dragContext
  nextTick: typeof nextTick
  onMounted: typeof onMounted
  onUnmounted: typeof onUnmounted
  ref: typeof ref
  storeToRefs: typeof storeToRefs
  watch: typeof watchFn
}): T_useProjectHierarchyTree {
  return function useProjectHierarchyTree (opts) {
    const hierarchyStore = deps.S_FaProjectHierarchyTree()
    const { pendingRevealPath, treeData, uiState, worlds } = deps.storeToRefs(hierarchyStore)

    return createProjectHierarchyTreeSessionWiring({
      S_FaActiveProject: deps.S_FaActiveProject,
      computed: deps.computed,
      dragContext: deps.dragContext,
      hierarchyStore,
      nextTick: deps.nextTick,
      onDocumentClick: opts.onDocumentClick,
      onMounted: deps.onMounted,
      onUnmounted: deps.onUnmounted,
      pendingRevealPath: pendingRevealPath as Ref<string[]>,
      ref: deps.ref,
      treeData: treeData as Ref<I_faProjectHierarchyTreeHeTreeNode[]>,
      uiState: uiState as Ref<I_faProjectHierarchyTreeUiState>,
      watch: deps.watch,
      worlds: worlds as Ref<I_faProjectHierarchyTreeWorkspaceWorld[]>
    })
  }
}
