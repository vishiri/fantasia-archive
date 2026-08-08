import type { T_faProjectHierarchyTreeNodeKind } from 'app/types/I_faProjectHierarchyTreeDomain'

/** Secondary he-tree row classes on `.tree-node` by workspace hierarchy node kind. */
export const PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_LIST = [
  'projectHierarchyTree-treeNode--world',
  'projectHierarchyTree-treeNode--group',
  'projectHierarchyTree-treeNode--documentTemplate',
  'projectHierarchyTree-treeNode--document',
  'projectHierarchyTree-treeNode--addNewDocument',
  'projectHierarchyTree-treeNode--tag',
  'projectHierarchyTree-treeNode--tagWrapper'
] as const

const PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_BY_KIND = {
  addNewDocument: 'projectHierarchyTree-treeNode--addNewDocument',
  document: 'projectHierarchyTree-treeNode--document',
  group: 'projectHierarchyTree-treeNode--group',
  tag: 'projectHierarchyTree-treeNode--tag',
  tagWrapper: 'projectHierarchyTree-treeNode--tagWrapper',
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

/** Row-slot kind classes on projectHierarchyTree__nodeRow (first paint, no he-tree hook delay). */
export const PROJECT_HIERARCHY_TREE_NODE_ROW_KIND_CLASS_LIST = [
  'projectHierarchyTree__nodeRow--world',
  'projectHierarchyTree__nodeRow--group',
  'projectHierarchyTree__nodeRow--documentTemplate',
  'projectHierarchyTree__nodeRow--document',
  'projectHierarchyTree__nodeRow--addNewDocument',
  'projectHierarchyTree__nodeRow--tag',
  'projectHierarchyTree__nodeRow--tagWrapper'
] as const

const PROJECT_HIERARCHY_TREE_NODE_ROW_KIND_CLASS_BY_KIND = {
  addNewDocument: 'projectHierarchyTree__nodeRow--addNewDocument',
  document: 'projectHierarchyTree__nodeRow--document',
  group: 'projectHierarchyTree__nodeRow--group',
  tag: 'projectHierarchyTree__nodeRow--tag',
  tagWrapper: 'projectHierarchyTree__nodeRow--tagWrapper',
  templatePlacement: 'projectHierarchyTree__nodeRow--documentTemplate',
  world: 'projectHierarchyTree__nodeRow--world'
} as const satisfies Record<
  T_faProjectHierarchyTreeNodeKind,
  (typeof PROJECT_HIERARCHY_TREE_NODE_ROW_KIND_CLASS_LIST)[number]
>

export function resolveProjectHierarchyTreeNodeRowKindClass (
  nodeKind: T_faProjectHierarchyTreeNodeKind
): (typeof PROJECT_HIERARCHY_TREE_NODE_ROW_KIND_CLASS_LIST)[number] {
  return PROJECT_HIERARCHY_TREE_NODE_ROW_KIND_CLASS_BY_KIND[nodeKind]
}
