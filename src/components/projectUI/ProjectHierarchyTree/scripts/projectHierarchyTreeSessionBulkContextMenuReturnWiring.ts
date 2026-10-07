import type { createProjectHierarchyTreeNodeContextMenuWiring } from './projectHierarchyTreeNodeContextMenuSessionWiring'
import type { createProjectHierarchyTreeTagDialogsWiring } from './projectHierarchyTreeTagDialogsWiring'

type T_nodeContextMenuWiring = ReturnType<typeof createProjectHierarchyTreeNodeContextMenuWiring>
type T_tagDialogsWiring = ReturnType<typeof createProjectHierarchyTreeTagDialogsWiring>
type T_copyHandlers = {
  onCopyBackgroundColorClick: () => void
  onCopyNameClick: () => void
  onCopyTextColorClick: () => void
}
type T_documentActionHandlers = {
  onAddNewDocumentUnderThisClick: () => void
  onCopyDocumentClick: () => void
  onDeleteDocumentClick: () => void
  onEditDocumentClick: () => void
  onOpenDocumentClick: () => void
}
type T_sortHandlers = {
  onSortByItemClick: (itemId: import('app/types/I_faProjectHierarchyTreeDomain').T_faProjectHierarchyTreeSortByMenuItemId) => void
}

function pickNodeContextMenuApiFields (nodeContextMenuWiring: T_nodeContextMenuWiring) {
  const {
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
    onExpandAllUnderNodeClick
  } = nodeContextMenuWiring
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
    onExpandAllUnderNodeClick
  }
}

function pickTagDialogApiFields (tagDialogsWiring: T_tagDialogsWiring) {
  const {
    addDocumentPlacementOptions,
    deleteTagConfirmOpen,
    deleteTagName,
    onAddNewDocumentToThisTagClick: onAddNewDocumentToThisTagFromContextMenuClick,
    onConfirmDeleteTag,
    onConfirmRenameTag,
    onDeleteTagFromContextMenuClick,
    onDismissDeleteTagDialog,
    onDismissRenameTagDialog,
    onRenameTagFromContextMenuClick,
    renameTagCanConfirm,
    renameTagCurrentName,
    renameTagDialogOpen,
    renameTagMergeWarning,
    renameTagNameDraft
  } = tagDialogsWiring
  return {
    addDocumentPlacementOptions,
    deleteTagConfirmOpen,
    deleteTagName,
    onAddNewDocumentToThisTagFromContextMenuClick,
    onConfirmDeleteTag,
    onConfirmRenameTag,
    onDeleteTagFromContextMenuClick,
    onDismissDeleteTagDialog,
    onDismissRenameTagDialog,
    onRenameTagFromContextMenuClick,
    renameTagCanConfirm,
    renameTagCurrentName,
    renameTagDialogOpen,
    renameTagMergeWarning,
    renameTagNameDraft
  }
}

export function buildProjectHierarchyTreeSessionBulkContextMenuApi (input: {
  copyHandlers: T_copyHandlers
  documentActionHandlers: T_documentActionHandlers
  nodeContextMenuWiring: T_nodeContextMenuWiring
  onNodeContextMenuHide: () => void
  onNodeRowContextMenu: T_nodeContextMenuWiring['onNodeRowContextMenu']
  sortHandlers: T_sortHandlers
  tagDialogsWiring: T_tagDialogsWiring
}) {
  const {
    copyHandlers,
    documentActionHandlers,
    nodeContextMenuWiring,
    onNodeContextMenuHide,
    onNodeRowContextMenu,
    sortHandlers,
    tagDialogsWiring
  } = input
  const nodeFields = pickNodeContextMenuApiFields(nodeContextMenuWiring)
  const tagFields = pickTagDialogApiFields(tagDialogsWiring)
  const {
    onAddNewDocumentUnderThisClick: onAddNewDocumentUnderThisFromContextMenuClick,
    onCopyDocumentClick: onCopyDocumentFromContextMenuClick,
    onDeleteDocumentClick: onDeleteDocumentFromContextMenuClick,
    onEditDocumentClick: onEditDocumentFromContextMenuClick,
    onOpenDocumentClick: onOpenDocumentFromContextMenuClick
  } = documentActionHandlers
  const {
    onCopyBackgroundColorClick: onCopyBackgroundColorFromContextMenuClick,
    onCopyNameClick: onCopyNameFromContextMenuClick,
    onCopyTextColorClick: onCopyTextColorFromContextMenuClick
  } = copyHandlers
  const { onSortByItemClick: onSortByItemFromContextMenuClick } = sortHandlers
  return {
    ...nodeFields,
    ...tagFields,
    onAddNewDocumentUnderThisFromContextMenuClick,
    onCopyBackgroundColorFromContextMenuClick,
    onCopyDocumentFromContextMenuClick,
    onCopyNameFromContextMenuClick,
    onCopyTextColorFromContextMenuClick,
    onDeleteDocumentFromContextMenuClick,
    onEditDocumentFromContextMenuClick,
    onNodeContextMenuHide,
    onNodeRowContextMenu,
    onOpenDocumentFromContextMenuClick,
    onSortByItemFromContextMenuClick
  }
}
