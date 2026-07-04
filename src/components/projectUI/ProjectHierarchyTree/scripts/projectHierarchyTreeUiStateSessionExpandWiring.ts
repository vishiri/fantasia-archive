import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  markProjectHierarchyTreeNodeClosed,
  markProjectHierarchyTreeNodeOpen,
  reapplyProjectHierarchyTreeHeTreeOpenState
} from './projectHierarchyTreeUiStateWiring'
import { reapplyProjectHierarchyTreeLatentDescendantExpandState } from './projectHierarchyTreeLatentExpandReapplyWiring'

export function createProjectHierarchyTreeUiStateSessionExpandWiring (deps: {
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  loadChildrenAlongRevealPath: (nodeIds: string[]) => Promise<void>
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  function markNodeOpen (nodeId: string): void {
    markProjectHierarchyTreeNodeOpen({
      nodeId,
      openNodeIds: deps.openNodeIds,
      queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
      treeData: deps.treeData
    })
  }

  function markNodeClosed (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode): void {
    markProjectHierarchyTreeNodeClosed({
      node,
      nodeId,
      openNodeIds: deps.openNodeIds,
      queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
      treeData: deps.treeData
    })
  }

  function reapplyHeTreeOpenState (): void {
    reapplyProjectHierarchyTreeHeTreeOpenState({
      getTreeRef: deps.getTreeRef,
      openNodeIds: deps.openNodeIds,
      treeData: deps.treeData
    })
  }

  async function reapplyLatentDescendantExpandState (): Promise<void> {
    await reapplyProjectHierarchyTreeLatentDescendantExpandState({
      getTreeRef: deps.getTreeRef,
      loadChildrenAlongRevealPath: deps.loadChildrenAlongRevealPath,
      openNodeIds: deps.openNodeIds,
      treeData: deps.treeData
    })
  }

  return {
    markNodeClosed,
    markNodeOpen,
    reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState
  }
}
