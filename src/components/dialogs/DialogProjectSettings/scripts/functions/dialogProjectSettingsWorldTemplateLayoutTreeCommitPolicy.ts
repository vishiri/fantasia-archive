export function shouldAcceptHeTreeModelValueUpdate (input: {
  dragCommitPending: boolean
  isTreeDragActive: boolean
  suppressTreeEmit: boolean
}): boolean {
  if (input.suppressTreeEmit) {
    return false
  }
  return input.isTreeDragActive || input.dragCommitPending
}

export function shouldScheduleDragLayoutCommit (input: {
  dragCommitPending: boolean
  dragCommitScheduled: boolean
}): boolean {
  if (!input.dragCommitPending) {
    return false
  }
  return !input.dragCommitScheduled
}

export function shouldRunDragLayoutCommit (input: {
  suppressTreeEmit: boolean
}): boolean {
  return !input.suppressTreeEmit
}

export function shouldClearDragSessionWithoutCommit (input: {
  dragDropCommitted: boolean
}): boolean {
  return !input.dragDropCommitted
}
