import type {
  I_faOpenedDocumentTreeOpenMeta,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { projectHierarchyTreeNodeShowsOpenIcon } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'

export function createProjectHierarchyTreeDocumentOpenHandlers (deps: {
  onDocumentOpenRequest: (
    documentId: string,
    mode: T_faOpenedDocumentOpenMode,
    treeMeta: I_faOpenedDocumentTreeOpenMeta
  ) => void
}): {
    onDocumentRowAuxClick: (node: I_faProjectHierarchyTreeHeTreeNode, event: MouseEvent) => void
    onNodeClick: (stat: { data: I_faProjectHierarchyTreeHeTreeNode, children?: unknown[] }) => void
  } {
  function resolveDocumentTreeOpenMeta (
    node: I_faProjectHierarchyTreeHeTreeNode
  ): I_faOpenedDocumentTreeOpenMeta {
    return {
      tabLabel: node.label,
      templateIcon: node.icon
    }
  }

  function onNodeClick (stat: {
    data: I_faProjectHierarchyTreeHeTreeNode
    children?: unknown[]
  }): void {
    if (stat.data.nodeKind !== 'document' || stat.data.documentId === null) {
      return
    }
    const childCount = stat.children?.length ?? stat.data.children.length
    if (projectHierarchyTreeNodeShowsOpenIcon(stat.data, childCount)) {
      return
    }
    deps.onDocumentOpenRequest(
      stat.data.documentId,
      'leftNavigate',
      resolveDocumentTreeOpenMeta(stat.data)
    )
  }

  function onDocumentRowAuxClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    event: MouseEvent
  ): void {
    if (event.button !== 1) {
      return
    }
    if (node.nodeKind !== 'document' || node.documentId === null) {
      return
    }
    event.preventDefault()
    deps.onDocumentOpenRequest(
      node.documentId,
      'middleBackground',
      resolveDocumentTreeOpenMeta(node)
    )
  }

  return {
    onDocumentRowAuxClick,
    onNodeClick
  }
}
