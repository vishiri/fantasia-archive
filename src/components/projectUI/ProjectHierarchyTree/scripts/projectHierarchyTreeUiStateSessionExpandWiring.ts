import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  markProjectHierarchyTreeNodeClosed,
  markProjectHierarchyTreeNodeOpen,
  reapplyProjectHierarchyTreeHeTreeOpenState
} from './projectHierarchyTreeUiStateWiring'
import { createProjectHierarchyTreeHeTreeResyncController } from './projectHierarchyTreeHeTreeResyncWiring'
import { reapplyProjectHierarchyTreeLatentDescendantExpandState } from './projectHierarchyTreeLatentExpandReapplyWiring'

async function reapplyUiStateSessionLatentDescendantExpandState (
  deps: {
    commitStagedLoadedChildren: () => boolean
    flushDeferredTreeRevisionPublish: () => void | Promise<void>
    getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
    loadChildrenAlongRevealPath: (nodeIds: string[]) => Promise<void>
    openNodeIds: Ref<Set<string>>
    treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  },
  options?: { deferHeTreeOpen?: boolean }
): Promise<void> {
  await reapplyProjectHierarchyTreeLatentDescendantExpandState({
    commitStagedLoadedChildren: deps.commitStagedLoadedChildren,
    getTreeRef: deps.getTreeRef,
    loadChildrenAlongRevealPath: deps.loadChildrenAlongRevealPath,
    openNodeIds: deps.openNodeIds,
    reapplyHeTreeOpenAfterEachPass: options?.deferHeTreeOpen !== true,
    treeData: deps.treeData
  })
}

export function createProjectHierarchyTreeUiStateSessionExpandWiring (deps: {
  commitStagedLoadedChildren: () => boolean
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  loadChildrenAlongRevealPath: (nodeIds: string[]) => Promise<void>
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  requestAnimationFrame: (callback: () => void) => number
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
}) {
  function markNodeOpen (nodeId: string): void {
    markProjectHierarchyTreeNodeOpen({
      nodeId,
      openNodeIds: deps.openNodeIds,
      queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
      treeData: deps.treeData
    })
  }

  function reapplyHeTreeOpenState (): void {
    reapplyProjectHierarchyTreeHeTreeOpenState({
      getTreeRef: deps.getTreeRef,
      openNodeIds: deps.openNodeIds,
      treeData: deps.treeData
    })
  }

  const heTreeResyncController = createProjectHierarchyTreeHeTreeResyncController({
    nextTick: deps.nextTick,
    reapplyHeTreeOpenState,
    requestAnimationFrame: deps.requestAnimationFrame,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeMountKey: deps.treeMountKey
  })

  async function resyncHeTreeAfterExpandPublish (_nodeId: string): Promise<void> {
    await heTreeResyncController.resyncHeTreeFromPublishedTreeData()
  }

  function markNodeClosed (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode): void {
    markProjectHierarchyTreeNodeClosed({
      node,
      nodeId,
      openNodeIds: deps.openNodeIds,
      queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
      treeData: deps.treeData
    })
  }

  async function reapplyLatentDescendantExpandState (options?: {
    deferHeTreeOpen?: boolean
  }): Promise<void> {
    await reapplyUiStateSessionLatentDescendantExpandState(deps, options)
  }

  const awaitHeTreeResyncIdle = heTreeResyncController.awaitHeTreeResyncIdle
  const isProgrammaticHeTreeResyncActive = heTreeResyncController.isProgrammaticHeTreeResyncActive

  return {
    awaitHeTreeResyncIdle,
    isProgrammaticHeTreeResyncActive,
    markNodeClosed,
    markNodeOpen,
    reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState,
    resyncHeTreeAfterExpandPublish
  }
}
