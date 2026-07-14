import { ref } from 'vue'
import type { Ref } from 'vue'

import type { I_qMenuViewportPointerPosition } from 'app/types/I_qMenuViewportPointerPosition'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { isProjectHierarchyTreeBulkExpandCollapseMenuEligible } from '../functions/projectHierarchyTreeBulkExpandCollapse'
import { resolveProjectHierarchyTreeAddNewRowLabel } from '../functions/projectHierarchyTreeAddNewDocumentLabel'
import { PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_ICON } from '../functions/projectHierarchyTreeConstants'
import { createResolveProjectHierarchyTreePlacementAddNewContextMenuRow } from '../functions/projectHierarchyTreePlacementAddNewContextMenu'
import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { resolveQMenuViewportPointerPositionFromMouseEvent } from '../functions/resolveQMenuViewportPointerPositionFromMouseEvent'
import type { createProjectHierarchyTreeBulkExpandCollapseWiring } from './projectHierarchyTreeBulkExpandCollapseWiring'

export function createProjectHierarchyTreeNodeContextMenuWiring (deps: {
  bulkExpandCollapseWiring: ReturnType<typeof createProjectHierarchyTreeBulkExpandCollapseWiring>
  onAddNewDocumentRowClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
  resolvePreferredLanguageCode: () => T_faUserSettingsLanguageCode
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  const resolveProjectHierarchyTreePlacementAddNewContextMenuRow =
    createResolveProjectHierarchyTreePlacementAddNewContextMenuRow({
      addNewDocumentIcon: PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_ICON,
      resolveAddNewRowLabel: resolveProjectHierarchyTreeAddNewRowLabel
    })
  const isNodeContextMenuOpen = ref(false)
  const nodeMenuPointerPosition = ref<I_qMenuViewportPointerPosition | null>(null)
  const contextMenuAnchorNodeId = ref<string | null>(null)
  const contextMenuAddNewRowLabel = ref<string | null>(null)
  const contextMenuAddNewRowIcon = ref<string | null>(null)

  function clearContextMenuAddNewRow (): void {
    contextMenuAddNewRowLabel.value = null
    contextMenuAddNewRowIcon.value = null
  }

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
    nodeMenuPointerPosition.value = resolveQMenuViewportPointerPositionFromMouseEvent(event)
    contextMenuAnchorNodeId.value = node.id
    const addNewRow = resolveProjectHierarchyTreePlacementAddNewContextMenuRow({
      placement: node,
      preferredLanguageCode: deps.resolvePreferredLanguageCode()
    })
    if (addNewRow === null) {
      clearContextMenuAddNewRow()
    } else {
      contextMenuAddNewRowLabel.value = addNewRow.label
      contextMenuAddNewRowIcon.value = addNewRow.icon
    }
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

  function onAddNewDocumentFromContextMenuClick (): void {
    const anchorId = contextMenuAnchorNodeId.value
    if (anchorId === null) {
      return
    }
    const placement = findProjectHierarchyTreeNodeById(deps.treeData.value, anchorId)
    if (placement === null || placement.nodeKind !== 'templatePlacement') {
      return
    }
    deps.onAddNewDocumentRowClick(placement)
    isNodeContextMenuOpen.value = false
  }

  function onNodeContextMenuHide (): void {
    contextMenuAnchorNodeId.value = null
    nodeMenuPointerPosition.value = null
    clearContextMenuAddNewRow()
  }

  return {
    contextMenuAddNewRowIcon,
    contextMenuAddNewRowLabel,
    contextMenuAnchorNodeId,
    isNodeContextMenuOpen,
    nodeMenuPointerPosition,
    onAddNewDocumentFromContextMenuClick,
    onCollapseAllUnderNodeClick,
    onExpandAllUnderNodeClick,
    onNodeContextMenuHide,
    onNodeRowContextMenu
  }
}
