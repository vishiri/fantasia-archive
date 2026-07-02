import type {
  I_faProjectHierarchyTreeDragCommitResult,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { resolveProjectHierarchyTreeSiblingSortOrder } from '../functions/projectHierarchyTreeMoveFromTree'
import {
  isProjectHierarchyTreeDocumentDropParentValid,
  isProjectHierarchyTreeDocumentSiblingRow
} from '../functions/projectHierarchyTreeDnD'

type T_parentBucket = {
  children: I_faProjectHierarchyTreeHeTreeNode[]
  parentDocumentId: string | null
  parentNode: I_faProjectHierarchyTreeHeTreeNode | null
}

export function findProjectHierarchyTreeDocumentParentBucket (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string,
  parentContext: {
    parentDocumentId: string | null
    parentNode: I_faProjectHierarchyTreeHeTreeNode | null
  } = {
    parentDocumentId: null,
    parentNode: null
  }
): T_parentBucket | null {
  for (const node of nodes) {
    if (node.nodeKind === 'document' && node.id === documentId) {
      return {
        children: nodes,
        parentDocumentId: parentContext.parentDocumentId,
        parentNode: parentContext.parentNode
      }
    }
    const parentDocumentId = node.nodeKind === 'document' ? node.documentId : null
    const nested = findProjectHierarchyTreeDocumentParentBucket(
      node.children,
      documentId,
      {
        parentDocumentId,
        parentNode: node
      }
    )
    if (nested !== null) {
      return nested
    }
  }
  return null
}

export async function commitProjectHierarchyTreeDraggedDocumentMove (deps: {
  documentId: string | null
  moveDocumentInHierarchy: (input: {
    documentId: string
    targetParentDocumentId: string | null
    targetSortOrder: number
  }) => Promise<unknown>
  refreshLayout: () => Promise<void>
  resyncTreeDataFromLayout: () => void
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): Promise<I_faProjectHierarchyTreeDragCommitResult> {
  const documentId = deps.documentId
  if (documentId === null) {
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null
    }
  }
  const parentBucket = findProjectHierarchyTreeDocumentParentBucket(deps.treeData, documentId)
  if (parentBucket === null) {
    await deps.refreshLayout()
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null
    }
  }
  const siblings = parentBucket.children.filter((row) => isProjectHierarchyTreeDocumentSiblingRow(row))
  const targetSortOrder = resolveProjectHierarchyTreeSiblingSortOrder(siblings, documentId)
  const movedNode = siblings.find((row) => row.id === documentId)
  if (movedNode === undefined || movedNode.placementId === null) {
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null
    }
  }
  const nestParentDocumentId = parentBucket.parentDocumentId
  const dropParentValid = isProjectHierarchyTreeDocumentDropParentValid({
    parentDocumentId: parentBucket.parentDocumentId,
    parentNode: parentBucket.parentNode
  })
  if (!dropParentValid) {
    deps.resyncTreeDataFromLayout()
    await deps.refreshLayout()
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null
    }
  }
  try {
    await deps.moveDocumentInHierarchy({
      documentId,
      targetParentDocumentId: nestParentDocumentId,
      targetSortOrder
    })
    return {
      committed: true,
      emptiedParentDocumentIds: [],
      nestParentDocumentId
    }
  } catch (error) {
    console.error('[ProjectHierarchyTree] moveDocumentInHierarchy failed', error)
    deps.resyncTreeDataFromLayout()
    await deps.refreshLayout()
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null
    }
  }
}
