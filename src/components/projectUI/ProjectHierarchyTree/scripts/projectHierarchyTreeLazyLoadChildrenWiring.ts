import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeListPlacementChildrenInput
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { mapHierarchyDocumentChildrenToTreeNodes } from '../functions/mapHierarchyDocumentChildrenToTreeNodes'
import { mergeLoadedChildrenIntoNode } from '../functions/projectHierarchyTreeMergeLoadedChildren'

export async function refreshProjectHierarchyTreeNodeChildrenFromDatabase (deps: {
  listPlacementDocumentChildren: (
    input: I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => Promise<{ items: I_faProjectHierarchyTreeDocumentChild[] }>
  nodeId: string
  publishTreeRevision: (
    nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
    nodeId: string
  ) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const node = findProjectHierarchyTreeNodeById(deps.treeData.value, deps.nodeId)
  if (node === null) {
    return
  }
  node.childrenLoaded = false
  await loadProjectHierarchyTreeNodeChildren({
    listPlacementDocumentChildren: deps.listPlacementDocumentChildren,
    node,
    publishTreeRevision: deps.publishTreeRevision,
    treeData: deps.treeData
  })
}

export async function loadProjectHierarchyTreeNodeChildren (deps: {
  listPlacementDocumentChildren: (
    input: I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => Promise<{ items: I_faProjectHierarchyTreeDocumentChild[] }>
  node: I_faProjectHierarchyTreeHeTreeNode
  publishTreeRevision: (
    nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
    nodeId: string
  ) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  if (!deps.node.hasChildren || deps.node.childrenLoaded) {
    return
  }
  if (deps.node.nodeKind === 'templatePlacement' && deps.node.placementId !== null) {
    const result = await deps.listPlacementDocumentChildren({
      placementId: deps.node.placementId
    })
    const children = mapHierarchyDocumentChildrenToTreeNodes({
      items: result.items,
      placementIcon: deps.node.icon,
      worldColor: deps.node.worldColor,
      worldId: deps.node.worldId
    })
    if (mergeLoadedChildrenIntoNode(deps.treeData.value, deps.node.id, children)) {
      await deps.publishTreeRevision(deps.node.nodeKind, deps.node.id)
    }
    return
  }
  if (
    deps.node.nodeKind === 'document' &&
    deps.node.placementId !== null &&
    deps.node.documentId !== null
  ) {
    const result = await deps.listPlacementDocumentChildren({
      parentDocumentId: deps.node.documentId,
      placementId: deps.node.placementId
    })
    const children = mapHierarchyDocumentChildrenToTreeNodes({
      items: result.items,
      placementIcon: deps.node.icon,
      worldColor: deps.node.worldColor,
      worldId: deps.node.worldId
    })
    if (mergeLoadedChildrenIntoNode(deps.treeData.value, deps.node.id, children)) {
      await deps.publishTreeRevision(deps.node.nodeKind, deps.node.id)
    }
  }
}

function findProjectHierarchyTreeNodeById (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  nodeId: string
): I_faProjectHierarchyTreeHeTreeNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node
    }
    const nested = findProjectHierarchyTreeNodeById(node.children, nodeId)
    if (nested !== null) {
      return nested
    }
  }
  return null
}
