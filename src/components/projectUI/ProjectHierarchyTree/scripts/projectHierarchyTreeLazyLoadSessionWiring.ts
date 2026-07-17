import type { Ref, watch as WatchFn } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { runProjectHierarchyTreeDeferredLazyLoadBatch } from './projectHierarchyTreeDeferredLazyLoadBatchWiring'
import { createProjectHierarchyTreeLazyLoadWiring } from './projectHierarchyTreeLazyLoadWiring'
import { createProjectHierarchyTreeUiStateSessionWiring } from './projectHierarchyTreeUiStateSessionWiring'

type T_hierarchyStore = {
  flushUiStatePersist: () => void
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  queuePersistScrollTopPx: (scrollTopPx: number) => void
}

async function listProjectHierarchyTreePlacementDocumentChildren (
  input: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeListPlacementChildrenInput
) {
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listPlacementDocumentChildren !== 'function') {
    return { items: [] }
  }
  return await api.listPlacementDocumentChildren(input)
}

export function createProjectHierarchyTreeLazyLoadSessionWiring (deps: {
  deferLazyLoadTreeRevisionPublish: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  flushUiStatePersist: () => void
  getExpandedNodeIds: () => string[]
  getPendingRevealPath: () => string[]
  getPreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  getScrollTopPx: () => number
  getTreeRef: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  getWorlds: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeWorkspaceWorld[]
  hierarchyStore: T_hierarchyStore
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  pendingRevealPath: Ref<string[]>
  requestAnimationFrame: (callback: () => void) => number
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
  watch: typeof WatchFn
}) {
  const treeRevisionPublishHooks: {
    reapplyHeTreeOpenState: (() => void) | null
  } = {
    reapplyHeTreeOpenState: null
  }

  const lazyLoadWiring = createProjectHierarchyTreeLazyLoadWiring({
    deferLazyLoadTreeRevisionPublish: deps.deferLazyLoadTreeRevisionPublish,
    getPreferredLanguageCode: deps.getPreferredLanguageCode,
    listPlacementDocumentChildren: listProjectHierarchyTreePlacementDocumentChildren,
    nextTick: deps.nextTick,
    onAfterTreeRevisionPublished: () => {
      if (deps.deferLazyLoadTreeRevisionPublish.value) {
        return
      }
      treeRevisionPublishHooks.reapplyHeTreeOpenState?.()
    },
    shouldDeferTreeRevisionPublish: () => {
      return deps.dragExpandUiFrozen.value || deps.deferLazyLoadTreeRevisionPublish.value
    },
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })

  const uiStateWiringHolder: {
    wiring: ReturnType<typeof createProjectHierarchyTreeUiStateSessionWiring> | null
  } = {
    wiring: null
  }

  async function runDeferredLazyLoadBatch (
    runBatch: () => Promise<void>,
    options?: { skipReapplyHeTreeOpenState?: boolean }
  ): Promise<void> {
    await runProjectHierarchyTreeDeferredLazyLoadBatch({
      deferLazyLoadTreeRevisionPublish: deps.deferLazyLoadTreeRevisionPublish,
      flushDeferredTreeRevisionPublish: () => lazyLoadWiring.flushDeferredTreeRevisionPublish(),
      nextTick: deps.nextTick,
      reapplyHeTreeOpenState: () => uiStateWiringHolder.wiring!.reapplyHeTreeOpenState(),
      runBatch,
      ...(options?.skipReapplyHeTreeOpenState === true
        ? { skipReapplyHeTreeOpenState: true }
        : {})
    })
  }

  const uiStateWiring = createProjectHierarchyTreeUiStateSessionWiring({
    commitStagedLoadedChildren: () => lazyLoadWiring.commitStagedLoadedChildren(),
    flushDeferredTreeRevisionPublish: () => lazyLoadWiring.flushDeferredTreeRevisionPublish(),
    flushUiStatePersist: deps.flushUiStatePersist,
    getExpandedNodeIds: deps.getExpandedNodeIds,
    getPendingRevealPath: deps.getPendingRevealPath,
    getScrollTopPx: deps.getScrollTopPx,
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    getWorlds: deps.getWorlds,
    loadChildrenAlongRevealPath: lazyLoadWiring.loadChildrenAlongRevealPath,
    loadChildrenForNode: lazyLoadWiring.loadChildrenForNode,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.hierarchyStore.queuePersistExpandedNodeIds,
    queuePersistScrollTopPx: deps.hierarchyStore.queuePersistScrollTopPx,
    requestAnimationFrame: deps.requestAnimationFrame,
    runDeferredLazyLoadBatch,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData,
    treeMountKey: deps.treeMountKey,
    watch: deps.watch
  })
  uiStateWiringHolder.wiring = uiStateWiring
  treeRevisionPublishHooks.reapplyHeTreeOpenState = () => {
    uiStateWiring.reapplyHeTreeOpenState()
  }

  return {
    lazyLoadWiring,
    runDeferredLazyLoadBatch,
    uiStateWiring
  }
}
