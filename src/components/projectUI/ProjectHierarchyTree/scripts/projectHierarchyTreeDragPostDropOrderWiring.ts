import { dragContext } from '@he-tree/vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { computeProjectHierarchyTreePostDropSiblingOrder } from '../functions/computeProjectHierarchyTreePostDropSiblingOrder'
import { isProjectHierarchyTreeDocumentSiblingRow } from '../functions/projectHierarchyTreeDnD'

type T_heTreeDragStat = {
  children?: T_heTreeDragStat[]
  data: I_faProjectHierarchyTreeHeTreeNode
}

type T_heTreeDragDropInfo = {
  indexBeforeDrop: number
  parent: T_heTreeDragStat | null
  siblings?: T_heTreeDragStat[]
  tree: unknown
}

function readDocumentIdsFromHeTreeDragStats (stats: T_heTreeDragStat[] | undefined): string[] | null {
  if (stats === undefined) {
    return null
  }
  const orderedDocumentIds: string[] = []
  for (const siblingStat of stats) {
    const row = siblingStat.data
    if (!isProjectHierarchyTreeDocumentSiblingRow(row) || row.documentId === null) {
      continue
    }
    orderedDocumentIds.push(row.documentId)
  }
  if (orderedDocumentIds.length === 0) {
    return null
  }
  return orderedDocumentIds
}

type T_projectHierarchyTreeDragDropTargetParentDocumentId =
  | { parentDocumentId: string | null, resolved: true }
  | { resolved: false }

/**
 * Resolves drop-target parent document id from he-tree dragContext when treeData lags modify-mode drops.
 */
export function resolveProjectHierarchyTreeDragDropTargetParentDocumentId (
): T_projectHierarchyTreeDragDropTargetParentDocumentId {
  const targetInfo = dragContext.targetInfo as T_heTreeDragDropInfo | undefined
  if (targetInfo === undefined || targetInfo.parent === null) {
    return { resolved: false }
  }
  const parentData = targetInfo.parent.data
  if (parentData.nodeKind === 'document' && parentData.documentId !== null) {
    return {
      parentDocumentId: parentData.documentId,
      resolved: true
    }
  }
  return {
    parentDocumentId: null,
    resolved: true
  }
}

export function resolveProjectHierarchyTreeDragSiblingOrderSnapshotParentDocumentId (input: {
  treeDataParentDocumentId: string | null
}): string | null {
  const dropTargetParentDocumentId = resolveProjectHierarchyTreeDragDropTargetParentDocumentId()
  if (dropTargetParentDocumentId.resolved) {
    return dropTargetParentDocumentId.parentDocumentId
  }
  return input.treeDataParentDocumentId
}

/**
 * Reads post-drop sibling document ids from he-tree parent stat children (stats order).
 */
export function readProjectHierarchyTreeDragSiblingOrderFromHeTreeParentStats (): string[] | null {
  const targetInfo = dragContext.targetInfo as T_heTreeDragDropInfo | undefined
  if (targetInfo === undefined || targetInfo.parent === null) {
    return null
  }
  return readDocumentIdsFromHeTreeDragStats(targetInfo.parent.children)
}

/**
 * Derives post-drop sibling order from drag-start order and he-tree drop target index.
 */
export function computeProjectHierarchyTreeDragSiblingOrderFromHeTreeDropContext (input: {
  dragStartOrderedDocumentIds: string[] | null
  movedDocumentId: string
}): string[] | null {
  if (input.dragStartOrderedDocumentIds === null || input.dragStartOrderedDocumentIds.length === 0) {
    return null
  }
  const startInfo = dragContext.startInfo as T_heTreeDragDropInfo | undefined
  const targetInfo = dragContext.targetInfo as T_heTreeDragDropInfo | undefined
  if (startInfo === undefined || targetInfo === undefined) {
    return null
  }
  const dragStartIndex = startInfo.indexBeforeDrop
  const targetIndexBeforeDrop = targetInfo.indexBeforeDrop
  if (!Number.isFinite(dragStartIndex) || !Number.isFinite(targetIndexBeforeDrop)) {
    return null
  }
  const sameParentReorder = startInfo.tree === targetInfo.tree &&
    startInfo.parent === targetInfo.parent
  return computeProjectHierarchyTreePostDropSiblingOrder({
    dragStartIndex,
    dragStartOrderedDocumentIds: input.dragStartOrderedDocumentIds,
    movedDocumentId: input.movedDocumentId,
    sameParentReorder,
    targetIndexBeforeDrop
  })
}
