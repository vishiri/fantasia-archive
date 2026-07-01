import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

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
    await deps.lazyLoadWiring.loadChildrenForNode(node)
  }

  return {
    onBeforeDragOpen
  }
}
