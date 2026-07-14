import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

export const PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_NODE_ID_SUFFIX = '__add-new'

export function resolveProjectHierarchyTreeAddNewDocumentNodeId (placementId: string): string {
  return `${placementId}${PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_NODE_ID_SUFFIX}`
}

export function isProjectHierarchyTreeAddNewDocumentNode (
  node: Pick<I_faProjectHierarchyTreeHeTreeNode, 'id' | 'nodeKind'>
): boolean {
  return node.nodeKind === 'addNewDocument' ||
    node.id.endsWith(PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_NODE_ID_SUFFIX)
}

export function isProjectHierarchyTreeAddNewDocumentCreateSourceNode (
  node: Pick<I_faProjectHierarchyTreeHeTreeNode, 'id' | 'nodeKind'>
): boolean {
  return isProjectHierarchyTreeAddNewDocumentNode(node) || node.nodeKind === 'templatePlacement'
}
