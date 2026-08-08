import type { I_faProjectTagDocumentChild } from 'app/types/I_faProjectTagDomain'
import type {
  T_faProjectHierarchyTreeDocumentSortDirection,
  T_faProjectHierarchyTreeDocumentSortKey
} from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * Local sentinel alias; functions/ cannot value-import from types/.
 * Keep equal to FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY in types/I_faDocumentTreeOrderNumber.
 */
const FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY = Number.MIN_SAFE_INTEGER

function compareDisplayNames (
  left: string,
  right: string,
  direction: T_faProjectHierarchyTreeDocumentSortDirection
): number {
  const compared = left.localeCompare(right, undefined, { sensitivity: 'accent' })
  if (direction === 'asc') {
    return compared
  }
  return -compared
}

function compareIds (left: string, right: string): number {
  return left.localeCompare(right)
}

function isEmptyCustomOrder (value: number | null | undefined): boolean {
  if (value === null || value === undefined) {
    return true
  }
  return value === FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
}

/**
 * Orders documents under a tag for Sort by name or document tree Custom order.
 * customOrder uses each document's treeOrderNumber (not document_tags.sort_order);
 * empty Custom order stays last; result becomes the new under-tag membership order.
 */
export function sortProjectHierarchyTreeTagDocumentChildren (
  items: readonly I_faProjectTagDocumentChild[],
  key: T_faProjectHierarchyTreeDocumentSortKey,
  direction: T_faProjectHierarchyTreeDocumentSortDirection
): I_faProjectTagDocumentChild[] {
  return [...items].sort((left, right) => {
    if (key === 'name') {
      const byName = compareDisplayNames(left.displayName, right.displayName, direction)
      if (byName !== 0) {
        return byName
      }
      return compareIds(left.documentId, right.documentId)
    }
    const leftEmpty = isEmptyCustomOrder(left.treeOrderNumber)
    const rightEmpty = isEmptyCustomOrder(right.treeOrderNumber)
    if (leftEmpty !== rightEmpty) {
      return Number(leftEmpty) - Number(rightEmpty)
    }
    if (!leftEmpty && !rightEmpty && left.treeOrderNumber !== right.treeOrderNumber) {
      if (direction === 'asc') {
        return left.treeOrderNumber - right.treeOrderNumber
      }
      return right.treeOrderNumber - left.treeOrderNumber
    }
    const byName = compareDisplayNames(left.displayName, right.displayName, direction)
    if (byName !== 0) {
      return byName
    }
    return compareIds(left.documentId, right.documentId)
  })
}
