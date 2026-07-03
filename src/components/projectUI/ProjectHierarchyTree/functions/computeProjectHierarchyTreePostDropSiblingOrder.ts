/**
 * Computes sibling document order after an in-bucket he-tree drop using drag-start order
 * and he-tree target index (same rules as @he-tree/vue Draggable same-parent move).
 */
export function computeProjectHierarchyTreePostDropSiblingOrder (input: {
  dragStartIndex: number
  dragStartOrderedDocumentIds: string[]
  movedDocumentId: string
  sameParentReorder: boolean
  targetIndexBeforeDrop: number
}): string[] {
  let targetIndex = input.targetIndexBeforeDrop
  if (
    input.sameParentReorder &&
    input.dragStartIndex < targetIndex
  ) {
    targetIndex -= 1
  }
  const withoutMoved = input.dragStartOrderedDocumentIds.filter(
    (documentId) => documentId !== input.movedDocumentId
  )
  const clampedIndex = Math.max(0, Math.min(targetIndex, withoutMoved.length))
  const result = [...withoutMoved]
  result.splice(clampedIndex, 0, input.movedDocumentId)
  return result
}
