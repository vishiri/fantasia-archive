import type { Ref } from 'vue'

import {
  clearFaVerticalDraggableTabsDocumentDragCursor
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'

import {
  shouldClearDragSessionWithoutCommit
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import { remountProjectHierarchyTreeAndRestoreExpandedSnapshot } from './projectHierarchyTreeMountRemountWiring'

export function createProjectHierarchyTreeDragCancelWiring (deps: {
  bumpTreeMountKey: () => void
  clearDragSessionFlags: () => void
  dragCommitPending: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  dragExpandedSnapshot: () => string[] | null
  nextTick: () => Promise<void>
  removeDragCancelListeners: () => void
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (expandedNodeIds: string[]) => Promise<void>
}) {
  function finishDragSessionWithoutCommit (): void {
    if (!shouldClearDragSessionWithoutCommit({
      dragDropCommitted: deps.dragDropCommitted.value
    })) {
      return
    }
    deps.removeDragCancelListeners()
    clearFaVerticalDraggableTabsDocumentDragCursor()
    deps.resyncTreeDataFromLayout()
    const expandedSnapshot = deps.dragExpandedSnapshot() ?? []
    void remountProjectHierarchyTreeAndRestoreExpandedSnapshot({
      bumpTreeMountKey: deps.bumpTreeMountKey,
      expandedNodeIds: expandedSnapshot,
      nextTick: deps.nextTick,
      restoreExpandedSnapshot: deps.restoreExpandedSnapshot
    }).finally(() => {
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
    finishDragSessionWithoutCommit,
    onWindowKeydownDuringDrag,
    onWindowPointerUpDuringDrag
  }
}
