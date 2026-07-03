import type { Ref } from 'vue'

import {
  clearFaVerticalDraggableTabsDocumentDragCursor
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'

import {
  shouldClearDragSessionWithoutCommit
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import { remountProjectHierarchyTreeAndRestoreExpandedSnapshot } from './projectHierarchyTreeMountRemountWiring'

export function createProjectHierarchyTreeDragCancelWiring (deps: {
  clearDragSessionFlags: () => void
  dragCommitPending: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  dragExpandedSnapshot: () => string[] | null
  nextTick: () => Promise<void>
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
}) {
  function removeDragCancelListeners (): void {
    window.removeEventListener('pointerup', onWindowPointerUpDuringDrag)
    window.removeEventListener('keydown', onWindowKeydownDuringDrag)
  }

  function attachDragCancelListeners (): void {
    window.addEventListener('pointerup', onWindowPointerUpDuringDrag)
    window.addEventListener('keydown', onWindowKeydownDuringDrag)
  }
  function finishDragSessionWithoutCommit (): void {
    if (!shouldClearDragSessionWithoutCommit({
      dragDropCommitted: deps.dragDropCommitted.value
    })) {
      return
    }
    removeDragCancelListeners()
    clearFaVerticalDraggableTabsDocumentDragCursor()
    deps.resyncTreeDataFromLayout()
    const expandedSnapshot = deps.dragExpandedSnapshot() ?? []
    void remountProjectHierarchyTreeAndRestoreExpandedSnapshot({
      expandedNodeIds: expandedSnapshot,
      nextTick: deps.nextTick,
      restoreExpandedSnapshot: deps.restoreExpandedSnapshot
    }).finally(() => {
      deps.dragExpandPostCommitGuard.value = false
      deps.dragExpandUiFrozen.value = false
      deps.clearDragSessionFlags()
    })
  }

  function onWindowPointerUpDuringDrag (): void {
    void deps.nextTick().then(() => {
      if (deps.dragDropCommitted.value) {
        return
      }
      finishDragSessionWithoutCommit()
    }).catch((err: unknown) => {
      console.error('[ProjectHierarchyTree] drag cancel nextTick chain failed', err)
    })
  }

  function onWindowKeydownDuringDrag (event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      return
    }
    finishDragSessionWithoutCommit()
  }

  return {
    attachDragCancelListeners,
    finishDragSessionWithoutCommit,
    onWindowKeydownDuringDrag,
    onWindowPointerUpDuringDrag,
    removeDragCancelListeners
  }
}
