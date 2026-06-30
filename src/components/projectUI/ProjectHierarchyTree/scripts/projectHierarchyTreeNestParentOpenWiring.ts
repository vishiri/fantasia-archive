import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { logProjectHierarchyTreeDebugSession } from './projectHierarchyTreeDebugSessionLogWiring'

type T_treeRef = I_faProjectHierarchyTreeHeTreeInstance | null

export async function openProjectHierarchyTreeNestParentAfterDragDrop (deps: {
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
  deps.markNodeOpen(parentNode.id)
  const treeRef = deps.getTreeRef()
  treeRef?.openNodeAndParents(parentNode)
  await deps.nextTick()
  // #region agent log
  logProjectHierarchyTreeDebugSession({
    data: {
      nestParentDocumentId: deps.nestParentDocumentId,
      parentNodeId: parentNode.id,
      treeRefPresent: treeRef !== null
    },
    hypothesisId: 'O1',
    location: 'projectHierarchyTreeNestParentOpenWiring.ts:openProjectHierarchyTreeNestParentAfterDragDrop',
    message: 'opened nest parent after drag drop',
    runId: 'nest-parent-open'
  })
  // #endregion
}
