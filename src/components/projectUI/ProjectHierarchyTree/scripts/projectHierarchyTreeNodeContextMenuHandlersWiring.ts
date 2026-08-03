import type { Ref } from 'vue'

import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type {
  I_faProjectHierarchyTreeHeTreeNode,
  T_faProjectHierarchyTreeSortByMenuItemId
} from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  resolveProjectAppControlBarTabCopyBackgroundColorText,
  resolveProjectAppControlBarTabCopyTextColorText
} from 'app/src/components/projectUI/ProjectAppControlBar/functions/projectAppControlBarTabCopyAppearanceColor'
import { resolveProjectAppControlBarTabCopyNameText } from 'app/src/components/projectUI/ProjectAppControlBar/functions/projectAppControlBarTabCopyName'

import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { resolveHierarchyTreeDocumentNodeFromAnchor } from './projectHierarchyTreeDocumentNodeLookup'
import { PROJECT_HIERARCHY_TREE_SORT_BY_MENU_ITEMS } from './projectHierarchyTreeSortByMenuItems'

export function buildProjectHierarchyTreeNodeContextMenuCopyHandlers (input: {
  contextMenuAnchorNodeId: Ref<string | null>
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): {
    onCopyBackgroundColorClick: () => void
    onCopyNameClick: () => void
    onCopyTextColorClick: () => void
  } {
  function onCopyNameClick (): void {
    const anchorNodeId = input.contextMenuAnchorNodeId.value
    if (anchorNodeId === null) {
      return
    }

    const node = resolveHierarchyTreeDocumentNodeFromAnchor(input.treeData.value, anchorNodeId)
    if (node === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyNameText(node.label)
    if (copyText === null) {
      return
    }

    const documentId = node.documentId
    if (documentId === null) {
      return
    }

    input.runFaAction('copyHierarchyTreeDocumentName', { documentId })
  }

  function onCopyTextColorClick (): void {
    const anchorNodeId = input.contextMenuAnchorNodeId.value
    if (anchorNodeId === null) {
      return
    }

    const node = resolveHierarchyTreeDocumentNodeFromAnchor(input.treeData.value, anchorNodeId)
    if (node === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyTextColorText({
      documentTextColorDraft: node.documentTextColor ?? ''
    })
    if (copyText === null) {
      return
    }

    const documentId = node.documentId
    if (documentId === null) {
      return
    }

    input.runFaAction('copyHierarchyTreeDocumentTextColor', { documentId })
  }

  function onCopyBackgroundColorClick (): void {
    const anchorNodeId = input.contextMenuAnchorNodeId.value
    if (anchorNodeId === null) {
      return
    }

    const node = resolveHierarchyTreeDocumentNodeFromAnchor(input.treeData.value, anchorNodeId)
    if (node === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyBackgroundColorText({
      documentBackgroundColorDraft: node.documentBackgroundColor ?? ''
    })
    if (copyText === null) {
      return
    }

    const documentId = node.documentId
    if (documentId === null) {
      return
    }

    input.runFaAction('copyHierarchyTreeDocumentBackgroundColor', { documentId })
  }

  return {
    onCopyBackgroundColorClick,
    onCopyNameClick,
    onCopyTextColorClick
  }
}

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

function resolveSortAnchorNode (
  treeData: I_faProjectHierarchyTreeHeTreeNode[],
  anchorNodeId: string
): I_faProjectHierarchyTreeHeTreeNode | null {
  const node = findProjectHierarchyTreeNodeById(treeData, anchorNodeId)
  if (node === null) {
    return null
  }
  if (node.nodeKind === 'document' && node.documentId !== null && node.placementId !== null) {
    return node
  }
  if (node.nodeKind === 'templatePlacement' && node.placementId !== null) {
    return node
  }
  return null
}

export function buildProjectHierarchyTreeNodeContextMenuSortHandlers (input: {
  contextMenuAnchorNodeId: Ref<string | null>
  isNodeContextMenuOpen: Ref<boolean>
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): {
    onSortByItemClick: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => void
  } {
  function onSortByItemClick (itemId: T_faProjectHierarchyTreeSortByMenuItemId): void {
    const anchorNodeId = input.contextMenuAnchorNodeId.value
    if (anchorNodeId === null) {
      return
    }
    const menuItem = PROJECT_HIERARCHY_TREE_SORT_BY_MENU_ITEMS.find((item) => {
      return item.id === itemId
    })
    if (menuItem === undefined) {
      return
    }
    const node = resolveSortAnchorNode(input.treeData.value, anchorNodeId)
    if (node === null) {
      return
    }
    if (node.nodeKind === 'document') {
      input.runFaAction('sortHierarchyTreeDocuments', {
        direction: menuItem.direction,
        documentId: node.documentId as string,
        key: menuItem.key,
        nodeKind: 'document',
        placementId: node.placementId as string,
        scope: menuItem.scope
      })
    } else {
      input.runFaAction('sortHierarchyTreeDocuments', {
        direction: menuItem.direction,
        documentId: null,
        key: menuItem.key,
        nodeKind: 'templatePlacement',
        placementId: node.placementId as string,
        scope: menuItem.scope
      })
    }
    input.isNodeContextMenuOpen.value = false
  }

  return {
    onSortByItemClick
  }
}
