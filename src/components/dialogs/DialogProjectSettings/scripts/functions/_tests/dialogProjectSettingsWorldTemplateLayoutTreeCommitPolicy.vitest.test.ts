import { expect, test } from 'vitest'

import {
  shouldAcceptHeTreeModelValueUpdate,
  shouldClearDragSessionWithoutCommit,
  shouldRunDragLayoutCommit,
  shouldScheduleDragLayoutCommit
} from '../dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy
 * Suppress flag blocks he-tree model updates during prop resync.
 */
test('Test that shouldAcceptHeTreeModelValueUpdate rejects updates while suppressTreeEmit is true', () => {
  expect(shouldAcceptHeTreeModelValueUpdate({
    dragCommitPending: true,
    isTreeDragActive: true,
    suppressTreeEmit: true
  })).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy
 * Accepts model updates during active drag or pending commit window.
 */
test('Test that shouldAcceptHeTreeModelValueUpdate accepts drag and pending commit updates', () => {
  expect(shouldAcceptHeTreeModelValueUpdate({
    dragCommitPending: false,
    isTreeDragActive: true,
    suppressTreeEmit: false
  })).toBe(true)
  expect(shouldAcceptHeTreeModelValueUpdate({
    dragCommitPending: true,
    isTreeDragActive: false,
    suppressTreeEmit: false
  })).toBe(true)
  expect(shouldAcceptHeTreeModelValueUpdate({
    dragCommitPending: false,
    isTreeDragActive: false,
    suppressTreeEmit: false
  })).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy
 * Double schedule guard returns false when commit already scheduled.
 */
test('Test that shouldScheduleDragLayoutCommit allows only one pending commit', () => {
  expect(shouldScheduleDragLayoutCommit({
    dragCommitPending: true,
    dragCommitScheduled: false
  })).toBe(true)
  expect(shouldScheduleDragLayoutCommit({
    dragCommitPending: true,
    dragCommitScheduled: true
  })).toBe(false)
  expect(shouldScheduleDragLayoutCommit({
    dragCommitPending: false,
    dragCommitScheduled: false
  })).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy
 * Cancel cleanup clears session when after-drop did not commit.
 */
test('Test that shouldClearDragSessionWithoutCommit is true only for cancelled drags', () => {
  expect(shouldClearDragSessionWithoutCommit({
    dragDropCommitted: false
  })).toBe(true)
  expect(shouldClearDragSessionWithoutCommit({
    dragDropCommitted: true
  })).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy
 * Layout commit is skipped while suppressTreeEmit is active.
 */
test('Test that shouldRunDragLayoutCommit respects suppressTreeEmit', () => {
  expect(shouldRunDragLayoutCommit({
    suppressTreeEmit: false
  })).toBe(true)
  expect(shouldRunDragLayoutCommit({
    suppressTreeEmit: true
  })).toBe(false)
})
