import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeNodeContextMenuSectionFlags
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeBulkExpandCollapseMenuEligible } from '../functions/projectHierarchyTreeBulkExpandCollapse'
import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { isProjectHierarchyTreeDocumentUnderTagNode } from '../functions/projectHierarchyTreeTagNodes'
import type { createProjectHierarchyTreeBulkExpandCollapseWiring } from './projectHierarchyTreeBulkExpandCollapseWiring'

function documentNodeHasSortableDocumentChild (
  node: I_faProjectHierarchyTreeHeTreeNode
): boolean {
  return node.children.some((child) => {
    return child.nodeKind === 'document' && child.documentId !== null
  })
}

export function resolveProjectHierarchyTreeNodeContextMenuSectionFlags (
  node: I_faProjectHierarchyTreeHeTreeNode,
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
): I_faProjectHierarchyTreeNodeContextMenuSectionFlags | null {
  if (node.nodeKind === 'tag') {
    return {
      showsBulkExpandRows: false,
      showsCopyRows: false,
      showsDocumentOpenEditRows: false,
      showsSortByRows: true,
      showsTagMenuRows: true,
      sortByDirectScopeOnly: true
    }
  }
  if (node.nodeKind === 'tagWrapper') {
    const showsBulkExpandRows = isProjectHierarchyTreeBulkExpandCollapseMenuEligible(node, treeData)
    if (!showsBulkExpandRows) {
      return null
    }
    return {
      showsBulkExpandRows: true,
      showsCopyRows: false,
      showsDocumentOpenEditRows: false,
      showsSortByRows: false,
      showsTagMenuRows: false,
      sortByDirectScopeOnly: false
    }
  }

  const showsCopyRows = node.nodeKind === 'document' && node.documentId !== null
  const showsBulkExpandRows = isProjectHierarchyTreeBulkExpandCollapseMenuEligible(node, treeData)
  const hasPlacementId =
    typeof node.placementId === 'string' &&
    node.placementId.trim().length > 0
  const showsSortByRows =
    hasPlacementId &&
    (
      (
        node.nodeKind === 'document' &&
        node.documentId !== null &&
        documentNodeHasSortableDocumentChild(node)
      ) ||
      node.nodeKind === 'templatePlacement'
    )
  const showsDocumentOpenEditRows =
    isProjectHierarchyTreeDocumentUnderTagNode(node) && node.documentId !== null

  if (
    !showsCopyRows &&
    !showsBulkExpandRows &&
    !showsSortByRows &&
    !showsDocumentOpenEditRows
  ) {
    return null
  }

  return {
    showsBulkExpandRows,
    showsCopyRows,
    showsDocumentOpenEditRows,
    showsSortByRows,
    showsTagMenuRows: false,
    sortByDirectScopeOnly: false
  }
}

export function resolveProjectHierarchyTreeNodeContextMenuLabels (
  t: (key: string) => string
): {
    addNewDocumentToThisTagLabel: string
    addNewDocumentUnderThisLabel: string
    collapseAllUnderNodeLabel: string
    copyBackgroundColorLabel: string
    copyDocumentLabel: string
    copyNameLabel: string
    copyTextColorLabel: string
    deleteDocumentLabel: string
    deleteTagLabel: string
    editDocumentLabel: string
    expandAllUnderNodeLabel: string
    openDocumentLabel: string
    renameTagLabel: string
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
  const addNewDocumentToThisTagLabel = t('projectUI.projectHierarchyTree.contextMenu.addNewDocumentToThisTag')
  const deleteDocumentLabel = t('projectUI.projectHierarchyTree.contextMenu.deleteDocument')
  const deleteTagLabel = t('projectUI.projectHierarchyTree.contextMenu.deleteTag')
  const renameTagLabel = t('projectUI.projectHierarchyTree.contextMenu.renameTag')
  const sortByLabel = t('projectUI.projectHierarchyTree.contextMenu.sortBy')

  return {
    addNewDocumentToThisTagLabel,
    addNewDocumentUnderThisLabel,
    collapseAllUnderNodeLabel,
    copyBackgroundColorLabel,
    copyDocumentLabel,
    copyNameLabel,
    copyTextColorLabel,
    deleteDocumentLabel,
    deleteTagLabel,
    editDocumentLabel,
    expandAllUnderNodeLabel,
    openDocumentLabel,
    renameTagLabel,
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
