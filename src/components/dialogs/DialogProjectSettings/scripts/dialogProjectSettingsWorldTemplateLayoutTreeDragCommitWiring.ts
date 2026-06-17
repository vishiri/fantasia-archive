import type { Ref } from 'vue'

import {
  shouldRunDragLayoutCommit,
  shouldScheduleDragLayoutCommit
} from './functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'

export function scheduleDialogProjectSettingsWorldTemplateLayoutTreeDragCommit (deps: {
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  emitLayoutFromTreeDataIfChanged: () => void
  nextTick: () => Promise<void>
  removeDragCancelListeners: () => void
  suppressTreeEmit: Ref<boolean>
}): void {
  if (!shouldScheduleDragLayoutCommit({
    dragCommitPending: deps.dragCommitPending.value,
    dragCommitScheduled: deps.dragCommitScheduled.value
  })) {
    return
  }
  deps.dragCommitScheduled.value = true
  window.requestAnimationFrame(() => {
    void deps.nextTick().then(() => {
      return deps.nextTick()
    }).then(() => {
      deps.dragCommitPending.value = false
      deps.dragCommitScheduled.value = false
      deps.removeDragCancelListeners()
      if (!shouldRunDragLayoutCommit({
        suppressTreeEmit: deps.suppressTreeEmit.value
      })) {
        return
      }
      deps.emitLayoutFromTreeDataIfChanged()
    })
  })
}
