import { ref } from 'vue'
import type { Ref } from 'vue'

import type { I_qMenuViewportPointerPosition } from 'app/types/I_qMenuViewportPointerPosition'
import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeNodeContextMenuSectionFlags
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { isProjectHierarchyTreeBulkExpandCollapseMenuEligible } from '../functions/projectHierarchyTreeBulkExpandCollapse'
import { resolveProjectHierarchyTreeAddNewRowLabel } from '../functions/projectHierarchyTreeAddNewDocumentLabel'
import { PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_ICON } from '../functions/projectHierarchyTreeConstants'
import { createResolveProjectHierarchyTreePlacementAddNewContextMenuRow } from '../functions/projectHierarchyTreePlacementAddNewContextMenu'
import { resolveQMenuViewportPointerPositionFromMouseEvent } from '../functions/resolveQMenuViewportPointerPositionFromMouseEvent'
import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import type { createProjectHierarchyTreeBulkExpandCollapseWiring } from './projectHierarchyTreeBulkExpandCollapseWiring'

export function resolveProjectHierarchyTreeNodeContextMenuSectionFlags (
  node: I_faProjectHierarchyTreeHeTreeNode,
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
): I_faProjectHierarchyTreeNodeContextMenuSectionFlags | null {
  const showsCopyRows = node.nodeKind === 'document' && node.documentId !== null
  const showsBulkExpandRows = isProjectHierarchyTreeBulkExpandCollapseMenuEligible(node, treeData)
  const showsSortByRows =
    (
      (node.nodeKind === 'document' && node.documentId !== null) ||
      node.nodeKind === 'templatePlacement'
    ) &&
    typeof node.placementId === 'string' &&
    node.placementId.trim().length > 0
  if (!showsCopyRows && !showsBulkExpandRows && !showsSortByRows) {
    return null
  }

  return {
    showsBulkExpandRows,
    showsCopyRows,
    showsSortByRows
  }
}

export function resolveProjectHierarchyTreeNodeContextMenuLabels (
  t: (key: string) => string
): {
    addNewDocumentUnderThisLabel: string
    collapseAllUnderNodeLabel: string
    copyBackgroundColorLabel: string
    copyDocumentLabel: string
    copyNameLabel: string
    copyTextColorLabel: string
    deleteDocumentLabel: string
    editDocumentLabel: string
    expandAllUnderNodeLabel: string
    openDocumentLabel: string
    sortByLabel: string
  } {
  const expandAllUnderNodeLabel = t('projectUI.projectHierarchyTree.contextMenu.expandAllUnderNode')
  const collapseAllUnderNodeLabel = t('projectUI.projectHierarchyTree.contextMenu.collapseAllUnderNode')
  const copyNameLabel = t('projectUI.projectAppControlBar.copyName')
  const copyTextColorLabel = t('projectUI.projectAppControlBar.copyTextColor')
  const copyBackgroundColorLabel = t('projectUI.projectAppControlBar.copyBackgroundColor')
  const openDocumentLabel = t('projectUI.projectHierarchyTree.contextMenu.openDocument')
  const editDocumentLabel = t('projectUI.projectHierarchyTree.contextMenu.editDocument')
  const copyDocumentLabel = t('projectUI.projectHierarchyTree.contextMenu.copyDocument')
  const addNewDocumentUnderThisLabel = t('projectUI.projectHierarchyTree.contextMenu.addNewDocumentUnderThis')
  const deleteDocumentLabel = t('projectUI.projectHierarchyTree.contextMenu.deleteDocument')
  const sortByLabel = t('projectUI.projectHierarchyTree.contextMenu.sortBy')

  return {
    addNewDocumentUnderThisLabel,
    collapseAllUnderNodeLabel,
    copyBackgroundColorLabel,
    copyDocumentLabel,
    copyNameLabel,
    copyTextColorLabel,
    deleteDocumentLabel,
    editDocumentLabel,
    expandAllUnderNodeLabel,
    openDocumentLabel,
    sortByLabel
  }
}

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
  const contextMenuShowsSortByRows = ref(false)
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
    contextMenuShowsSortByRows.value = false
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
    contextMenuShowsSortByRows.value = sectionFlags.showsSortByRows
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
    contextMenuShowsSortByRows,
    isNodeContextMenuOpen,
    nodeMenuPointerPosition,
    onAddNewDocumentFromContextMenuClick,
    onCollapseAllUnderNodeClick,
    onExpandAllUnderNodeClick,
    onNodeContextMenuHide,
    onNodeRowContextMenu
  }
}
