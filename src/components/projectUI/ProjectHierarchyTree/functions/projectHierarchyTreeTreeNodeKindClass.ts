import type { T_faProjectHierarchyTreeNodeKind } from 'app/types/I_faProjectHierarchyTreeDomain'

/** Secondary he-tree row classes on `.tree-node` by workspace hierarchy node kind. */
export const PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_LIST = [
  'projectHierarchyTree-treeNode--world',
  'projectHierarchyTree-treeNode--group',
  'projectHierarchyTree-treeNode--documentTemplate',
  'projectHierarchyTree-treeNode--document'
] as const

const PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_BY_KIND = {
  document: 'projectHierarchyTree-treeNode--document',
  group: 'projectHierarchyTree-treeNode--group',
  templatePlacement: 'projectHierarchyTree-treeNode--documentTemplate',
  world: 'projectHierarchyTree-treeNode--world'
} as const satisfies Record<
  T_faProjectHierarchyTreeNodeKind,
  (typeof PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_LIST)[number]
>

export function resolveProjectHierarchyTreeTreeNodeKindClass (
  nodeKind: T_faProjectHierarchyTreeNodeKind
): (typeof PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_LIST)[number] {
  return PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_BY_KIND[nodeKind]
}
