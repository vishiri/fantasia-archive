import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeNodeDraggable } from '../functions/projectHierarchyTreeDnD'
import { projectHierarchyTreeNodeShowsOpenIcon } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'
import type { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import type { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowExpandClickGestureWiring'

function shouldRouteHierarchyTreeRowExpandClick (
  node: I_faProjectHierarchyTreeHeTreeNode,
  stat: { children: unknown[], open: boolean }
): boolean {
  if (node.nodeKind === 'addNewDocument') {
    return false
  }
  if (
    node.nodeKind === 'world' ||
    node.nodeKind === 'group' ||
    node.nodeKind === 'templatePlacement'
  ) {
    return true
  }
  if (node.nodeKind === 'document') {
    return projectHierarchyTreeNodeShowsOpenIcon(node, stat.children.length)
  }
  return false
}

function shouldStopHierarchyTreeRowExpandPointerDown (
  node: I_faProjectHierarchyTreeHeTreeNode
): boolean {
  return node.nodeKind !== 'document'
}

export function createProjectHierarchyTreeExpandRowClickRouting (deps: {
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  onNodeOpenIconClick: (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { children: unknown[], open: boolean }
  ) => Promise<void>
  onNodeOpenIconPointerDown: (stat: { open: boolean }) => void
}) {
  function onNonWorldOpenIconPointerDown (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { open: boolean }
  ): void {
    if (node.nodeKind === 'world') {
      return
    }
    deps.onNodeOpenIconPointerDown(stat)
  }

  async function onNonWorldOpenIconClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { children: unknown[], open: boolean }
  ): Promise<void> {
    if (node.nodeKind === 'world') {
      return
    }
    await deps.onNodeOpenIconClick(node, stat)
  }

  function onWorldNodeRowPointerDown (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { children: unknown[], open: boolean },
    event: PointerEvent
  ): void {
    if (isProjectHierarchyTreeNodeDraggable(node)) {
      deps.documentRowDragHoldWiring.handleDocumentRowPointerDown(event)
    }
    if (!shouldRouteHierarchyTreeRowExpandClick(node, stat)) {
      return
    }
    if (node.nodeKind === 'document') {
      deps.documentRowExpandClickGesture.beginDocumentRowGesture(event)
    }
    if (shouldStopHierarchyTreeRowExpandPointerDown(node)) {
      event.stopPropagation()
    }
    deps.onNodeOpenIconPointerDown(stat)
  }

  async function onWorldNodeRowClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { children: unknown[], open: boolean },
    event: MouseEvent
  ): Promise<void> {
    if (!shouldRouteHierarchyTreeRowExpandClick(node, stat)) {
      return
    }
    if (node.nodeKind === 'document') {
      const shouldToggleExpand = deps.documentRowExpandClickGesture.shouldDocumentRowClickToggleExpand(event)
      deps.documentRowExpandClickGesture.clearDocumentRowGesture()
      if (!shouldToggleExpand) {
        return
      }
    }
    event.stopPropagation()
    await deps.onNodeOpenIconClick(node, stat)
  }

  return {
    onNonWorldOpenIconClick,
    onNonWorldOpenIconPointerDown,
    onWorldNodeRowClick,
    onWorldNodeRowPointerDown
  }
}
