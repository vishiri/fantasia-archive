import type { Ref } from 'vue'
import { clearFaVerticalDraggableTabsDocumentDragCursor } from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import { shouldClearDragSessionWithoutCommit } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import {
  isProjectHierarchyTreeDragSessionSerialCurrent,
  readProjectHierarchyTreeDragSessionSerial
} from './projectHierarchyTreeDnDCommitGateWiring'
import { remountProjectHierarchyTreeAndRestoreExpandedSnapshot } from './projectHierarchyTreeDnDRemountWiring'
import { runWithPreservedProjectHierarchyTreeScrollTop } from './projectHierarchyTreeScrollPreserveWiring'

function releaseHierarchyDragCancelWithoutSnapshot (deps: {
  clearDragSessionFlags: () => void
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  removeDragCancelListeners: () => void
}): void {
  deps.removeDragCancelListeners()
  clearFaVerticalDraggableTabsDocumentDragCursor()
  deps.dragExpandPostCommitGuard.value = false
  deps.dragExpandUiFrozen.value = false
  deps.clearDragSessionFlags()
}

type T_hierarchyDragCancelFinishDeps = {
  clearDragSessionFlags: () => void
  dragDropCommitted: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  dragExpandedSnapshot: () => string[] | null
  getTreeScrollHost: () => HTMLElement | null
  nextTick: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
}

export function finishHierarchyDragSessionWithoutCommit (
  deps: T_hierarchyDragCancelFinishDeps,
  session: { cancelFinishSerial: number | null },
  removeDragCancelListeners: () => void
): void {
  if (!shouldClearDragSessionWithoutCommit({
    dragDropCommitted: deps.dragDropCommitted.value
  })) {
    return
  }
  const sessionSerial = readProjectHierarchyTreeDragSessionSerial(deps.dragExpandUiFrozen)
  if (session.cancelFinishSerial === sessionSerial) {
    return
  }
  const dragSessionStillCurrent = (): boolean => {
    return isProjectHierarchyTreeDragSessionSerialCurrent(
      deps.dragExpandUiFrozen,
      sessionSerial
    )
  }
  if (!dragSessionStillCurrent()) {
    return
  }
  const expandedSnapshot = deps.dragExpandedSnapshot()
  if (expandedSnapshot === null) {
    session.cancelFinishSerial = sessionSerial
    releaseHierarchyDragCancelWithoutSnapshot({
      clearDragSessionFlags: deps.clearDragSessionFlags,
      dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
      dragExpandUiFrozen: deps.dragExpandUiFrozen,
      removeDragCancelListeners
    })
    return
  }
  session.cancelFinishSerial = sessionSerial
  removeDragCancelListeners()
  clearFaVerticalDraggableTabsDocumentDragCursor()
  deps.resyncTreeDataFromLayout()
  void runWithPreservedProjectHierarchyTreeScrollTop({
    getTreeScrollHost: deps.getTreeScrollHost,
    nextTick: deps.nextTick,
    requestAnimationFrame: deps.requestAnimationFrame,
    run: async () => {
      await remountProjectHierarchyTreeAndRestoreExpandedSnapshot({
        expandedNodeIds: expandedSnapshot,
        isDragSessionStillCurrent: dragSessionStillCurrent,
        nextTick: deps.nextTick,
        restoreExpandedSnapshot: deps.restoreExpandedSnapshot
      })
    }
  }).finally(() => {
    if (!dragSessionStillCurrent()) {
      return
    }
    deps.dragExpandPostCommitGuard.value = false
    deps.dragExpandUiFrozen.value = false
    deps.clearDragSessionFlags()
  })
}
