import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

function resolveDocumentIdFromNode (
  node: I_faProjectHierarchyTreeHeTreeNode
): string | null {
  if (node.nodeKind !== 'document' || node.documentId === null) {
    return null
  }

  return node.documentId
}

export function buildProjectHierarchyTreeDocumentButtonActionHandlers (deps: {
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
}): {
    onDocumentRowAddUnderButtonClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
    onDocumentRowEditButtonClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
    onDocumentRowOpenButtonClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
  } {
  function dispatchDocumentAction (
    node: I_faProjectHierarchyTreeHeTreeNode,
    actionId:
      | 'openHierarchyTreeDocument'
      | 'editHierarchyTreeDocument'
      | 'addHierarchyTreeChildDocument'
  ): void {
    const documentId = resolveDocumentIdFromNode(node)
    if (documentId === null) {
      return
    }

    deps.runFaAction(actionId, { documentId })
  }

  function onDocumentRowOpenButtonClick (node: I_faProjectHierarchyTreeHeTreeNode): void {
    dispatchDocumentAction(node, 'openHierarchyTreeDocument')
  }

  function onDocumentRowEditButtonClick (node: I_faProjectHierarchyTreeHeTreeNode): void {
    dispatchDocumentAction(node, 'editHierarchyTreeDocument')
  }

  function onDocumentRowAddUnderButtonClick (node: I_faProjectHierarchyTreeHeTreeNode): void {
    dispatchDocumentAction(node, 'addHierarchyTreeChildDocument')
  }

  return {
    onDocumentRowAddUnderButtonClick,
    onDocumentRowEditButtonClick,
    onDocumentRowOpenButtonClick
  }
}
