import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  isProjectHierarchyTreeNodeDroppable,
  isProjectHierarchyTreeRootDroppable
} from '../functions/projectHierarchyTreeDnD'
import { logProjectHierarchyTreeDebugSession } from './projectHierarchyTreeDebugSessionLogWiring'

export function createProjectHierarchyTreeDroppableHandlers (deps: {
  dragContext: {
    dragNode: {
      data: I_faProjectHierarchyTreeHeTreeNode
    } | null
  }
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  function eachDroppableHandler (stat: { data: I_faProjectHierarchyTreeHeTreeNode }): boolean {
    const droppable = isProjectHierarchyTreeNodeDroppable(
      stat.data,
      deps.dragContext,
      deps.treeData.value
    )
    const dragged = deps.dragContext.dragNode?.data
    if (
      dragged?.nodeKind === 'document' &&
      stat.data.nodeKind === 'document' &&
      !droppable &&
      dragged.documentId !== null &&
      stat.data.documentId !== null &&
      stat.data.documentId !== dragged.documentId &&
      stat.data.placementId === dragged.placementId
    ) {
      // #region agent log
      logProjectHierarchyTreeDebugSession({
        data: {
          draggedDocumentId: dragged.documentId,
          targetDocumentId: stat.data.documentId,
          targetNodeId: stat.data.id
        },
        hypothesisId: 'D1',
        location: 'projectHierarchyTreeDroppableHandlerWiring.ts:eachDroppableHandler',
        message: 'blocked document nest drop target',
        runId: 'pull-left-outdent'
      })
      // #endregion
    }
    if (
      dragged?.nodeKind === 'document' &&
      (stat.data.nodeKind === 'templatePlacement' || !droppable)
    ) {
      // #region agent log
      logProjectHierarchyTreeDebugSession({
        data: {
          draggedDocumentId: dragged.documentId,
          droppable,
          targetNodeId: stat.data.id,
          targetNodeKind: stat.data.nodeKind
        },
        hypothesisId: 'T1-T3',
        location: 'projectHierarchyTreeDroppableHandlerWiring.ts:eachDroppableHandler',
        message: 'droppable probe',
        runId: 'first-level-drop'
      })
      // #endregion
    }
    return droppable
  }

  function rootDroppableHandler (): boolean {
    return isProjectHierarchyTreeRootDroppable(deps.dragContext)
  }

  return {
    eachDroppableHandler,
    rootDroppableHandler
  }
}
