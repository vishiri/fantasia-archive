type T_projectHierarchyTreeDocumentRowPointerSample = {
  clientX: number
  clientY: number
}

export function sampleProjectHierarchyTreeDocumentRowPointer (event: {
  clientX: number
  clientY: number
}): T_projectHierarchyTreeDocumentRowPointerSample {
  const clientX = event.clientX
  const clientY = event.clientY
  return {
    clientX,
    clientY
  }
}

/**
 * True when pointer release is close enough to press to count as click, not drag.
 */
export function isProjectHierarchyTreeDocumentRowClickWithinDragTolerance (input: {
  clickClientX: number
  clickClientY: number
  pointerDownSample: T_projectHierarchyTreeDocumentRowPointerSample | null
  tolerancePx: number
}): boolean {
  if (input.pointerDownSample === null) {
    return false
  }
  const deltaX = input.clickClientX - input.pointerDownSample.clientX
  const deltaY = input.clickClientY - input.pointerDownSample.clientY
  const tolerancePx = input.tolerancePx
  const distanceSquared = deltaX * deltaX + deltaY * deltaY
  return distanceSquared <= tolerancePx * tolerancePx
}

export function shouldProjectHierarchyTreeDocumentRowClickToggleExpand (input: {
  clickClientX: number
  clickClientY: number
  dragStartedForGesture: boolean
  holdDelayMs: number
  holdDurationMs: number
  isTreeDragActive: boolean
  pointerDownSample: T_projectHierarchyTreeDocumentRowPointerSample | null
  tolerancePx: number
}): boolean {
  if (input.isTreeDragActive || input.dragStartedForGesture) {
    return false
  }
  if (input.holdDurationMs >= input.holdDelayMs) {
    return false
  }
  return isProjectHierarchyTreeDocumentRowClickWithinDragTolerance({
    clickClientX: input.clickClientX,
    clickClientY: input.clickClientY,
    pointerDownSample: input.pointerDownSample,
    tolerancePx: input.tolerancePx
  })
}
