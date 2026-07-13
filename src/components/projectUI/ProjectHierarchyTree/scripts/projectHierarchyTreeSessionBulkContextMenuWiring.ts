import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeBulkExpandCollapseWiring } from './projectHierarchyTreeBulkExpandCollapseWiring'
import { createProjectHierarchyTreeNodeContextMenuWiring } from './projectHierarchyTreeNodeContextMenuWiring'

export function createProjectHierarchyTreeSessionBulkContextMenuWiring (deps: {
  dragExpandUiFrozen: Ref<boolean>
  lazyLoadWiring: {
    flushDeferredTreeRevisionPublish: () => void | Promise<void>
  }
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
  uiStateWiring: {
    reapplyHeTreeOpenState: () => void
    reapplyLatentDescendantExpandState: () => Promise<void>
  }
}) {
  const bulkExpandCollapseWiring = createProjectHierarchyTreeBulkExpandCollapseWiring({
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    flushDeferredTreeRevisionPublish: deps.lazyLoadWiring.flushDeferredTreeRevisionPublish,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    reapplyHeTreeOpenState: deps.uiStateWiring.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.uiStateWiring.reapplyLatentDescendantExpandState,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData,
    treeMountKey: deps.treeMountKey
  })
  const nodeContextMenuWiring = createProjectHierarchyTreeNodeContextMenuWiring({
    bulkExpandCollapseWiring,
    treeData: deps.treeData
  })

  return {
    contextMenuAnchorNodeId: nodeContextMenuWiring.contextMenuAnchorNodeId,
    isNodeContextMenuOpen: nodeContextMenuWiring.isNodeContextMenuOpen,
    nodeMenuTargetElement: nodeContextMenuWiring.nodeMenuTargetElement,
    onCollapseAllUnderNodeClick: nodeContextMenuWiring.onCollapseAllUnderNodeClick,
    onExpandAllUnderNodeClick: nodeContextMenuWiring.onExpandAllUnderNodeClick,
    onNodeContextMenuHide: nodeContextMenuWiring.onNodeContextMenuHide,
    onNodeRowContextMenu: nodeContextMenuWiring.onNodeRowContextMenu
  }
}
