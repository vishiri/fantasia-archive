import type { Ref } from 'vue'

import { ResultAsync } from 'neverthrow'

import {
  shouldRunDragLayoutCommit,
  shouldScheduleDragLayoutCommit
} from './functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'

type T_dialogProjectSettingsLayoutDragCommitDeps = {
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  emitLayoutFromTreeDataIfChanged: () => void
  isTreeDragActive?: Ref<boolean>
  nextTick: () => Promise<void>
  removeDragCancelListeners: () => void
  suppressTreeEmit: Ref<boolean>
}

const layoutDragCommitSerialByFlag = new WeakMap<Ref<boolean>, { current: number }>()

function beginDialogProjectSettingsLayoutDragCommitSerial (
  dragCommitScheduled: Ref<boolean>
): number {
  const existing = layoutDragCommitSerialByFlag.get(dragCommitScheduled)
  const box = existing ?? { current: 0 }
  if (existing === undefined) {
    layoutDragCommitSerialByFlag.set(dragCommitScheduled, box)
  }
  box.current += 1
  return box.current
}

function isDialogProjectSettingsLayoutDragCommitSerialCurrent (
  dragCommitScheduled: Ref<boolean>,
  serial: number
): boolean {
  const box = layoutDragCommitSerialByFlag.get(dragCommitScheduled)
  if (box === undefined) {
    return true
  }
  return box.current === serial
}

function logDialogProjectSettingsLayoutDragCommitFailure (err: unknown): void {
  console.error('[dialogProjectSettingsWorldTemplateLayoutTree] drag commit nextTick chain failed', err)
}

function finishDialogProjectSettingsLayoutDragCommit (
  deps: T_dialogProjectSettingsLayoutDragCommitDeps
): void {
  deps.dragCommitPending.value = false
  deps.dragCommitScheduled.value = false
  deps.removeDragCancelListeners()
  if (!shouldRunDragLayoutCommit({
    suppressTreeEmit: deps.suppressTreeEmit.value
  })) {
    return
  }
  deps.emitLayoutFromTreeDataIfChanged()
}

function runDialogProjectSettingsLayoutDragCommit (
  deps: T_dialogProjectSettingsLayoutDragCommitDeps,
  serial: number
): void {
  window.requestAnimationFrame(() => {
    void ResultAsync.fromPromise(
      deps.nextTick().then(() => {
        return deps.nextTick()
      }).then(() => {
        if (!isDialogProjectSettingsLayoutDragCommitSerialCurrent(deps.dragCommitScheduled, serial)) {
          return
        }
        if (deps.isTreeDragActive?.value === true) {
          runDialogProjectSettingsLayoutDragCommit(deps, serial)
          return
        }
        finishDialogProjectSettingsLayoutDragCommit(deps)
      }),
      (error): unknown => error
    ).match(
      () => undefined,
      logDialogProjectSettingsLayoutDragCommitFailure
    )
  })
}

export function scheduleDialogProjectSettingsWorldTemplateLayoutTreeDragCommit (
  deps: T_dialogProjectSettingsLayoutDragCommitDeps
): void {
  if (!shouldScheduleDragLayoutCommit({
    dragCommitPending: deps.dragCommitPending.value,
    dragCommitScheduled: deps.dragCommitScheduled.value
  })) {
    return
  }
  deps.dragCommitScheduled.value = true
  const serial = beginDialogProjectSettingsLayoutDragCommitSerial(deps.dragCommitScheduled)
  runDialogProjectSettingsLayoutDragCommit(deps, serial)
}
