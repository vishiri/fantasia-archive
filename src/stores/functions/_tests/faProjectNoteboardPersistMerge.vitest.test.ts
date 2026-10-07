import { expect, test } from 'vitest'

import type { I_faProjectNoteboardRoot } from 'app/types/I_faProjectNoteboardDomain'

import {
  mergeNoteboardRootKeepingTextTypedDuringRead,
  mergeProjectNoteboardRootAfterSilentPersist
} from '../faProjectNoteboardPersistMerge'

const snapshot: I_faProjectNoteboardRoot = {
  frame: null,
  schemaVersion: 1,
  text: 'from-db'
}

/**
 * mergeProjectNoteboardRootAfterSilentPersist
 * Preserves in-memory text when the silent patch omitted text.
 */
test('Test that mergeProjectNoteboardRootAfterSilentPersist keeps local text when patch omits text', () => {
  expect(mergeProjectNoteboardRootAfterSilentPersist(snapshot, {}, 'draft', 'draft')).toEqual({
    ...snapshot,
    text: 'draft'
  })
  expect(mergeProjectNoteboardRootAfterSilentPersist(
    snapshot,
    { text: 'saved' },
    'draft',
    'draft'
  )).toEqual(snapshot)
  expect(mergeProjectNoteboardRootAfterSilentPersist(
    snapshot,
    { text: 'saved' },
    'typed-during-save',
    'saved'
  )).toEqual({
    ...snapshot,
    text: 'typed-during-save'
  })
})

/**
 * mergeNoteboardRootKeepingTextTypedDuringRead
 * A read that finishes late does not replace text typed while it was in flight.
 */
test('Test that mergeNoteboardRootKeepingTextTypedDuringRead keeps text typed during the read', () => {
  expect(mergeNoteboardRootKeepingTextTypedDuringRead(
    snapshot,
    'typed',
    ''
  )).toEqual({
    ...snapshot,
    text: 'typed'
  })
  expect(mergeNoteboardRootKeepingTextTypedDuringRead(
    snapshot,
    'from-db',
    'from-db'
  )).toEqual(snapshot)
})
