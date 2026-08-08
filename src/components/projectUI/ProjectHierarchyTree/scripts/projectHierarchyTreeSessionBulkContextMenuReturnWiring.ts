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

export function buildProjectHierarchyTreeSessionBulkContextMenuApi (input: {
  copyHandlers: T_copyHandlers
  documentActionHandlers: T_documentActionHandlers
  nodeContextMenuWiring: T_nodeContextMenuWiring
  onNodeContextMenuHide: () => void
  onNodeRowContextMenu: T_nodeContextMenuWiring['onNodeRowContextMenu']
  sortHandlers: T_sortHandlers
  tagDialogsWiring: T_tagDialogsWiring
}) {
  const { nodeContextMenuWiring, tagDialogsWiring } = input
  return {
    addDocumentPlacementOptions: tagDialogsWiring.addDocumentPlacementOptions,
    contextMenuAddNewRowIcon: nodeContextMenuWiring.contextMenuAddNewRowIcon,
    contextMenuAddNewRowLabel: nodeContextMenuWiring.contextMenuAddNewRowLabel,
    contextMenuAnchorNodeId: nodeContextMenuWiring.contextMenuAnchorNodeId,
    contextMenuShowsBulkExpandRows: nodeContextMenuWiring.contextMenuShowsBulkExpandRows,
    contextMenuShowsCopyRows: nodeContextMenuWiring.contextMenuShowsCopyRows,
    contextMenuShowsDocumentOpenEditRows: nodeContextMenuWiring.contextMenuShowsDocumentOpenEditRows,
    contextMenuShowsSortByRows: nodeContextMenuWiring.contextMenuShowsSortByRows,
    contextMenuSortByDirectScopeOnly: nodeContextMenuWiring.contextMenuSortByDirectScopeOnly,
    contextMenuShowsTagMenuRows: nodeContextMenuWiring.contextMenuShowsTagMenuRows,
    deleteTagConfirmOpen: tagDialogsWiring.deleteTagConfirmOpen,
    deleteTagName: tagDialogsWiring.deleteTagName,
    isNodeContextMenuOpen: nodeContextMenuWiring.isNodeContextMenuOpen,
    nodeMenuPointerPosition: nodeContextMenuWiring.nodeMenuPointerPosition,
    onAddNewDocumentFromContextMenuClick: nodeContextMenuWiring.onAddNewDocumentFromContextMenuClick,
    onAddNewDocumentToThisTagFromContextMenuClick:
      tagDialogsWiring.onAddNewDocumentToThisTagClick,
    onAddNewDocumentUnderThisFromContextMenuClick:
      input.documentActionHandlers.onAddNewDocumentUnderThisClick,
    onCollapseAllUnderNodeClick: nodeContextMenuWiring.onCollapseAllUnderNodeClick,
    onConfirmDeleteTag: tagDialogsWiring.onConfirmDeleteTag,
    onConfirmRenameTag: tagDialogsWiring.onConfirmRenameTag,
    onCopyBackgroundColorFromContextMenuClick: input.copyHandlers.onCopyBackgroundColorClick,
    onCopyDocumentFromContextMenuClick: input.documentActionHandlers.onCopyDocumentClick,
    onCopyNameFromContextMenuClick: input.copyHandlers.onCopyNameClick,
    onCopyTextColorFromContextMenuClick: input.copyHandlers.onCopyTextColorClick,
    onDeleteDocumentFromContextMenuClick: input.documentActionHandlers.onDeleteDocumentClick,
    onDeleteTagFromContextMenuClick: tagDialogsWiring.onDeleteTagFromContextMenuClick,
    onDismissDeleteTagDialog: tagDialogsWiring.onDismissDeleteTagDialog,
    onDismissRenameTagDialog: tagDialogsWiring.onDismissRenameTagDialog,
    onEditDocumentFromContextMenuClick: input.documentActionHandlers.onEditDocumentClick,
    onExpandAllUnderNodeClick: nodeContextMenuWiring.onExpandAllUnderNodeClick,
    onNodeContextMenuHide: input.onNodeContextMenuHide,
    onNodeRowContextMenu: input.onNodeRowContextMenu,
    onOpenDocumentFromContextMenuClick: input.documentActionHandlers.onOpenDocumentClick,
    onRenameTagFromContextMenuClick: tagDialogsWiring.onRenameTagFromContextMenuClick,
    onSortByItemFromContextMenuClick: input.sortHandlers.onSortByItemClick,
    renameTagCanConfirm: tagDialogsWiring.renameTagCanConfirm,
    renameTagCurrentName: tagDialogsWiring.renameTagCurrentName,
    renameTagDialogOpen: tagDialogsWiring.renameTagDialogOpen,
    renameTagMergeWarning: tagDialogsWiring.renameTagMergeWarning,
    renameTagNameDraft: tagDialogsWiring.renameTagNameDraft
  }
}
