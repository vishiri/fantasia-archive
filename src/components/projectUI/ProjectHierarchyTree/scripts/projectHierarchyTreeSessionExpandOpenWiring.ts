import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { tryOpenHeTreeNodeAndParents } from './projectHierarchyTreeHeTreeOpenSafeWiring'
import {
  createProjectHierarchyTreeSessionExpandLoadBatchRunner,
  finishProjectHierarchyTreeDeferredExpandOpen
} from './projectHierarchyTreeSessionExpandOpenFinishWiring'

export async function runProjectHierarchyTreeSessionExpandOpen (deps: {
  commitStagedLoadedChildren?: () => boolean
  flushDeferredTreeRevisionPublish?: () => void | Promise<void>
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  markNodeOpen: (nodeId: string) => void
  node: I_faProjectHierarchyTreeHeTreeNode
  openNodeIds?: Ref<Set<string>>
  reapplyLatentDescendantExpandState: (options?: {
    deferHeTreeOpen?: boolean
  }) => Promise<void>
  resyncHeTreeAfterExpandPublish?: (nodeId: string) => Promise<void>
  resolveTreeNodeById?: (nodeId: string) => I_faProjectHierarchyTreeHeTreeNode | null
  runDeferredLazyLoadBatch?: (
    runBatch: () => Promise<void>,
    options?: { skipReapplyHeTreeOpenState?: boolean }
  ) => Promise<void>
  statOpen?: { open: boolean }
  treeData?: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeRef: I_faProjectHierarchyTreeHeTreeInstance | null
}): Promise<void> {
  deps.markNodeOpen(deps.node.id)
  const useDeferredLazyLoadBatch = deps.runDeferredLazyLoadBatch !== undefined

  function resolveExpandNode (): I_faProjectHierarchyTreeHeTreeNode {
    const resolved = deps.resolveTreeNodeById?.(deps.node.id)
    return resolved ?? deps.node
  }

  const runExpandLoadBatch = createProjectHierarchyTreeSessionExpandLoadBatchRunner({
    loadChildrenForNode: deps.loadChildrenForNode,
    node: deps.node,
    reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
    resolveExpandNode,
    useDeferredLazyLoadBatch,
    ...(deps.commitStagedLoadedChildren === undefined
      ? {}
      : { commitStagedLoadedChildren: deps.commitStagedLoadedChildren }),
    ...(deps.flushDeferredTreeRevisionPublish === undefined
      ? {}
      : { flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish })
  })

  function syncExpandedNodeInHeTree (): void {
    if (deps.treeRef === null) {
      return
    }
    tryOpenHeTreeNodeAndParents({
      node: resolveExpandNode(),
      treeRef: deps.treeRef
    })
  }

  if (useDeferredLazyLoadBatch) {
    await deps.runDeferredLazyLoadBatch!(runExpandLoadBatch, {
      skipReapplyHeTreeOpenState: true
    })
    await finishProjectHierarchyTreeDeferredExpandOpen({
      nodeId: deps.node.id,
      reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
      resolveExpandNode,
      treeRef: deps.treeRef,
      ...(deps.commitStagedLoadedChildren === undefined
        ? {}
        : { commitStagedLoadedChildren: deps.commitStagedLoadedChildren }),
      ...(deps.flushDeferredTreeRevisionPublish === undefined
        ? {}
        : { flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish }),
      ...(deps.openNodeIds === undefined ? {} : { openNodeIds: deps.openNodeIds.value }),
      ...(deps.resyncHeTreeAfterExpandPublish === undefined
        ? {}
        : { resyncHeTreeAfterExpandPublish: deps.resyncHeTreeAfterExpandPublish }),
      ...(deps.statOpen === undefined ? {} : { statOpen: deps.statOpen }),
      ...(deps.treeData === undefined ? {} : { treeData: deps.treeData.value })
    })
    return
  }

  await runExpandLoadBatch()
  syncExpandedNodeInHeTree()
}
