/**
 * Resolve vertical-tab drag id under a client point (post-Sortable sticky-hover sync).
 * Returns null when the hit target is outside root or lacks the drag id attribute.
 */
export function resolveFaVerticalDraggableTabIdUnderPoint (input: {
  clientX: number
  clientY: number
  dragIdDataAttribute: string
  elementFromPoint: (x: number, y: number) => Element | null
  readDragItemId: (item: HTMLElement, dataAttribute: string) => string | null
  root: Element
  tabSelector: string
}): string | null {
  const hit = input.elementFromPoint(input.clientX, input.clientY)
  if (hit === null || !input.root.contains(hit)) {
    return null
  }
  const tab = hit.closest(input.tabSelector)
  if (tab === null || !input.root.contains(tab)) {
    return null
  }
  return input.readDragItemId(tab as HTMLElement, input.dragIdDataAttribute)
}
