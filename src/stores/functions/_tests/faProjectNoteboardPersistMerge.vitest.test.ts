import { expect, test } from 'vitest'

import type { I_faProjectNoteboardRoot } from 'app/types/I_faProjectNoteboardDomain'

import { mergeProjectNoteboardRootAfterSilentPersist } from '../faProjectNoteboardPersistMerge'

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
  expect(mergeProjectNoteboardRootAfterSilentPersist(snapshot, {}, 'draft')).toEqual({
    ...snapshot,
    text: 'draft'
  })
  expect(mergeProjectNoteboardRootAfterSilentPersist(snapshot, { text: 'saved' }, 'draft')).toEqual(snapshot)
})
