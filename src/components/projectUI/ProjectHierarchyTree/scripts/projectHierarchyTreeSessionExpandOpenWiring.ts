import type { Ref } from 'vue'
import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import { tryOpenHeTreeNodeAndParents } from './projectHierarchyTreeHeTreeHelpersWiring'
import {
  createProjectHierarchyTreeSessionExpandLoadBatchRunner,
  finishProjectHierarchyTreeDeferredExpandOpen
} from './projectHierarchyTreeExpandSnapshotWiring'
import { isProjectHierarchyTreeDragExpandUiFrozen } from '../functions/projectHierarchyTreeDragExpandFreeze'
import { handleProjectHierarchyTreeOpenIconClick } from './projectHierarchyTreeHeTreeHelpersWiring'
import { createProjectHierarchyTreeSessionExpandOpenOnNodeOpenHandler } from './projectHierarchyTreeSessionExpandOpenOnNodeOpenWiring'

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

export function createProjectHierarchyTreeSessionExpandOpenHandlersWiring (deps: {
  dragExpandUiFrozen: Ref<boolean>
  getPersistedScrollTopPx: () => number
  getTreeScrollHost: () => HTMLElement | null
  lazyLoadWiring: {
    commitStagedLoadedChildren?: () => boolean
    flushDeferredTreeRevisionPublish: () => void | Promise<void>
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
  onNodeClose: (
    stat: { data: I_faProjectHierarchyTreeHeTreeNode },
    options?: { source: 'heTreeEvent' | 'openIcon' }
  ) => void
  openIconExpandAnimationWiring: {
    scheduleOpenIconExpandAnimation: (nodeId: string) => void
  }
  runDeferredLazyLoadBatch: (
    runBatch: () => Promise<void>,
    options?: { skipReapplyHeTreeOpenState?: boolean }
  ) => Promise<void>
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  requestAnimationFrame: (callback: () => void) => number
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  uiStateWiring: {
    awaitHeTreeResyncIdle: () => Promise<void>
    isProgrammaticHeTreeResyncActive: () => boolean
    markNodeOpen: (nodeId: string) => void
    reapplyLatentDescendantExpandState: (options?: {
      deferHeTreeOpen?: boolean
    }) => Promise<void>
    resyncHeTreeAfterExpandPublish: (nodeId: string) => Promise<void>
  }
}) {
  let openIconPointerWasOpen: boolean | null = null
  const onNodeOpen = createProjectHierarchyTreeSessionExpandOpenOnNodeOpenHandler(deps)

  function onNodeOpenIconPointerDown (stat: { open: boolean }): void {
    openIconPointerWasOpen = stat.open
  }

  async function onNodeOpenIconClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { children: unknown[], open: boolean }
  ): Promise<void> {
    if (isProjectHierarchyTreeDragExpandUiFrozen({
      dragExpandUiFrozen: deps.dragExpandUiFrozen.value
    })) {
      return
    }
    await handleProjectHierarchyTreeOpenIconClick({
      awaitHeTreeResyncIdle: deps.uiStateWiring.awaitHeTreeResyncIdle,
      getOpenIconPointerWasOpen: () => openIconPointerWasOpen,
      node,
      onNodeClose: deps.onNodeClose,
      onNodeOpen,
      scheduleOpenIconExpandAnimation: deps.openIconExpandAnimationWiring.scheduleOpenIconExpandAnimation,
      setOpenIconPointerWasOpen: (value) => {
        openIconPointerWasOpen = value
      },
      stat
    })
  }

  return {
    onNodeOpen,
    onNodeOpenIconClick,
    onNodeOpenIconPointerDown
  }
}
