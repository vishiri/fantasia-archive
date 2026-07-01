import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'

type T_treeRef = I_faProjectHierarchyTreeHeTreeInstance | null

export async function openProjectHierarchyTreeNestParentAfterDragDrop (deps: {
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  getTreeRef: () => T_treeRef
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  markNodeOpen: (nodeId: string) => void
  nestParentDocumentId: string
  nextTick: () => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const parentNode = findProjectHierarchyTreeNodeById(
    deps.treeData.value,
    deps.nestParentDocumentId
  )
  if (parentNode === null) {
    return
  }
  await deps.loadChildrenForNode(parentNode)
  await deps.flushDeferredTreeRevisionPublish()
  deps.markNodeOpen(parentNode.id)
  const treeRef = deps.getTreeRef()
  treeRef?.openNodeAndParents(parentNode)
  await deps.nextTick()
}
