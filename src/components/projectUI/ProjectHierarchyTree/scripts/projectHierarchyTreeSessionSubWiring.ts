import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeDnDWiring } from './projectHierarchyTreeDnDWiring'
import { createProjectHierarchyTreeBeforeDragOpenWiring } from './projectHierarchyTreeBeforeDragOpenWiring'
import { createProjectHierarchyTreeLazyLoadSessionWiring } from './projectHierarchyTreeLazyLoadSessionWiring'
import { createProjectHierarchyTreeSyncWiring } from './projectHierarchyTreeSyncWiring'

type T_hierarchyStore = {
  flushUiStatePersist: () => void
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  queuePersistScrollTopPx: (scrollTopPx: number) => void
  refreshLayout: () => Promise<void>
}

export function createProjectHierarchyTreeSessionSubWiring (deps: {
  computed: <T>(getter: () => T) => { value: T }
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  hierarchyStore: T_hierarchyStore
  isTreeDragActive: Ref<boolean>
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  pendingRevealPath: Ref<string[]>
  ref: <T>(initial: T) => Ref<T>
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
  treeScrollHostRef: Ref<HTMLElement | null>
  uiState: Ref<I_faProjectHierarchyTreeUiState>
  worlds: Ref<I_faProjectHierarchyTreeWorkspaceWorld[]>
}) {
  const syncWiring = createProjectHierarchyTreeSyncWiring({
    getWorlds: () => deps.worlds.value,
    nextTick: deps.nextTick,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })

  const loadSessionWiring = createProjectHierarchyTreeLazyLoadSessionWiring({
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    flushUiStatePersist: () => deps.hierarchyStore.flushUiStatePersist(),
    getExpandedNodeIds: () => deps.uiState.value.expandedNodeIds,
    getPendingRevealPath: () => deps.pendingRevealPath.value,
    getScrollTopPx: () => deps.uiState.value.scrollTopPx,
    getTreeRef: () => deps.treeComponentRef.value,
    getTreeScrollHost: () => deps.treeScrollHostRef.value,
    getWorlds: () => deps.worlds.value,
    hierarchyStore: deps.hierarchyStore,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    pendingRevealPath: deps.pendingRevealPath,
    requestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })
  const lazyLoadWiring = loadSessionWiring.lazyLoadWiring
  const uiStateWiring = loadSessionWiring.uiStateWiring

  const beforeDragOpenWiring = createProjectHierarchyTreeBeforeDragOpenWiring({
    lazyLoadWiring
  })

  const dndWiring = createProjectHierarchyTreeDnDWiring({
    bumpTreeMountKey: () => {
      deps.treeMountKey.value += 1
    },
    dragCommitPending: deps.dragCommitPending,
    dragCommitScheduled: deps.dragCommitScheduled,
    dragDropCommitted: deps.dragDropCommitted,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    getTreeRef: () => deps.treeComponentRef.value,
    isTreeDragActive: deps.isTreeDragActive,
    getTreeScrollHost: () => deps.treeScrollHostRef.value,
    loadChildrenForNode: lazyLoadWiring.loadChildrenForNode,
    markNodeClosed: uiStateWiring.markNodeClosed,
    markNodeOpen: uiStateWiring.markNodeOpen,
    moveDocumentInHierarchy: async (input) => {
      const api = window.faContentBridgeAPIs?.projectContent
      if (typeof api?.moveDocumentInHierarchy !== 'function') {
        throw new Error('moveDocumentInHierarchy unavailable')
      }
      return await api.moveDocumentInHierarchy(input)
    },
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: (expandedNodeIds) => {
      deps.hierarchyStore.queuePersistExpandedNodeIds(expandedNodeIds)
    },
    refreshLayout: () => deps.hierarchyStore.refreshLayout(),
    resyncTreeDataFromLayout: syncWiring.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: uiStateWiring.restoreExpandedSnapshot,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })

  const treeRootClassList = deps.computed(() => {
    return {
      'projectHierarchyTree--listDragging': deps.isTreeDragActive.value
    }
  })

  const treeStyle = deps.computed(() => {
    return {
      height: '100%'
    }
  })

  return {
    beforeDragOpenWiring,
    dndWiring,
    lazyLoadWiring,
    syncWiring,
    treeRootClassList,
    treeStyle,
    uiStateWiring
  }
}
