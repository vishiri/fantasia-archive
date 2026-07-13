import { ref } from 'vue'
import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeBulkExpandCollapseMenuEligible } from '../functions/projectHierarchyTreeBulkExpandCollapse'
import type { createProjectHierarchyTreeBulkExpandCollapseWiring } from './projectHierarchyTreeBulkExpandCollapseWiring'

export function createProjectHierarchyTreeNodeContextMenuWiring (deps: {
  bulkExpandCollapseWiring: ReturnType<typeof createProjectHierarchyTreeBulkExpandCollapseWiring>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  const isNodeContextMenuOpen = ref(false)
  const nodeMenuTargetElement = ref<HTMLElement | null>(null)
  const contextMenuAnchorNodeId = ref<string | null>(null)

  function onNodeRowContextMenu (
    node: I_faProjectHierarchyTreeHeTreeNode,
    event: MouseEvent
  ): void {
    event.preventDefault()
    if (node.nodeKind === 'addNewDocument') {
      return
    }
    if (!isProjectHierarchyTreeBulkExpandCollapseMenuEligible(node, deps.treeData.value)) {
      return
    }
    const target = event.currentTarget instanceof HTMLElement
      ? event.currentTarget
      : null
    if (target === null) {
      return
    }
    nodeMenuTargetElement.value = target
    contextMenuAnchorNodeId.value = node.id
    isNodeContextMenuOpen.value = true
  }

  function onExpandAllUnderNodeClick (): void {
    const anchorId = contextMenuAnchorNodeId.value
    if (anchorId === null) {
      return
    }
    deps.bulkExpandCollapseWiring.expandAllUnderNode(anchorId)
    isNodeContextMenuOpen.value = false
  }

  function onCollapseAllUnderNodeClick (): void {
    const anchorId = contextMenuAnchorNodeId.value
    if (anchorId === null) {
      return
    }
    void deps.bulkExpandCollapseWiring.collapseAllUnderNode(anchorId)
    isNodeContextMenuOpen.value = false
  }

  function onNodeContextMenuHide (): void {
    contextMenuAnchorNodeId.value = null
  }

  return {
    contextMenuAnchorNodeId,
    isNodeContextMenuOpen,
    nodeMenuTargetElement,
    onCollapseAllUnderNodeClick,
    onExpandAllUnderNodeClick,
    onNodeContextMenuHide,
    onNodeRowContextMenu
  }
}
