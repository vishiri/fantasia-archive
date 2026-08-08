import { ref } from 'vue'
import type { Ref } from 'vue'

import type { I_qMenuViewportPointerPosition } from 'app/types/I_qMenuViewportPointerPosition'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { resolveProjectHierarchyTreeAddNewRowLabel } from '../functions/projectHierarchyTreeAddNewDocumentLabel'
import { PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_ICON } from '../functions/projectHierarchyTreeConstants'
import { createResolveProjectHierarchyTreePlacementAddNewContextMenuRow } from '../functions/projectHierarchyTreePlacementAddNewContextMenu'
import type { createProjectHierarchyTreeBulkExpandCollapseWiring } from './projectHierarchyTreeBulkExpandCollapseWiring'
import { openProjectHierarchyTreeNodeContextMenu } from './projectHierarchyTreeNodeContextMenuOpenWiring'
import { createProjectHierarchyTreeNodeContextMenuActionWiring } from './projectHierarchyTreeNodeContextMenuWiring'

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
  const contextMenuShowsDocumentOpenEditRows = ref(false)
  const contextMenuShowsSortByRows = ref(false)
  const contextMenuSortByDirectScopeOnly = ref(false)
  const contextMenuShowsTagMenuRows = ref(false)
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
    contextMenuShowsDocumentOpenEditRows.value = false
    contextMenuShowsSortByRows.value = false
    contextMenuSortByDirectScopeOnly.value = false
    contextMenuShowsTagMenuRows.value = false
  }

  function onNodeRowContextMenu (
    node: I_faProjectHierarchyTreeHeTreeNode,
    event: MouseEvent
  ): void {
    openProjectHierarchyTreeNodeContextMenu({
      clearContextMenuAddNewRow,
      contextMenuAddNewRowIcon,
      contextMenuAddNewRowLabel,
      contextMenuAnchorNodeId,
      contextMenuShowsBulkExpandRows,
      contextMenuShowsCopyRows,
      contextMenuShowsDocumentOpenEditRows,
      contextMenuShowsSortByRows,
      contextMenuSortByDirectScopeOnly,
      contextMenuShowsTagMenuRows,
      event,
      isNodeContextMenuOpen,
      node,
      nodeMenuPointerPosition,
      resolvePreferredLanguageCode: deps.resolvePreferredLanguageCode,
      resolvePlacementAddNewContextMenuRow: resolveProjectHierarchyTreePlacementAddNewContextMenuRow,
      treeData: deps.treeData.value
    })
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
    contextMenuShowsDocumentOpenEditRows,
    contextMenuShowsSortByRows,
    contextMenuSortByDirectScopeOnly,
    contextMenuShowsTagMenuRows,
    isNodeContextMenuOpen,
    nodeMenuPointerPosition,
    onAddNewDocumentFromContextMenuClick,
    onCollapseAllUnderNodeClick,
    onExpandAllUnderNodeClick,
    onNodeContextMenuHide,
    onNodeRowContextMenu
  }
}
