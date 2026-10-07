import { ResultAsync } from 'neverthrow'

import type {
  I_faProjectHierarchyTreeDragCommitResult,
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeDocumentSiblingRow } from '../functions/projectHierarchyTreeDnD'

function projectHierarchyTreeUnderTagDragResult (
  committed: boolean
): I_faProjectHierarchyTreeDragCommitResult {
  const emptiedParentDocumentIds: string[] = []
  return {
    committed,
    emptiedParentDocumentIds,
    nestParentDocumentId: null,
    reloadChildrenNodeId: null
  }
}

function readPersistSiblingOrder (
  siblings: I_faProjectHierarchyTreeHeTreeNode[],
  snapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
): string[] {
  if (snapshot !== null) {
    return snapshot.orderedDocumentIds
  }
  return siblings.flatMap((row) => {
    return row.documentId === null ? [] : [row.documentId]
  })
}

export async function persistProjectHierarchyTreeDraggedDocumentUnderTagReorder (input: {
  dragSiblingOrderSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  movedNode: I_faProjectHierarchyTreeHeTreeNode
  parentBucketChildren: I_faProjectHierarchyTreeHeTreeNode[]
  parentNode: I_faProjectHierarchyTreeHeTreeNode | null
  refreshLayout: () => Promise<void>
  resyncTreeDataFromLayout: () => void
}): Promise<I_faProjectHierarchyTreeDragCommitResult | null> {
  const tagId = input.dragSiblingOrderSnapshot?.tagId ?? input.movedNode.tagId
  if (
    typeof tagId !== 'string' ||
    tagId.length === 0 ||
    input.parentNode?.nodeKind !== 'tag'
  ) {
    return null
  }
  const siblings = input.parentBucketChildren.filter((row) => {
    return isProjectHierarchyTreeDocumentSiblingRow(row)
  })
  const orderedDocumentIds = readPersistSiblingOrder(siblings, input.dragSiblingOrderSnapshot)
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.reorderDocumentsUnderTag !== 'function') {
    return projectHierarchyTreeUnderTagDragResult(false)
  }
  const reordered = await ResultAsync.fromPromise(
    api.reorderDocumentsUnderTag({
      orderedDocumentIds,
      tagId
    }),
    (error: unknown) => error
  )
  if (reordered.isErr()) {
    console.error('[ProjectHierarchyTree] reorderDocumentsUnderTag failed', reordered.error)
    input.resyncTreeDataFromLayout()
    await input.refreshLayout()
    return projectHierarchyTreeUnderTagDragResult(false)
  }
  return projectHierarchyTreeUnderTagDragResult(true)
}
