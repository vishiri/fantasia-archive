import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import { createProjectHierarchyTreeSessionBootstrapWiring } from './projectHierarchyTreeSessionBootstrapWiring'
import { createProjectHierarchyTreeSessionSubWiring } from './projectHierarchyTreeSessionSubWiring'
import {
  PROJECT_HIERARCHY_TREE_DOCUMENT_ROW_DRAG_HOLD_DELAY_MS,
  PROJECT_HIERARCHY_TREE_DRAG_HANDLE_CLASS,
  PROJECT_HIERARCHY_TREE_LEFT_POINTER_DOWN_CLASS
} from '../functions/projectHierarchyTreeConstants'

type T_hierarchyStore = {
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
  hierarchyStore: T_hierarchyStore
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
    windowClearTimeout: (timeoutId) => {
      window.clearTimeout(timeoutId)
    },
    windowSetTimeout: (handler, delayMs) => {
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
    getPreferredLanguageCode: deps.getPreferredLanguageCode,
    hierarchyStore: deps.hierarchyStore,
    isTreeDragActive: bootstrap.sessionRefs.isTreeDragActive,
    nextTick: deps.nextTick,
    openNodeIds: bootstrap.sessionRefs.openNodeIds,
    pendingRevealPath: deps.pendingRevealPath,
    ref: deps.ref,
    suppressTreeEmit: bootstrap.sessionRefs.suppressTreeEmit,
    treeComponentRef: bootstrap.sessionRefs.treeComponentRef,
    treeData: deps.treeData,
    treeMountKey: bootstrap.sessionRefs.treeMountKey,
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
