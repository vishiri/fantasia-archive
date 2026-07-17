import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeDragExpandUiFrozen } from '../functions/projectHierarchyTreeDragExpandFreeze'
import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { runProjectHierarchyTreeSessionExpandOpen } from './projectHierarchyTreeSessionExpandOpenWiring'

export function createProjectHierarchyTreeSessionExpandOpenOnNodeOpenHandler (deps: {
  dragExpandUiFrozen: Ref<boolean>
  lazyLoadWiring: {
    commitStagedLoadedChildren?: () => boolean
    flushDeferredTreeRevisionPublish: () => void | Promise<void>
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
  runDeferredLazyLoadBatch: (
    runBatch: () => Promise<void>,
    options?: { skipReapplyHeTreeOpenState?: boolean }
  ) => Promise<void>
  suppressTreeEmit: Ref<boolean>
  openNodeIds: Ref<Set<string>>
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
  const expandOpenInFlight = new Map<string, Promise<void>>()

  function shouldIgnoreExpandPersistMutation (): boolean {
    return isProjectHierarchyTreeDragExpandUiFrozen({
      dragExpandUiFrozen: deps.dragExpandUiFrozen.value
    }) || deps.suppressTreeEmit.value
  }

  return async function onNodeOpen (
    stat: { data: I_faProjectHierarchyTreeHeTreeNode },
    options?: { source: 'heTreeEvent' | 'openIcon', statOpen?: { open: boolean } }
  ): Promise<void> {
    const fromOpenIcon = options?.source === 'openIcon'
    if (
      !fromOpenIcon &&
      (shouldIgnoreExpandPersistMutation() || deps.uiStateWiring.isProgrammaticHeTreeResyncActive())
    ) {
      return
    }
    if (fromOpenIcon) {
      await deps.uiStateWiring.awaitHeTreeResyncIdle()
    }
    const nodeId = stat.data.id
    const existingExpandOpen = expandOpenInFlight.get(nodeId)
    if (existingExpandOpen !== undefined) {
      await existingExpandOpen
      return
    }
    const expandOpenWork = (async () => {
      const expandOpenDeps = {
        flushDeferredTreeRevisionPublish: deps.lazyLoadWiring.flushDeferredTreeRevisionPublish,
        loadChildrenForNode: deps.lazyLoadWiring.loadChildrenForNode,
        markNodeOpen: deps.uiStateWiring.markNodeOpen,
        node: stat.data,
        openNodeIds: deps.openNodeIds,
        reapplyLatentDescendantExpandState: deps.uiStateWiring.reapplyLatentDescendantExpandState,
        resyncHeTreeAfterExpandPublish: deps.uiStateWiring.resyncHeTreeAfterExpandPublish,
        resolveTreeNodeById: (resolvedNodeId: string) =>
          findProjectHierarchyTreeNodeById(deps.treeData.value, resolvedNodeId),
        runDeferredLazyLoadBatch: deps.runDeferredLazyLoadBatch,
        treeData: deps.treeData,
        ...(deps.lazyLoadWiring.commitStagedLoadedChildren === undefined
          ? {}
          : { commitStagedLoadedChildren: deps.lazyLoadWiring.commitStagedLoadedChildren }),
        ...(options?.statOpen === undefined ? {} : { statOpen: options.statOpen }),
        treeRef: deps.treeComponentRef.value
      }
      await runProjectHierarchyTreeSessionExpandOpen(expandOpenDeps)
    })()
    expandOpenInFlight.set(nodeId, expandOpenWork)
    try {
      await expandOpenWork
    } finally {
      expandOpenInFlight.delete(nodeId)
    }
  }
}
