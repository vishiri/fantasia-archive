import type { I_faProjectHierarchyTreeDragSiblingOrderSnapshot } from 'app/types/I_faProjectHierarchyTreeDomain'

export function isProjectHierarchyTreeSameBucketSiblingReorder (input: {
  snapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  treeParentDocumentId: string | null
}): boolean {
  if (input.snapshot === null) {
    return false
  }
  return input.snapshot.parentDocumentId === input.treeParentDocumentId
}
