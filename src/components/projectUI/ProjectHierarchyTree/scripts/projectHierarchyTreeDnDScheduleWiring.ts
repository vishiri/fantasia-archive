import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  shouldRunDragLayoutCommit,
  shouldScheduleDragLayoutCommit
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import { clearFaVerticalDraggableTabsDocumentDragCursor } from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import { commitProjectHierarchyTreeDraggedDocumentMove } from './projectHierarchyTreeDnDCommitWiring'
import { openProjectHierarchyTreeNestParentAfterDragDrop } from './projectHierarchyTreeNestParentOpenWiring'
import { remountProjectHierarchyTreeAndRestoreExpandedSnapshot } from './projectHierarchyTreeMountRemountWiring'
import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'

type T_projectHierarchyTreeDragCommitScheduleDeps = {
  bumpTreeMountKey: () => void
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  dragExpandedSnapshot: () => string[] | null
  draggedDocumentId: () => string | null
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  getTreeRef: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeInstance | null
  loadChildrenForNode: (node: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  markNodeClosed: (nodeId: string, node: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeNode) => void
  markNodeOpen: (nodeId: string) => void
  moveDocumentInHierarchy: (input: {
    documentId: string
    targetParentDocumentId: string | null
    targetSortOrder: number
  }) => Promise<unknown>
  nextTick: () => Promise<void>
  refreshLayout: () => Promise<void>
  removeDragCancelListeners: () => void
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (expandedNodeIds: string[]) => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}

async function finishProjectHierarchyTreeDragCommit (
  deps: T_projectHierarchyTreeDragCommitScheduleDeps
): Promise<void> {
  deps.dragCommitPending.value = false
  deps.dragCommitScheduled.value = false
  deps.removeDragCancelListeners()
  clearFaVerticalDraggableTabsDocumentDragCursor()
  if (!shouldRunDragLayoutCommit({
    suppressTreeEmit: deps.suppressTreeEmit.value
  })) {
    deps.dragExpandUiFrozen.value = false
    return
  }
  const expandedSnapshot = deps.dragExpandedSnapshot() ?? []
  const commitResult = await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: deps.draggedDocumentId(),
    moveDocumentInHierarchy: deps.moveDocumentInHierarchy,
    refreshLayout: deps.refreshLayout,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    treeData: deps.treeData.value
  })
  for (const nodeId of commitResult.emptiedParentDocumentIds) {
    const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (node !== null) {
      deps.markNodeClosed(nodeId, node)
    }
  }
  await remountProjectHierarchyTreeAndRestoreExpandedSnapshot({
    bumpTreeMountKey: deps.bumpTreeMountKey,
    expandedNodeIds: expandedSnapshot,
    nextTick: deps.nextTick,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot
  })
  if (
    commitResult.committed &&
    commitResult.nestParentDocumentId !== null
  ) {
    await openProjectHierarchyTreeNestParentAfterDragDrop({
      flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
      getTreeRef: deps.getTreeRef,
      loadChildrenForNode: deps.loadChildrenForNode,
      markNodeOpen: deps.markNodeOpen,
      nestParentDocumentId: commitResult.nestParentDocumentId,
      nextTick: deps.nextTick,
      treeData: deps.treeData
    })
  }
  await deps.nextTick()
  await deps.nextTick()
  deps.dragExpandUiFrozen.value = false
}

export function scheduleProjectHierarchyTreeDragCommit (
  deps: T_projectHierarchyTreeDragCommitScheduleDeps
): void {
  if (!shouldScheduleDragLayoutCommit({
    dragCommitPending: deps.dragCommitPending.value,
    dragCommitScheduled: deps.dragCommitScheduled.value
  })) {
    return
  }
  deps.dragCommitScheduled.value = true
  const logNextTickFailure = (err: unknown): void => {
    console.error('[ProjectHierarchyTree] drag commit nextTick chain failed', err)
  }
  window.requestAnimationFrame(() => {
    void deps.nextTick().then(() => {
      return deps.nextTick()
    }).then(() => finishProjectHierarchyTreeDragCommit(deps)).catch(logNextTickFailure)
  })
}
