import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { tryOpenHeTreeNodeAndParents } from './projectHierarchyTreeHeTreeOpenSafeWiring'
import { shouldProjectHierarchyTreePreserveDescendantOpenIdsOnCollapse } from '../functions/projectHierarchyTreeExpandState'

export async function runProjectHierarchyTreeSessionExpandOpen (deps: {
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  markNodeOpen: (nodeId: string) => void
  node: I_faProjectHierarchyTreeHeTreeNode
  reapplyLatentDescendantExpandState: () => Promise<void>
  statOpen?: { open: boolean }
  treeRef: I_faProjectHierarchyTreeHeTreeInstance | null
}): Promise<void> {
  deps.markNodeOpen(deps.node.id)
  await deps.loadChildrenForNode(deps.node)
  if (deps.treeRef !== null) {
    const openArgs = deps.statOpen === undefined
      ? {
          node: deps.node,
          treeRef: deps.treeRef
        }
      : {
          node: deps.node,
          statOpen: deps.statOpen,
          treeRef: deps.treeRef
        }
    tryOpenHeTreeNodeAndParents(openArgs)
  }
  if (shouldProjectHierarchyTreePreserveDescendantOpenIdsOnCollapse(deps.node.nodeKind)) {
    await deps.reapplyLatentDescendantExpandState()
  }
}
