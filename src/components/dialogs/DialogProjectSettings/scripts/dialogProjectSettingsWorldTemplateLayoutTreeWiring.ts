import type { Ref } from 'vue'

import {
  applyFaVerticalDraggableTabsDocumentDragCursor,
  clearFaVerticalDraggableTabsDocumentDragCursor
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsWorldTemplateLayoutTreeWiringApi } from 'app/types/I_dialogProjectSettingsWorldTemplateLayoutTreeWiring'

import { createDialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring'
import { scheduleDialogProjectSettingsWorldTemplateLayoutTreeDragCommit } from './dialogProjectSettingsWorldTemplateLayoutTreeDragCommitWiring'
import {
  shouldAcceptHeTreeModelValueUpdate,
  shouldClearDragSessionWithoutCommit
} from './functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'

export function createDialogProjectSettingsWorldTemplateLayoutTreeWiring (deps: {
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  emitLayoutFromTreeDataIfChanged: () => void
  isTreeDragActive: Ref<boolean>
  nextTick: () => Promise<void>
  resyncTreeDataFromProps: () => void
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[]>
}): I_dialogProjectSettingsWorldTemplateLayoutTreeWiringApi {
  function clearDragSessionFlags (): void {
    deps.isTreeDragActive.value = false
    deps.dragCommitPending.value = false
    deps.dragCommitScheduled.value = false
    deps.dragDropCommitted.value = false
  }

  function removeDragCancelListeners (): void {
    window.removeEventListener('pointerup', dragCancelWiring.onWindowPointerUpDuringDrag)
    window.removeEventListener('keydown', dragCancelWiring.onWindowKeydownDuringDrag)
  }

  const dragCancelWiring = createDialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring({
    clearDragSessionFlags,
    dragCommitPending: deps.dragCommitPending,
    dragDropCommitted: deps.dragDropCommitted,
    nextTick: deps.nextTick,
    removeDragCancelListeners
  })

  function onBeforeDragStart (): void {
    deps.dragDropCommitted.value = false
    deps.dragCommitScheduled.value = false
    deps.isTreeDragActive.value = true
    deps.dragCommitPending.value = true
    applyFaVerticalDraggableTabsDocumentDragCursor()
    window.addEventListener('pointerup', dragCancelWiring.onWindowPointerUpDuringDrag)
    window.addEventListener('keydown', dragCancelWiring.onWindowKeydownDuringDrag)
  }

  function onTreeAfterDrop (): void {
    deps.dragDropCommitted.value = true
    scheduleDialogProjectSettingsWorldTemplateLayoutTreeDragCommit({
      dragCommitPending: deps.dragCommitPending,
      dragCommitScheduled: deps.dragCommitScheduled,
      emitLayoutFromTreeDataIfChanged: deps.emitLayoutFromTreeDataIfChanged,
      nextTick: deps.nextTick,
      removeDragCancelListeners,
      suppressTreeEmit: deps.suppressTreeEmit
    })
  }

  function onTreeDragEndCleanup (): void {
    deps.isTreeDragActive.value = false
    clearFaVerticalDraggableTabsDocumentDragCursor()
    removeDragCancelListeners()
    if (shouldClearDragSessionWithoutCommit({
      dragDropCommitted: deps.dragDropCommitted.value
    })) {
      deps.dragCommitPending.value = false
      deps.dragCommitScheduled.value = false
    }
  }

  function onTreeDataUpdate (nextNodes: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[]): void {
    if (!shouldAcceptHeTreeModelValueUpdate({
      dragCommitPending: deps.dragCommitPending.value,
      isTreeDragActive: deps.isTreeDragActive.value,
      suppressTreeEmit: deps.suppressTreeEmit.value
    })) {
      return
    }
    deps.treeData.value = nextNodes
  }

  function onUnmountedCleanup (): void {
    removeDragCancelListeners()
    clearFaVerticalDraggableTabsDocumentDragCursor()
    clearDragSessionFlags()
  }

  return {
    clearDragSessionFlags,
    emitLayoutFromTreeDataIfChanged: deps.emitLayoutFromTreeDataIfChanged,
    finishDragSessionWithoutCommit: dragCancelWiring.finishDragSessionWithoutCommit,
    onBeforeDragStart,
    onTreeAfterDrop,
    onTreeDataUpdate,
    onTreeDragEndCleanup,
    onUnmountedCleanup,
    removeDragCancelListeners,
    resyncTreeDataFromProps: deps.resyncTreeDataFromProps
  }
}
