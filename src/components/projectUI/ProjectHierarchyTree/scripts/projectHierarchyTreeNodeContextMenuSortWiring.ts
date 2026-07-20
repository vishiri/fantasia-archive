import type { Ref } from 'vue'

import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type {
  I_faProjectHierarchyTreeHeTreeNode,
  T_faProjectHierarchyTreeSortByMenuItemId
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { PROJECT_HIERARCHY_TREE_SORT_BY_MENU_ITEMS } from './projectHierarchyTreeSortByMenuItems'

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
