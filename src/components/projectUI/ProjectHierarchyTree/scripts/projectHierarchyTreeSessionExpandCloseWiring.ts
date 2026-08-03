import type { Ref } from 'vue'
import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'
import { isProjectHierarchyTreeDragExpandUiFrozen } from '../functions/projectHierarchyTreeDragExpandFreeze'
import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { requestProjectHierarchyTreeVirtualListUpdate } from '../functions/projectHierarchyTreeVirtualListUpdate'
import { runProjectHierarchyTreePostDragExpandCloseGuard } from './projectHierarchyTreeDnDWiring'

export function createProjectHierarchyTreeSessionExpandCloseHandler (deps: {
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  getDragExpandedSnapshotNodeIds: () => string[] | null
  requestAnimationFrame: (callback: () => void) => number
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  uiStateWiring: {
    markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
  }
}): (
    stat: { data: I_faProjectHierarchyTreeHeTreeNode },
    options?: { source: 'heTreeEvent' | 'openIcon' }
  ) => void {
  function shouldIgnoreExpandPersistMutation (): boolean {
    return isProjectHierarchyTreeDragExpandUiFrozen({
      dragExpandUiFrozen: deps.dragExpandUiFrozen.value
    }) || deps.suppressTreeEmit.value
  }

  return function onNodeClose (
    stat: { data: I_faProjectHierarchyTreeHeTreeNode },
    options?: { source: 'heTreeEvent' | 'openIcon' }
  ): void {
    const fromOpenIcon = options?.source === 'openIcon'
    if (!fromOpenIcon && shouldIgnoreExpandPersistMutation()) {
      return
    }
    runProjectHierarchyTreePostDragExpandCloseGuard({
      dragExpandPostCommitGuard: () => deps.dragExpandPostCommitGuard.value,
      getDragExpandedSnapshotNodeIds: deps.getDragExpandedSnapshotNodeIds,
      markNodeClosed: deps.uiStateWiring.markNodeClosed,
      node: findProjectHierarchyTreeNodeById(deps.treeData.value, stat.data.id) ?? stat.data,
      nodeId: stat.data.id,
      treeData: deps.treeData
    })
    requestProjectHierarchyTreeVirtualListUpdate(deps.treeComponentRef.value)
    deps.requestAnimationFrame(() => {
      requestProjectHierarchyTreeVirtualListUpdate(deps.treeComponentRef.value)
    })
  }
}
