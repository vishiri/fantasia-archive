import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  collectExpandedNodeIdsFromTree,
  findProjectHierarchyTreeNodeById,
  shouldProjectHierarchyTreePreserveDescendantOpenIdsOnCollapse
} from '../functions/projectHierarchyTreeExpandState'
import { tryOpenHeTreeNodeAndParents } from './projectHierarchyTreeHeTreeOpenSafeWiring'

function openExpandedHeTreeNodesAfterExpand (deps: {
  nodeId: string
  openNodeIds?: ReadonlySet<string>
  resolveExpandNode: () => I_faProjectHierarchyTreeHeTreeNode
  statOpen?: { open: boolean }
  treeData?: I_faProjectHierarchyTreeHeTreeNode[]
  treeRef: I_faProjectHierarchyTreeHeTreeInstance
}): void {
  const openNode = deps.resolveExpandNode()
  tryOpenHeTreeNodeAndParents({
    node: openNode,
    ...(deps.statOpen === undefined ? {} : { statOpen: deps.statOpen }),
    treeRef: deps.treeRef
  })
  if (deps.openNodeIds === undefined || deps.treeData === undefined) {
    return
  }
  for (const expandedNodeId of collectExpandedNodeIdsFromTree(deps.treeData, deps.openNodeIds)) {
    if (expandedNodeId === deps.nodeId) {
      continue
    }
    const latentNode = findProjectHierarchyTreeNodeById(deps.treeData, expandedNodeId)
    if (latentNode === null) {
      continue
    }
    tryOpenHeTreeNodeAndParents({
      node: latentNode,
      treeRef: deps.treeRef
    })
  }
}

export async function finishProjectHierarchyTreeDeferredExpandOpen (deps: {
  commitStagedLoadedChildren?: () => boolean
  flushDeferredTreeRevisionPublish?: () => void | Promise<void>
  nodeId: string
  openNodeIds?: ReadonlySet<string>
  reapplyLatentDescendantExpandState?: (options?: {
    deferHeTreeOpen?: boolean
  }) => Promise<void>
  resyncHeTreeAfterExpandPublish?: (nodeId: string) => Promise<void>
  resolveExpandNode: () => I_faProjectHierarchyTreeHeTreeNode
  statOpen?: { open: boolean }
  treeData?: I_faProjectHierarchyTreeHeTreeNode[]
  treeRef: I_faProjectHierarchyTreeHeTreeInstance | null
}): Promise<void> {
  if (deps.reapplyLatentDescendantExpandState !== undefined) {
    const commitStaged = deps.commitStagedLoadedChildren ?? deps.flushDeferredTreeRevisionPublish
    if (commitStaged !== undefined) {
      await commitStaged()
    }
    await deps.reapplyLatentDescendantExpandState({ deferHeTreeOpen: true })
    if (deps.flushDeferredTreeRevisionPublish !== undefined) {
      await deps.flushDeferredTreeRevisionPublish()
    }
  }
  if (deps.resyncHeTreeAfterExpandPublish !== undefined) {
    await deps.resyncHeTreeAfterExpandPublish(deps.nodeId)
  }
  if (deps.treeRef === null) {
    return
  }
  openExpandedHeTreeNodesAfterExpand({
    nodeId: deps.nodeId,
    resolveExpandNode: deps.resolveExpandNode,
    treeRef: deps.treeRef,
    ...(deps.openNodeIds === undefined ? {} : { openNodeIds: deps.openNodeIds }),
    ...(deps.statOpen === undefined ? {} : { statOpen: deps.statOpen }),
    ...(deps.treeData === undefined ? {} : { treeData: deps.treeData })
  })
}

export function createProjectHierarchyTreeSessionExpandLoadBatchRunner (deps: {
  commitStagedLoadedChildren?: () => boolean
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  node: I_faProjectHierarchyTreeHeTreeNode
  reapplyLatentDescendantExpandState: (options?: {
    deferHeTreeOpen?: boolean
  }) => Promise<void>
  resolveExpandNode: () => I_faProjectHierarchyTreeHeTreeNode
  useDeferredLazyLoadBatch: boolean
  flushDeferredTreeRevisionPublish?: () => void | Promise<void>
}) {
  async function runLatentDescendantExpandState (): Promise<void> {
    if (!shouldProjectHierarchyTreePreserveDescendantOpenIdsOnCollapse(deps.node.nodeKind)) {
      return
    }
    const commitStaged = deps.commitStagedLoadedChildren ?? deps.flushDeferredTreeRevisionPublish
    if (commitStaged !== undefined) {
      await commitStaged()
    }
    await deps.reapplyLatentDescendantExpandState({
      deferHeTreeOpen: deps.useDeferredLazyLoadBatch
    })
    if (deps.flushDeferredTreeRevisionPublish !== undefined) {
      await deps.flushDeferredTreeRevisionPublish()
    }
  }

  return async function runExpandLoadBatch (): Promise<void> {
    const expandNode = deps.resolveExpandNode()
    await deps.loadChildrenForNode(expandNode)
    await runLatentDescendantExpandState()
  }
}
