import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

export function createProjectHierarchyTreeLazyPlaceholderApi () {
  function createLazyPlaceholderChild (
    parent: Pick<I_faProjectHierarchyTreeHeTreeNode, 'icon' | 'id' | 'placementId' | 'worldColor' | 'worldId'>
  ): I_faProjectHierarchyTreeHeTreeNode {
    return {
      children: [],
      childrenLoaded: false,
      documentId: null,
      groupId: null,
      hasChildren: false,
      icon: parent.icon,
      id: `${parent.id}__lazy`,
      label: '',
      nodeKind: 'document',
      placementId: parent.placementId,
      worldColor: parent.worldColor,
      worldId: parent.worldId
    }
  }

  function resolveLazyChildren (
    parent: I_faProjectHierarchyTreeHeTreeNode
  ): I_faProjectHierarchyTreeHeTreeNode[] {
    if (!parent.hasChildren) {
      return []
    }
    return [createLazyPlaceholderChild(parent)]
  }

  function syncProjectHierarchyTreeNodeLazyChildren (
    node: I_faProjectHierarchyTreeHeTreeNode
  ): void {
    if (node.nodeKind === 'world' || node.nodeKind === 'group' || node.childrenLoaded) {
      return
    }
    if (!node.hasChildren) {
      node.children = []
      return
    }
    const lazyChildId = `${node.id}__lazy`
    const hasOnlyLazyPlaceholder = node.children.length === 1 && node.children[0]?.id === lazyChildId
    if (node.children.length === 0 || hasOnlyLazyPlaceholder) {
      node.children = resolveLazyChildren(node)
    }
  }

  return {
    createLazyPlaceholderChild,
    resolveLazyChildren,
    syncProjectHierarchyTreeNodeLazyChildren
  }
}
