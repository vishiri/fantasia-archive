/**
 * Reads a non-empty attribute from the Sortable drag item root element.
 */
export function readFaSortableDragItemDataAttribute (
  item: HTMLElement,
  attributeName: string
): string | null {
  const value = item.getAttribute(attributeName)
  if (value === null || value.trim().length === 0) {
    return null
  }
  return value
}
