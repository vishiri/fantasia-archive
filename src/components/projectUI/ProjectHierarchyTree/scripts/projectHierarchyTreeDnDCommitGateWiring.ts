import { areProjectHierarchyTreeOrderedDocumentIdsEqual } from '../functions/projectHierarchyTreeOrderedDocumentIdsEqual'

/**
 * Whether drag drop changed parent and/or sibling order vs drag-start snapshot.
 */
export function resolveProjectHierarchyTreeDragCommitGate (input: {
  dragParentDocumentIdAtDragStart: string | null
  dragSiblingOrderSnapshot: {
    orderedDocumentIds: string[]
    parentDocumentId: string | null
  } | null
  dragStartOrder: string[] | null
}): {
    orderChangedFromDragStart: boolean
    parentChangedFromDragStart: boolean
  } {
  const parentChangedFromDragStart = input.dragSiblingOrderSnapshot !== null &&
    input.dragParentDocumentIdAtDragStart !== input.dragSiblingOrderSnapshot.parentDocumentId
  const orderChangedFromDragStart = input.dragSiblingOrderSnapshot !== null &&
    (input.dragStartOrder === null ||
      parentChangedFromDragStart ||
      !areProjectHierarchyTreeOrderedDocumentIdsEqual(
        input.dragSiblingOrderSnapshot.orderedDocumentIds,
        input.dragStartOrder
      ))
  return {
    orderChangedFromDragStart,
    parentChangedFromDragStart
  }
}
