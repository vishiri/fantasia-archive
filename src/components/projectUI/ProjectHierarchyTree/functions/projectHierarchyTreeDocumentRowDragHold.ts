/**
 * True when dragstart should be blocked until press-and-hold delay completes.
 */
export function shouldBlockDocumentRowDragStartBeforeHoldArmed (input: {
  armed: boolean
  isPointerDownForHold: boolean
}): boolean {
  if (!input.isPointerDownForHold) {
    return false
  }
  return !input.armed
}

/**
 * Resolves the hierarchy tree row wrapper from a pointer/mouse event target.
 */
export function resolveProjectHierarchyTreeNodeRowElement (
  target: EventTarget | null
): HTMLElement | null {
  if (target === null || target === undefined) {
    return null
  }
  let element: Element | null = null
  if (target instanceof Element) {
    element = target
  } else if (target instanceof Node) {
    element = target.parentElement
  }
  if (element === null) {
    return null
  }
  const rowElement = element.closest('.projectHierarchyTree__nodeRow')
  if (rowElement instanceof HTMLElement) {
    return rowElement
  }
  return null
}

/**
 * True when press duration is short enough to count as expand click, not drag hold.
 */
export function isProjectHierarchyTreeDocumentRowClickWithinHoldDelay (input: {
  holdDelayMs: number
  holdDurationMs: number
}): boolean {
  return input.holdDurationMs < input.holdDelayMs
}
