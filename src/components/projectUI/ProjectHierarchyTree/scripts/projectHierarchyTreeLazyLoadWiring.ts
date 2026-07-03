import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { loadProjectHierarchyTreeNodeChildren, refreshProjectHierarchyTreeNodeChildrenFromDatabase } from './projectHierarchyTreeLazyLoadChildrenWiring'
import { publishProjectHierarchyTreeLazyLoadRevision } from './projectHierarchyTreeLazyLoadPublishWiring'

export function createProjectHierarchyTreeLazyLoadWiring (deps: {
  listPlacementDocumentChildren: (
    input: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeListPlacementChildrenInput
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
    await loadProjectHierarchyTreeNodeChildren({
      listPlacementDocumentChildren: deps.listPlacementDocumentChildren,
      node,
      publishTreeRevision,
      treeData: deps.treeData
    })
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
    loadChildrenForNode,
    refreshNodeChildrenFromDatabase: (
      nodeId: string
    ) => refreshProjectHierarchyTreeNodeChildrenFromDatabase({
      listPlacementDocumentChildren: deps.listPlacementDocumentChildren,
      nodeId,
      publishTreeRevision,
      treeData: deps.treeData
    })
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
