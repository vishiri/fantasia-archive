import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeListPlacementChildrenInput
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { mapHierarchyDocumentChildrenToTreeNodes } from '../functions/mapWorkspaceLayoutToHierarchyTreeSkeleton'
import { mergeLoadedChildrenIntoNode } from '../functions/projectHierarchyTreeMergeLoadedChildren'
import { publishProjectHierarchyTreeLazyLoadRevision } from './projectHierarchyTreeLazyLoadPublishWiring'

export function createProjectHierarchyTreeLazyLoadWiring (deps: {
  listPlacementDocumentChildren: (
    input: I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => Promise<{ items: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDocumentChild[] }>
  nextTick: () => Promise<void>
  onAfterTreeRevisionPublished: () => void | Promise<void>
  shouldDeferTreeRevisionPublish: () => boolean
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  let deferredTreeRevisionPublishPending = false

  const publishDeps = {
    nextTick: deps.nextTick,
    onAfterTreeRevisionPublished: deps.onAfterTreeRevisionPublished,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  }

  async function publishTreeRevision (
    nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
    nodeId: string
  ): Promise<void> {
    if (deps.shouldDeferTreeRevisionPublish()) {
      deferredTreeRevisionPublishPending = true
      return
    }
    deferredTreeRevisionPublishPending = false
    await publishProjectHierarchyTreeLazyLoadRevision(publishDeps, nodeKind, nodeId)
  }

  async function flushDeferredTreeRevisionPublish (): Promise<void> {
    if (!deferredTreeRevisionPublishPending) {
      return
    }
    deferredTreeRevisionPublishPending = false
    await publishProjectHierarchyTreeLazyLoadRevision(publishDeps, 'document', 'deferred-publish')
  }

  async function loadChildrenForNode (
    node: I_faProjectHierarchyTreeHeTreeNode
  ): Promise<void> {
    if (!node.hasChildren || node.childrenLoaded) {
      return
    }
    if (node.nodeKind === 'templatePlacement' && node.placementId !== null) {
      const result = await deps.listPlacementDocumentChildren({
        placementId: node.placementId
      })
      const children = mapHierarchyDocumentChildrenToTreeNodes({
        items: result.items,
        placementIcon: node.icon,
        worldColor: node.worldColor,
        worldId: node.worldId
      })
      if (mergeLoadedChildrenIntoNode(deps.treeData.value, node.id, children)) {
        await publishTreeRevision(node.nodeKind, node.id)
      }
      return
    }
    if (
      node.nodeKind === 'document' &&
      node.placementId !== null &&
      node.documentId !== null
    ) {
      const result = await deps.listPlacementDocumentChildren({
        parentDocumentId: node.documentId,
        placementId: node.placementId
      })
      const children = mapHierarchyDocumentChildrenToTreeNodes({
        items: result.items,
        placementIcon: node.icon,
        worldColor: node.worldColor,
        worldId: node.worldId
      })
      if (mergeLoadedChildrenIntoNode(deps.treeData.value, node.id, children)) {
        await publishTreeRevision(node.nodeKind, node.id)
      }
    }
  }

  async function loadChildrenAlongRevealPath (nodeIds: string[]): Promise<void> {
    for (const nodeId of nodeIds) {
      const node = findNode(deps.treeData.value, nodeId)
      if (node === null) {
        continue
      }
      await loadChildrenForNode(node)
    }
  }

  return {
    flushDeferredTreeRevisionPublish,
    loadChildrenAlongRevealPath,
    loadChildrenForNode
  }
}

function findNode (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  nodeId: string
): I_faProjectHierarchyTreeHeTreeNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node
    }
    const nested = findNode(node.children, nodeId)
    if (nested !== null) {
      return nested
    }
  }
  return null
}
