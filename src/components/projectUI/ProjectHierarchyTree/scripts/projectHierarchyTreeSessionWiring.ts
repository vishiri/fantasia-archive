import type { Ref, watch as watchFn } from 'vue'
import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectHierarchyTreeHeTreeNode, I_faProjectHierarchyTreeUiState, I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'
import { createProjectHierarchyTreeSessionHandlersBindWiring } from './projectHierarchyTreeSessionHandlersSupportWiring'
import { bindProjectHierarchyTreeSessionHydrateLifecycle, buildProjectHierarchyTreeSessionApi } from './projectHierarchyTreeSessionLifecycleBindWiring'
import { bindProjectHierarchyTreeSessionPendingRefreshFromEarlyWiring } from './projectHierarchyTreePendingDocumentRefreshWiring'
import { bindProjectHierarchyTreeAddNewDocumentLanguageRefresh } from './projectHierarchyTreeSyncMapperWiring'
import { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import { createProjectHierarchyTreeSessionBootstrapWiring } from './projectHierarchyTreeSessionBootstrapWiring'
import { createProjectHierarchyTreeSessionSubWiring } from './projectHierarchyTreeSessionSubWiring'
import { PROJECT_HIERARCHY_TREE_DOCUMENT_ROW_DRAG_HOLD_DELAY_MS, PROJECT_HIERARCHY_TREE_DRAG_HANDLE_CLASS, PROJECT_HIERARCHY_TREE_LEFT_POINTER_DOWN_CLASS } from '../functions/projectHierarchyTreeConstants'

type T_hierarchyStore = {
  clearPendingDocumentRefreshIds: () => void
  clearPendingHierarchyNodeRefreshIds: () => void
  clearPendingRevealPath: () => void
  flushUiStatePersist: () => void
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  queuePersistScrollTopPx: (scrollTopPx: number) => void
  refreshHierarchyTreeNodes?: ((nodeIds: string[]) => void) | undefined
  refreshLayout: () => Promise<void>
  refreshUiState: () => Promise<void>
  resetOnProjectClose: () => void
  uiState: { scrollTopPx: number }
}

type T_sessionWiringDeps = {
  S_FaActiveProject: () => {
    activeProject: { id: string } | null
    hasActiveProject: boolean
  }
  applyOpenedDocumentTabs?: ((
    tabs: import('app/types/I_faOpenedDocumentsDomain').I_faOpenedDocumentTab[]
  ) => void) | undefined
  computed: <T>(getter: () => T) => { value: T }
  createTemporaryDocument: (input: {
    displayName: string
    initialTagsDraft?: import('app/types/I_faProjectTagDomain').I_faProjectDocumentTagAssignmentInput[] | undefined
    openMode: import('app/types/I_faOpenedDocumentsDomain').T_faOpenedDocumentOpenMode
    parentDocumentId: null
    templateId: string
    worldId: string
  }) => Promise<string>
  getOpenedDocumentTabs?: (() => readonly import('app/types/I_faOpenedDocumentsDomain').I_faOpenedDocumentTab[]) | undefined
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
  resolveForceSublevelCollapseInTree: () => boolean
  resolvePreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  uiState: Ref<I_faProjectHierarchyTreeUiState>
  watch: typeof watchFn
  worlds: Ref<I_faProjectHierarchyTreeWorkspaceWorld[]>
  layoutRefreshGeneration: Ref<number>
}

function bindProjectHierarchyTreeSessionSideEffects (
  deps: T_sessionWiringDeps,
  earlyWiring: ReturnType<typeof createProjectHierarchyTreeSessionEarlyWiring>
): void {
  bindProjectHierarchyTreeSessionHydrateLifecycle({
    S_FaActiveProject: deps.S_FaActiveProject,
    earlyWiring,
    getStoreExpandedNodeIds: () => deps.uiState.value.expandedNodeIds,
    hierarchyStore: deps.hierarchyStore,
    nextTick: deps.nextTick,
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
}

export function createProjectHierarchyTreeSessionWiring (deps: T_sessionWiringDeps) {
  const earlyWiring = createProjectHierarchyTreeSessionEarlyWiring({
    computed: deps.computed,
    dragContext: deps.dragContext,
    getForceSublevelCollapseInTree: deps.resolveForceSublevelCollapseInTree,
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
  bindProjectHierarchyTreeSessionSideEffects(deps, earlyWiring)
  return buildProjectHierarchyTreeSessionApi({
    handlersWiring: createProjectHierarchyTreeSessionHandlersBindWiring({
      applyOpenedDocumentTabs: deps.applyOpenedDocumentTabs,
      createTemporaryDocument: deps.createTemporaryDocument,
      dragContext: deps.dragContext,
      earlyWiring,
      getOpenedDocumentTabs: deps.getOpenedDocumentTabs,
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
    treeData: deps.treeData
  })
}

type T_earlyHierarchyStore = {
  flushUiStatePersist: () => void
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  queuePersistScrollTopPx: (scrollTopPx: number) => void
  refreshLayout: () => Promise<void>
}

export function createProjectHierarchyTreeSessionEarlyWiring (deps: {
  computed: <T>(getter: () => T) => { value: T }
  dragContext: {
    dragNode: {
      data: I_faProjectHierarchyTreeHeTreeNode
    } | null
  }
  getPreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  getForceSublevelCollapseInTree: () => boolean
  hierarchyStore: T_earlyHierarchyStore
  nextTick: () => Promise<void>
  onUnmounted: (hook: () => void) => void
  pendingRevealPath: Ref<string[]>
  ref: <T>(initial: T) => Ref<T>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  uiState: Ref<I_faProjectHierarchyTreeUiState>
  watch: typeof watchFn
  worlds: Ref<I_faProjectHierarchyTreeWorkspaceWorld[]>
}) {
  const bootstrap = createProjectHierarchyTreeSessionBootstrapWiring({
    onUnmounted: deps.onUnmounted,
    ref: deps.ref,
    watch: deps.watch
  })

  const subWiringHolder: {
    subWiring: ReturnType<typeof createProjectHierarchyTreeSessionSubWiring> | null
  } = {
    subWiring: null
  }

  const documentRowDragHoldWiring = createProjectHierarchyTreeDocumentRowDragHoldWiring({
    dragHandleClassName: PROJECT_HIERARCHY_TREE_DRAG_HANDLE_CLASS,
    holdDelayMs: PROJECT_HIERARCHY_TREE_DOCUMENT_ROW_DRAG_HOLD_DELAY_MS,
    leftPointerDownClassName: PROJECT_HIERARCHY_TREE_LEFT_POINTER_DOWN_CLASS,
    onAllowedDocumentRowDragStart: () => {
      subWiringHolder.subWiring?.dndWiring.commitAllowedDocumentRowDragSessionStart(deps.dragContext)
    },
    onUnmounted: deps.onUnmounted,
    treeScrollHostRef: bootstrap.sessionRefs.treeScrollHostRef,
    watch: deps.watch,
    windowClearTimeout: (timeoutId: number) => {
      window.clearTimeout(timeoutId)
    },
    windowSetTimeout: (handler: () => void, delayMs: number) => {
      return window.setTimeout(handler, delayMs)
    }
  })

  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed: deps.computed,
    documentRowDragHoldWiring,
    documentRowExpandClickGesture: bootstrap.documentRowExpandClickGesture,
    dragCommitPending: bootstrap.sessionRefs.dragCommitPending,
    dragCommitScheduled: bootstrap.sessionRefs.dragCommitScheduled,
    dragDropCommitted: bootstrap.sessionRefs.dragDropCommitted,
    dragExpandPostCommitGuard: bootstrap.sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: bootstrap.sessionRefs.dragExpandUiFrozen,
    deferLazyLoadTreeRevisionPublish: bootstrap.sessionRefs.deferLazyLoadTreeRevisionPublish,
    getForceSublevelCollapseInTree: deps.getForceSublevelCollapseInTree,
    getPreferredLanguageCode: deps.getPreferredLanguageCode,
    hierarchyStore: deps.hierarchyStore,
    isTreeDragActive: bootstrap.sessionRefs.isTreeDragActive,
    nextTick: deps.nextTick,
    onUnmounted: deps.onUnmounted,
    openNodeIds: bootstrap.sessionRefs.openNodeIds,
    pendingRevealPath: deps.pendingRevealPath,
    ref: deps.ref,
    suppressTreeEmit: bootstrap.sessionRefs.suppressTreeEmit,
    treeComponentRef: bootstrap.sessionRefs.treeComponentRef,
    treeData: deps.treeData,
    treeScrollHostRef: bootstrap.sessionRefs.treeScrollHostRef,
    uiState: deps.uiState,
    watch: deps.watch,
    worlds: deps.worlds
  })
  subWiringHolder.subWiring = subWiring

  return {
    bootstrap,
    documentRowDragHoldWiring,
    subWiring
  }
}
