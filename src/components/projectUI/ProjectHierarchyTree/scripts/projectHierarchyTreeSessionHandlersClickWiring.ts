import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import type { createProjectHierarchyTreeAddNewDocumentClickHandlers } from './projectHierarchyTreeAddNewDocumentClickHandlersWiring'
import type { createProjectHierarchyTreeDocumentOpenHandlers } from './projectHierarchyTreeDocumentOpenHandlersWiring'

export function createProjectHierarchyTreeSessionHandlersClickWiring (deps: {
  addNewDocumentClickHandlers: ReturnType<typeof createProjectHierarchyTreeAddNewDocumentClickHandlers>
  documentOpenHandlers: ReturnType<typeof createProjectHierarchyTreeDocumentOpenHandlers>
}) {
  function onNodeClick (stat: {
    data: I_faProjectHierarchyTreeHeTreeNode
    children?: unknown[]
  }): void {
    if (stat.data.nodeKind === 'addNewDocument') {
      deps.addNewDocumentClickHandlers.onAddNewDocumentRowClick(stat.data)
      return
    }
    deps.documentOpenHandlers.onNodeClick(stat)
  }

  function onDocumentRowAuxClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    event: MouseEvent
  ): void {
    if (node.nodeKind === 'addNewDocument' || node.nodeKind === 'templatePlacement') {
      deps.addNewDocumentClickHandlers.onAddNewDocumentRowAuxClick(node, event)
      return
    }
    deps.documentOpenHandlers.onDocumentRowAuxClick(node, event)
  }

  function onAddNewDocumentRowContextMenu (event: MouseEvent): void {
    event.preventDefault()
  }

  return {
    onAddNewDocumentRowContextMenu,
    onDocumentRowAuxClick,
    onNodeClick
  }
}
