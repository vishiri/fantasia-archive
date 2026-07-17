import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeSessionHandlersBindWiring } from './projectHierarchyTreeSessionHandlersBindWiring'
import { bindProjectHierarchyTreeSessionHydrateLifecycle } from './projectHierarchyTreeSessionLifecycleBindWiring'
import { buildProjectHierarchyTreeSessionApi } from './projectHierarchyTreeSessionApiWiring'
import { createProjectHierarchyTreeSessionEarlyWiring } from './projectHierarchyTreeSessionEarlyWiring'
import { bindProjectHierarchyTreeSessionPendingRefreshFromEarlyWiring } from './projectHierarchyTreePendingDocumentRefreshWiring'
import { bindProjectHierarchyTreeAddNewDocumentLanguageRefresh } from './projectHierarchyTreeAddNewDocumentLanguageRefreshWiring'

type T_hierarchyStore = {
  clearPendingDocumentRefreshIds: () => void
  clearPendingHierarchyNodeRefreshIds: () => void
  clearPendingRevealPath: () => void
  flushUiStatePersist: () => void
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  queuePersistScrollTopPx: (scrollTopPx: number) => void
  refreshLayout: () => Promise<void>
  refreshUiState: () => Promise<void>
  resetOnProjectClose: () => void
}

export function createProjectHierarchyTreeSessionWiring (deps: {
  S_FaActiveProject: () => {
    activeProject: { id: string } | null
    hasActiveProject: boolean
  }
  computed: <T>(getter: () => T) => { value: T }
  createTemporaryDocument: (input: {
    displayName: string
    openMode: import('app/types/I_faOpenedDocumentsDomain').T_faOpenedDocumentOpenMode
    parentDocumentId: null
    templateId: string
    worldId: string
  }) => Promise<string>
  dragContext: {
    dragNode: {
      data: I_faProjectHierarchyTreeHeTreeNode
    } | null
  }
  hierarchyStore: T_hierarchyStore
  nextTick: () => Promise<void>
  onDocumentOpenRequest: (
    documentId: string,
    mode: import('app/types/I_faOpenedDocumentsDomain').T_faOpenedDocumentOpenMode,
    treeMeta: import('app/types/I_faOpenedDocumentsDomain').I_faOpenedDocumentTreeOpenMeta
  ) => void
  onMounted: (hook: () => void) => void
  onUnmounted: (hook: () => void) => void
  pendingDocumentRefreshIds: Ref<string[]>
  pendingHierarchyNodeRefreshIds: Ref<string[]>
  pendingRevealPath: Ref<string[]>
  ref: <T>(initial: T) => Ref<T>
  resolvePreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  uiState: Ref<I_faProjectHierarchyTreeUiState>
  watch: typeof watchFn
  worlds: Ref<I_faProjectHierarchyTreeWorkspaceWorld[]>
  layoutRefreshGeneration: Ref<number>
}) {
  const earlyWiring = createProjectHierarchyTreeSessionEarlyWiring({
    computed: deps.computed,
    dragContext: deps.dragContext,
    getPreferredLanguageCode: deps.resolvePreferredLanguageCode,
    hierarchyStore: deps.hierarchyStore,
    nextTick: deps.nextTick,
    onUnmounted: deps.onUnmounted,
    pendingRevealPath: deps.pendingRevealPath,
    ref: deps.ref,
    treeData: deps.treeData,
    uiState: deps.uiState,
    watch: deps.watch,
    worlds: deps.worlds
  })

  bindProjectHierarchyTreeSessionHydrateLifecycle({
    S_FaActiveProject: deps.S_FaActiveProject,
    earlyWiring,
    hierarchyStore: deps.hierarchyStore,
    onMounted: deps.onMounted,
    onUnmounted: deps.onUnmounted,
    pendingRevealPath: deps.pendingRevealPath,
    layoutRefreshGeneration: deps.layoutRefreshGeneration,
    treeData: deps.treeData,
    watch: deps.watch,
    worlds: deps.worlds
  })

  bindProjectHierarchyTreeSessionPendingRefreshFromEarlyWiring({
    earlyWiring,
    hierarchyStore: deps.hierarchyStore,
    nextTick: deps.nextTick,
    pendingDocumentRefreshIds: deps.pendingDocumentRefreshIds,
    pendingHierarchyNodeRefreshIds: deps.pendingHierarchyNodeRefreshIds,
    treeData: deps.treeData,
    watch: deps.watch
  })

  bindProjectHierarchyTreeAddNewDocumentLanguageRefresh({
    getPreferredLanguageCode: deps.resolvePreferredLanguageCode,
    treeData: deps.treeData,
    watch: deps.watch
  })

  return buildProjectHierarchyTreeSessionApi({
    handlersWiring: createProjectHierarchyTreeSessionHandlersBindWiring({
      createTemporaryDocument: deps.createTemporaryDocument,
      dragContext: deps.dragContext,
      earlyWiring,
      hierarchyStore: deps.hierarchyStore,
      nextTick: deps.nextTick,
      onDocumentOpenRequest: deps.onDocumentOpenRequest,
      resolvePreferredLanguageCode: deps.resolvePreferredLanguageCode,
      runFaAction: deps.runFaAction,
      treeData: deps.treeData
    }),
    isTreeDragActive: earlyWiring.bootstrap.sessionRefs.isTreeDragActive,
    openIconExpandAnimationWiring: earlyWiring.subWiring.openIconExpandAnimationWiring,
    subWiring: earlyWiring.subWiring,
    treeData: deps.treeData,
    treeMountKey: earlyWiring.bootstrap.sessionRefs.treeMountKey
  })
}
