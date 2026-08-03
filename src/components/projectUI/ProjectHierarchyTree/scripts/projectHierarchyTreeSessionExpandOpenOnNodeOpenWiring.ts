import type { Ref } from 'vue'
import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'
import { isProjectHierarchyTreeDragExpandUiFrozen } from '../functions/projectHierarchyTreeDragExpandFreeze'
import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { runWithPreservedProjectHierarchyTreeScrollTop } from './projectHierarchyTreeScrollPreserveWiring'
import { runProjectHierarchyTreeSessionExpandOpen } from './projectHierarchyTreeSessionExpandOpenWiring'

export function createProjectHierarchyTreeSessionExpandOpenOnNodeOpenHandler (deps: {
  dragExpandUiFrozen: Ref<boolean>
  getPersistedScrollTopPx: () => number
  getTreeScrollHost: () => HTMLElement | null
  lazyLoadWiring: {
    commitStagedLoadedChildren?: () => boolean
    flushDeferredTreeRevisionPublish: () => void | Promise<void>
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  requestAnimationFrame: (callback: () => void) => number
  runDeferredLazyLoadBatch: (
    runBatch: () => Promise<void>,
    options?: { skipReapplyHeTreeOpenState?: boolean }
  ) => Promise<void>
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
      await runWithPreservedProjectHierarchyTreeScrollTop({
        getPersistedScrollTopPx: deps.getPersistedScrollTopPx,
        getTreeRef: () => deps.treeComponentRef.value,
        getTreeScrollHost: deps.getTreeScrollHost,
        nextTick: deps.nextTick,
        requestAnimationFrame: deps.requestAnimationFrame,
        run: async () => {
          await runProjectHierarchyTreeSessionExpandOpen({
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
          })
        }
      })
    })()
    expandOpenInFlight.set(nodeId, expandOpenWork)
    try {
      await expandOpenWork
    } finally {
      expandOpenInFlight.delete(nodeId)
    }
  }
}
