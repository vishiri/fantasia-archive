import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

export function createProjectHierarchyTreeLazyPlaceholderApi () {
  function createLazyPlaceholderChild (
    parent: Pick<
      I_faProjectHierarchyTreeHeTreeNode,
      'icon' | 'id' | 'placementId' | 'tagId' | 'worldColor' | 'worldId'
    >
  ): I_faProjectHierarchyTreeHeTreeNode {
    const children: I_faProjectHierarchyTreeHeTreeNode[] = []
    const icon = parent.icon
    const id = `${parent.id}__lazy`
    const placementId = parent.placementId
    const tagId = parent.tagId ?? null
    const worldColor = parent.worldColor
    const worldId = parent.worldId
    return {
      children,
      childrenLoaded: false,
      documentId: null,
      groupId: null,
      hasChildren: false,
      icon,
      id,
      label: '',
      nodeKind: 'document',
      placementId,
      tagId,
      worldColor,
      worldId
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
    if (
      node.nodeKind === 'world' ||
      node.nodeKind === 'group' ||
      node.nodeKind === 'tagWrapper' ||
      node.childrenLoaded
    ) {
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
