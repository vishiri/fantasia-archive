import type { Ref } from 'vue'

import {
  clearFaVerticalDraggableTabsDocumentDragCursor
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'

import {
  shouldClearDragSessionWithoutCommit
} from './functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'

export function createDialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring (deps: {
  clearDragSessionFlags: () => void
  dragCommitPending: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  nextTick: () => Promise<void>
  removeDragCancelListeners: () => void
}) {
  function finishDragSessionWithoutCommit (): void {
    if (!shouldClearDragSessionWithoutCommit({
      dragDropCommitted: deps.dragDropCommitted.value
    })) {
      return
    }
    deps.removeDragCancelListeners()
    clearFaVerticalDraggableTabsDocumentDragCursor()
    deps.clearDragSessionFlags()
  }

  function onWindowPointerUpDuringDrag (): void {
    void deps.nextTick().then(() => {
      if (deps.dragDropCommitted.value || !deps.dragCommitPending.value) {
        return
      }
      finishDragSessionWithoutCommit()
    }).catch((err: unknown) => {
      console.error('[dialogProjectSettingsWorldTemplateLayoutTree] drag cancel nextTick chain failed', err)
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
