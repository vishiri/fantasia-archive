import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeDragCommitResult,
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { findProjectHierarchyTreeDocumentNodeByDocumentId } from './projectHierarchyTreeDocumentNodeLookup'

export function resolveProjectHierarchyTreeDragCommitSourceReloadNodeId (input: {
  dragParentDocumentIdAtDragStart: string | null
  dragSiblingOrderSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): string | null {
  if (input.dragSiblingOrderSnapshot === null) {
    return null
  }
  if (input.dragParentDocumentIdAtDragStart === null) {
    return input.dragSiblingOrderSnapshot.placementId
  }
  const parentNode = findProjectHierarchyTreeDocumentNodeByDocumentId(
    input.treeData,
    input.dragParentDocumentIdAtDragStart
  )
  return parentNode?.id ?? input.dragParentDocumentIdAtDragStart
}

export async function refreshProjectHierarchyTreeDragCommitTargetContainer (input: {
  commitResult: I_faProjectHierarchyTreeDragCommitResult
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
}): Promise<void> {
  if (!input.commitResult.committed || input.commitResult.reloadChildrenNodeId === null) {
    return
  }
  await input.refreshNodeChildrenFromDatabase(input.commitResult.reloadChildrenNodeId)
}

export async function refreshProjectHierarchyTreeDragCommitSourceContainer (input: {
  committed: boolean
  dragParentDocumentIdAtDragStart: string | null
  dragSiblingOrderSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  parentChangedFromDragStart: boolean
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  if (!input.committed || !input.parentChangedFromDragStart) {
    return
  }
  const sourceReloadNodeId = resolveProjectHierarchyTreeDragCommitSourceReloadNodeId({
    dragParentDocumentIdAtDragStart: input.dragParentDocumentIdAtDragStart,
    dragSiblingOrderSnapshot: input.dragSiblingOrderSnapshot,
    treeData: input.treeData.value
  })
  if (sourceReloadNodeId === null) {
    return
  }
  await input.refreshNodeChildrenFromDatabase(sourceReloadNodeId)
}
