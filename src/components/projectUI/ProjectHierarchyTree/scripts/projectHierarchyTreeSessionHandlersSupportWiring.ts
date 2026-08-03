import type {
  I_faOpenedDocumentTreeOpenMeta,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import { projectHierarchyTreeNodeShowsOpenIcon } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'
import type { createProjectHierarchyTreeAddNewDocumentClickHandlers } from './projectHierarchyTreeSyncMapperWiring'
import type { Ref } from 'vue'
import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import { createProjectHierarchyTreeSessionHandlersWiring } from './projectHierarchyTreeSessionHandlersWiring'
import type { createProjectHierarchyTreeSessionEarlyWiring } from './projectHierarchyTreeSessionWiring'

export function createProjectHierarchyTreeDocumentOpenHandlers (deps: {
  onDocumentOpenRequest: (
    documentId: string,
    mode: T_faOpenedDocumentOpenMode,
    treeMeta: I_faOpenedDocumentTreeOpenMeta
  ) => void
}): {
    onDocumentRowAuxClick: (node: I_faProjectHierarchyTreeHeTreeNode, event: MouseEvent) => void
    onNodeClick: (stat: { data: I_faProjectHierarchyTreeHeTreeNode, children?: unknown[] }) => void
  } {
  function resolveDocumentTreeOpenMeta (
    node: I_faProjectHierarchyTreeHeTreeNode
  ): I_faOpenedDocumentTreeOpenMeta {
    return {
      tabLabel: node.label,
      templateIcon: node.icon
    }
  }

  function onNodeClick (stat: {
    data: I_faProjectHierarchyTreeHeTreeNode
    children?: unknown[]
  }): void {
    if (stat.data.nodeKind === 'addNewDocument') {
      return
    }
    if (stat.data.nodeKind !== 'document' || stat.data.documentId === null) {
      return
    }
    const childCount = stat.children?.length ?? stat.data.children.length
    if (projectHierarchyTreeNodeShowsOpenIcon(stat.data, childCount)) {
      return
    }
    deps.onDocumentOpenRequest(
      stat.data.documentId,
      'leftNavigate',
      resolveDocumentTreeOpenMeta(stat.data)
    )
  }

  function onDocumentRowAuxClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    event: MouseEvent
  ): void {
    if (node.nodeKind === 'addNewDocument') {
      return
    }
    if (event.button !== 1) {
      return
    }
    if (node.nodeKind !== 'document' || node.documentId === null) {
      return
    }
    event.preventDefault()
    deps.onDocumentOpenRequest(
      node.documentId,
      'middleBackground',
      resolveDocumentTreeOpenMeta(node)
    )
  }

  return {
    onDocumentRowAuxClick,
    onNodeClick
  }
}

export function createProjectHierarchyTreeSessionHandlersClickWiring (deps: {
  addNewDocumentClickHandlers: ReturnType<typeof createProjectHierarchyTreeAddNewDocumentClickHandlers>
  documentOpenHandlers: ReturnType<typeof createProjectHierarchyTreeDocumentOpenHandlers>
}) {
  function onNodeClick (stat: {
    data: I_faProjectHierarchyTreeHeTreeNode
    children?: unknown[]
  }): void {
    if (stat.data.nodeKind === 'addNewDocument') {
      deps.addNewDocumentClickHandlers.onAddNewDocumentRowClick(stat.data)
      return
    }
    deps.documentOpenHandlers.onNodeClick(stat)
  }

  function onDocumentRowAuxClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    event: MouseEvent
  ): void {
    if (node.nodeKind === 'addNewDocument' || node.nodeKind === 'templatePlacement') {
      deps.addNewDocumentClickHandlers.onAddNewDocumentRowAuxClick(node, event)
      return
    }
    deps.documentOpenHandlers.onDocumentRowAuxClick(node, event)
  }

  function onAddNewDocumentRowContextMenu (event: MouseEvent): void {
    event.preventDefault()
  }

  return {
    onAddNewDocumentRowContextMenu,
    onDocumentRowAuxClick,
    onNodeClick
  }
}

type T_earlyWiring = ReturnType<typeof createProjectHierarchyTreeSessionEarlyWiring>

type T_hierarchyStore = {
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  uiState: { scrollTopPx: number }
}

export function createProjectHierarchyTreeSessionHandlersBindWiring (deps: {
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
  earlyWiring: T_earlyWiring
  hierarchyStore: T_hierarchyStore
  nextTick: () => Promise<void>
  onDocumentOpenRequest: (
    documentId: string,
    mode: import('app/types/I_faOpenedDocumentsDomain').T_faOpenedDocumentOpenMode,
    treeMeta: import('app/types/I_faOpenedDocumentsDomain').I_faOpenedDocumentTreeOpenMeta
  ) => void
  resolvePreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  return createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: deps.createTemporaryDocument,
    documentRowDragHoldWiring: deps.earlyWiring.documentRowDragHoldWiring,
    documentRowExpandClickGesture: deps.earlyWiring.bootstrap.documentRowExpandClickGesture,
    dragContext: deps.dragContext,
    dragExpandPostCommitGuard: deps.earlyWiring.bootstrap.sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.earlyWiring.bootstrap.sessionRefs.dragExpandUiFrozen,
    getDragExpandedSnapshotNodeIds: deps.earlyWiring.subWiring.dndWiring.getDragExpandedSnapshotNodeIds,
    getPersistedScrollTopPx: () => deps.hierarchyStore.uiState.scrollTopPx,
    getTreeScrollHost: () => deps.earlyWiring.bootstrap.sessionRefs.treeScrollHostRef.value,
    lazyLoadWiring: deps.earlyWiring.subWiring.lazyLoadWiring,
    nextTick: deps.nextTick,
    onDocumentOpenRequest: deps.onDocumentOpenRequest,
    openNodeIds: deps.earlyWiring.bootstrap.sessionRefs.openNodeIds,
    openIconExpandAnimationWiring: deps.earlyWiring.subWiring.openIconExpandAnimationWiring,
    queuePersistExpandedNodeIds: (expandedNodeIds) => {
      deps.hierarchyStore.queuePersistExpandedNodeIds(expandedNodeIds)
    },
    resolvePreferredLanguageCode: deps.resolvePreferredLanguageCode,
    requestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
    runDeferredLazyLoadBatch: deps.earlyWiring.subWiring.runDeferredLazyLoadBatch,
    runFaAction: deps.runFaAction,
    suppressTreeEmit: deps.earlyWiring.bootstrap.sessionRefs.suppressTreeEmit,
    treeComponentRef: deps.earlyWiring.bootstrap.sessionRefs.treeComponentRef,
    treeData: deps.treeData,
    treeScrollHostRef: deps.earlyWiring.bootstrap.sessionRefs.treeScrollHostRef,
    uiStateWiring: deps.earlyWiring.subWiring.uiStateWiring
  })
}
