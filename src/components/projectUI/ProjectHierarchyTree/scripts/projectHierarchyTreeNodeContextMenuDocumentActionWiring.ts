import type { Ref } from 'vue'

import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { resolveHierarchyTreeDocumentNodeFromAnchor } from './projectHierarchyTreeDocumentNodeLookup'

function resolveDocumentIdFromAnchor (
  treeData: I_faProjectHierarchyTreeHeTreeNode[],
  anchorNodeId: string
): string | null {
  const node = resolveHierarchyTreeDocumentNodeFromAnchor(treeData, anchorNodeId)
  if (node === null || node.documentId === null) {
    return null
  }

  return node.documentId
}

export function buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers (input: {
  contextMenuAnchorNodeId: Ref<string | null>
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): {
    onAddNewDocumentUnderThisClick: () => void
    onCopyDocumentClick: () => void
    onDeleteDocumentClick: () => void
    onEditDocumentClick: () => void
    onOpenDocumentClick: () => void
  } {
  function dispatchDocumentAction (
    actionId:
      | 'openHierarchyTreeDocument'
      | 'editHierarchyTreeDocument'
      | 'copyHierarchyTreeDocument'
      | 'addHierarchyTreeChildDocument'
      | 'deleteHierarchyTreeDocument'
  ): void {
    const anchorNodeId = input.contextMenuAnchorNodeId.value
    if (anchorNodeId === null) {
      return
    }

    const documentId = resolveDocumentIdFromAnchor(input.treeData.value, anchorNodeId)
    if (documentId === null) {
      return
    }

    input.runFaAction(actionId, { documentId })
  }

  function onOpenDocumentClick (): void {
    dispatchDocumentAction('openHierarchyTreeDocument')
  }

  function onEditDocumentClick (): void {
    dispatchDocumentAction('editHierarchyTreeDocument')
  }

  function onCopyDocumentClick (): void {
    dispatchDocumentAction('copyHierarchyTreeDocument')
  }

  function onAddNewDocumentUnderThisClick (): void {
    dispatchDocumentAction('addHierarchyTreeChildDocument')
  }

  function onDeleteDocumentClick (): void {
    dispatchDocumentAction('deleteHierarchyTreeDocument')
  }

  return {
    onAddNewDocumentUnderThisClick,
    onCopyDocumentClick,
    onDeleteDocumentClick,
    onEditDocumentClick,
    onOpenDocumentClick
  }
}
