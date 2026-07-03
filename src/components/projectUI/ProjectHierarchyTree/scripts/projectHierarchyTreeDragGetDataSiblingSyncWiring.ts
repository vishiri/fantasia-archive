import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { applyProjectHierarchyTreeSiblingOrderToTreeData } from './projectHierarchyTreeSiblingOrderPatchWiring'
import { resolveProjectHierarchyTreeDragSiblingOrderSnapshot } from './projectHierarchyTreeDragSiblingOrderSnapshotWiring'
import { readProjectHierarchyTreeHeTreeLiveData } from './projectHierarchyTreeHeTreeLiveDataWiring'

/**
 * Copies post-drop sibling order from he-tree getData (stats order) into treeData in place.
 */
export function syncProjectHierarchyTreeSiblingOrderFromHeTreeGetData (input: {
  draggedDocumentId: string | null
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): {
    orderedDocumentIds: string[] | null
    patched: boolean
  } {
  if (input.draggedDocumentId === null) {
    return {
      orderedDocumentIds: null,
      patched: false
    }
  }
  const liveData = readProjectHierarchyTreeHeTreeLiveData(input.getTreeRef())
  if (liveData === null) {
    return {
      orderedDocumentIds: null,
      patched: false
    }
  }
  const getDataSnapshot = resolveProjectHierarchyTreeDragSiblingOrderSnapshot(
    liveData,
    input.draggedDocumentId
  )
  if (getDataSnapshot === null) {
    return {
      orderedDocumentIds: null,
      patched: false
    }
  }
  const patched = applyProjectHierarchyTreeSiblingOrderToTreeData(
    input.treeData,
    input.draggedDocumentId,
    getDataSnapshot.orderedDocumentIds
  )
  return {
    orderedDocumentIds: getDataSnapshot.orderedDocumentIds,
    patched
  }
}
