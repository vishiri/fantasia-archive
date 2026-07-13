import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeSessionHandlersWiring } from './projectHierarchyTreeSessionHandlersWiring'
import type { createProjectHierarchyTreeSessionEarlyWiring } from './projectHierarchyTreeSessionEarlyWiring'

type T_earlyWiring = ReturnType<typeof createProjectHierarchyTreeSessionEarlyWiring>

type T_hierarchyStore = {
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
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
    lazyLoadWiring: deps.earlyWiring.subWiring.lazyLoadWiring,
    nextTick: deps.nextTick,
    onDocumentOpenRequest: deps.onDocumentOpenRequest,
    openNodeIds: deps.earlyWiring.bootstrap.sessionRefs.openNodeIds,
    queuePersistExpandedNodeIds: (expandedNodeIds) => {
      deps.hierarchyStore.queuePersistExpandedNodeIds(expandedNodeIds)
    },
    resolvePreferredLanguageCode: deps.resolvePreferredLanguageCode,
    suppressTreeEmit: deps.earlyWiring.bootstrap.sessionRefs.suppressTreeEmit,
    treeComponentRef: deps.earlyWiring.bootstrap.sessionRefs.treeComponentRef,
    treeData: deps.treeData,
    treeMountKey: deps.earlyWiring.bootstrap.sessionRefs.treeMountKey,
    treeScrollHostRef: deps.earlyWiring.bootstrap.sessionRefs.treeScrollHostRef,
    uiStateWiring: deps.earlyWiring.subWiring.uiStateWiring
  })
}
