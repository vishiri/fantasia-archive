import { expect, test } from 'vitest'

import type { I_faProjectStylingRoot } from 'app/types/I_faProjectStylingDomain'

import { mergeProjectStylingRootAfterSilentPersist } from '../faProjectStylingPersistMerge'

const snapshot: I_faProjectStylingRoot = {
  css: 'from-db',
  frame: null,
  schemaVersion: 1
}

/**
 * mergeProjectStylingRootAfterSilentPersist
 * Preserves in-memory CSS when the silent patch omitted css.
 */
test('Test that mergeProjectStylingRootAfterSilentPersist keeps local css when patch omits css', () => {
  expect(mergeProjectStylingRootAfterSilentPersist(snapshot, {}, 'draft', 'draft')).toEqual({
    ...snapshot,
    css: 'draft'
  })
  expect(mergeProjectStylingRootAfterSilentPersist(
    snapshot,
    { css: 'saved' },
    'draft',
    'draft'
  )).toEqual(snapshot)
  expect(mergeProjectStylingRootAfterSilentPersist(
    snapshot,
    { css: 'saved' },
    '.typed{color:red}',
    'saved'
  )).toEqual({
    ...snapshot,
    css: '.typed{color:red}'
  })
})
