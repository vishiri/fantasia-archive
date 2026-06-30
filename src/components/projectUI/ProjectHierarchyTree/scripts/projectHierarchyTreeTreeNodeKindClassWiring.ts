import type { T_faProjectHierarchyTreeNodeKind } from 'app/types/I_faProjectHierarchyTreeDomain'

import { PROJECT_HIERARCHY_TREE_NODE_ITEM_SELECTOR } from '../functions/projectHierarchyTreeConstants'
import {
  PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_LIST,
  resolveProjectHierarchyTreeTreeNodeKindClass
} from '../functions/projectHierarchyTreeTreeNodeKindClass'

function resolveHeTreeRowElement (rowElement: HTMLElement | null): HTMLElement | null {
  return rowElement?.closest(PROJECT_HIERARCHY_TREE_NODE_ITEM_SELECTOR) ?? null
}

function clearProjectHierarchyTreeTreeNodeKindClasses (treeNode: HTMLElement): void {
  for (const className of PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_LIST) {
    treeNode.classList.remove(className)
  }
}

export function applyProjectHierarchyTreeTreeNodeKindClass (
  rowElement: HTMLElement | null,
  nodeKind: T_faProjectHierarchyTreeNodeKind
): void {
  const treeNode = resolveHeTreeRowElement(rowElement)
  if (!treeNode) {
    return
  }
  clearProjectHierarchyTreeTreeNodeKindClasses(treeNode)
  const kindClass = resolveProjectHierarchyTreeTreeNodeKindClass(nodeKind)
  treeNode.classList.add(kindClass)
}

export function clearProjectHierarchyTreeTreeNodeKindClass (
  rowElement: HTMLElement | null
): void {
  const treeNode = resolveHeTreeRowElement(rowElement)
  if (!treeNode) {
    return
  }
  clearProjectHierarchyTreeTreeNodeKindClasses(treeNode)
}
