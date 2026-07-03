export function areProjectHierarchyTreeOrderedDocumentIdsEqual (
  left: readonly string[],
  right: readonly string[]
): boolean {
  if (left.length !== right.length) {
    return false
  }
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false
    }
  }
  return true
}
