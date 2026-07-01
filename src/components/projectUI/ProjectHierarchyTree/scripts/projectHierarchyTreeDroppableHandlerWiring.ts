import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  isProjectHierarchyTreeNodeDroppable,
  isProjectHierarchyTreeRootDroppable
} from '../functions/projectHierarchyTreeDnD'

export function createProjectHierarchyTreeDroppableHandlers (deps: {
  dragContext: {
    dragNode: {
      data: I_faProjectHierarchyTreeHeTreeNode
    } | null
  }
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  function eachDroppableHandler (stat: { data: I_faProjectHierarchyTreeHeTreeNode }): boolean {
    return isProjectHierarchyTreeNodeDroppable(
      stat.data,
      deps.dragContext,
      deps.treeData.value
    )
  }

  function rootDroppableHandler (): boolean {
    return isProjectHierarchyTreeRootDroppable(deps.dragContext)
  }

  return {
    eachDroppableHandler,
    rootDroppableHandler
  }
}
