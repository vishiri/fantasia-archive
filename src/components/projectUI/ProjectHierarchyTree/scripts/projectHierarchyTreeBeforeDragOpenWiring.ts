import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { logProjectHierarchyTreeDebugSession } from './projectHierarchyTreeDebugSessionLogWiring'

export function createProjectHierarchyTreeBeforeDragOpenWiring (deps: {
  lazyLoadWiring: {
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
}) {
  async function onBeforeDragOpen (
    stat: { data: I_faProjectHierarchyTreeHeTreeNode }
  ): Promise<void> {
    const node = stat.data
    if (node.nodeKind !== 'document' && node.nodeKind !== 'templatePlacement') {
      return
    }
    // #region agent log
    logProjectHierarchyTreeDebugSession({
      data: {
        hasChildren: node.hasChildren,
        nodeId: node.id,
        nodeKind: node.nodeKind
      },
      hypothesisId: 'N1',
      location: 'projectHierarchyTreeBeforeDragOpenWiring.ts:onBeforeDragOpen',
      message: 'drag-open nest target',
      runId: 'nest-drop'
    })
    // #endregion
    await deps.lazyLoadWiring.loadChildrenForNode(node)
  }

  return {
    onBeforeDragOpen
  }
}
