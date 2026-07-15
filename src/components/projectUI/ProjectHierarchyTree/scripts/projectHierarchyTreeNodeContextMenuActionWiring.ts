import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import type { createProjectHierarchyTreeBulkExpandCollapseWiring } from './projectHierarchyTreeBulkExpandCollapseWiring'

export function createProjectHierarchyTreeNodeContextMenuActionWiring (deps: {
  bulkExpandCollapseWiring: ReturnType<typeof createProjectHierarchyTreeBulkExpandCollapseWiring>
  contextMenuAnchorNodeId: Ref<string | null>
  isNodeContextMenuOpen: Ref<boolean>
  onAddNewDocumentRowClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): {
    onAddNewDocumentFromContextMenuClick: () => void
    onCollapseAllUnderNodeClick: () => void
    onExpandAllUnderNodeClick: () => void
  } {
  function onExpandAllUnderNodeClick (): void {
    const anchorId = deps.contextMenuAnchorNodeId.value
    if (anchorId === null) {
      return
    }
    deps.bulkExpandCollapseWiring.expandAllUnderNode(anchorId)
    deps.isNodeContextMenuOpen.value = false
  }

  function onCollapseAllUnderNodeClick (): void {
    const anchorId = deps.contextMenuAnchorNodeId.value
    if (anchorId === null) {
      return
    }
    void deps.bulkExpandCollapseWiring.collapseAllUnderNode(anchorId)
    deps.isNodeContextMenuOpen.value = false
  }

  function onAddNewDocumentFromContextMenuClick (): void {
    const anchorId = deps.contextMenuAnchorNodeId.value
    if (anchorId === null) {
      return
    }
    const placement = findProjectHierarchyTreeNodeById(deps.treeData.value, anchorId)
    if (placement === null || placement.nodeKind !== 'templatePlacement') {
      return
    }
    deps.onAddNewDocumentRowClick(placement)
    deps.isNodeContextMenuOpen.value = false
  }

  return {
    onAddNewDocumentFromContextMenuClick,
    onCollapseAllUnderNodeClick,
    onExpandAllUnderNodeClick
  }
}
