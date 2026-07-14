import { isProjectHierarchyTreeAddNewDocumentNode } from '../functions/projectHierarchyTreeAddNewDocumentNodeKind'
import { createMergeLoadedChildrenIntoNode } from '../functions/projectHierarchyTreeMergeLoadedChildren'

export const mergeLoadedChildrenIntoNode = createMergeLoadedChildrenIntoNode({
  isAddNewDocumentNode: isProjectHierarchyTreeAddNewDocumentNode
})
