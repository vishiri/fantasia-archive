import { ref } from 'vue'
import type { Ref } from 'vue'

import type { I_qMenuViewportPointerPosition } from 'app/types/I_qMenuViewportPointerPosition'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { resolveProjectHierarchyTreeAddNewRowLabel } from '../functions/projectHierarchyTreeAddNewDocumentLabel'
import { PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_ICON } from '../functions/projectHierarchyTreeConstants'
import { resolveProjectHierarchyTreeNodeContextMenuSectionFlags } from './projectHierarchyTreeNodeContextMenuEligibilityWiring'
import { createResolveProjectHierarchyTreePlacementAddNewContextMenuRow } from '../functions/projectHierarchyTreePlacementAddNewContextMenu'
import { resolveQMenuViewportPointerPositionFromMouseEvent } from '../functions/resolveQMenuViewportPointerPositionFromMouseEvent'
import type { createProjectHierarchyTreeBulkExpandCollapseWiring } from './projectHierarchyTreeBulkExpandCollapseWiring'
import { createProjectHierarchyTreeNodeContextMenuActionWiring } from './projectHierarchyTreeNodeContextMenuActionWiring'

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
  const contextMenuShowsBulkExpandRows = ref(false)
  const contextMenuShowsCopyRows = ref(false)
  const actionWiring = createProjectHierarchyTreeNodeContextMenuActionWiring({
    bulkExpandCollapseWiring: deps.bulkExpandCollapseWiring,
    contextMenuAnchorNodeId,
    isNodeContextMenuOpen,
    onAddNewDocumentRowClick: deps.onAddNewDocumentRowClick,
    treeData: deps.treeData
  })

  function clearContextMenuAddNewRow (): void {
    contextMenuAddNewRowLabel.value = null
    contextMenuAddNewRowIcon.value = null
  }

  function clearContextMenuSectionFlags (): void {
    contextMenuShowsBulkExpandRows.value = false
    contextMenuShowsCopyRows.value = false
  }

  function onNodeRowContextMenu (
    node: I_faProjectHierarchyTreeHeTreeNode,
    event: MouseEvent
  ): void {
    event.preventDefault()
    if (node.nodeKind === 'addNewDocument') {
      return
    }
    const sectionFlags = resolveProjectHierarchyTreeNodeContextMenuSectionFlags(
      node,
      deps.treeData.value
    )
    if (sectionFlags === null) {
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
    contextMenuShowsBulkExpandRows.value = sectionFlags.showsBulkExpandRows
    contextMenuShowsCopyRows.value = sectionFlags.showsCopyRows
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

  function onNodeContextMenuHide (): void {
    contextMenuAnchorNodeId.value = null
    nodeMenuPointerPosition.value = null
    clearContextMenuAddNewRow()
    clearContextMenuSectionFlags()
  }

  const onAddNewDocumentFromContextMenuClick = actionWiring.onAddNewDocumentFromContextMenuClick
  const onCollapseAllUnderNodeClick = actionWiring.onCollapseAllUnderNodeClick
  const onExpandAllUnderNodeClick = actionWiring.onExpandAllUnderNodeClick

  return {
    contextMenuAddNewRowIcon,
    contextMenuAddNewRowLabel,
    contextMenuAnchorNodeId,
    contextMenuShowsBulkExpandRows,
    contextMenuShowsCopyRows,
    isNodeContextMenuOpen,
    nodeMenuPointerPosition,
    onAddNewDocumentFromContextMenuClick,
    onCollapseAllUnderNodeClick,
    onExpandAllUnderNodeClick,
    onNodeContextMenuHide,
    onNodeRowContextMenu
  }
}
