import { expect, test } from 'vitest'

import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'

import {
  applyFaActionHistoryEntryStatusPatch,
  FA_ACTION_HISTORY_MAX,
  trimFaActionHistoryRingBuffer
} from '../faActionManagerHistoryRing'

function makeHistoryRow (uid: string): I_faActionHistoryEntry {
  return {
    enqueuedAt: 1,
    id: 'openChangelogDialog',
    kind: 'async',
    status: 'queued',
    uid
  }
}

/**
 * applyFaActionHistoryEntryStatusPatch
 * Applies only defined patch fields onto an existing row.
 */
test('Test that applyFaActionHistoryEntryStatusPatch updates defined fields only', () => {
  const row = makeHistoryRow('a')
  applyFaActionHistoryEntryStatusPatch(row, {
    startedAt: 99,
    status: 'running'
  })
  expect(row.startedAt).toBe(99)
  expect(row.status).toBe('running')
  expect(row.finishedAt).toBeUndefined()
})

/**
 * trimFaActionHistoryRingBuffer
 * Removes oldest rows when length exceeds FA_ACTION_HISTORY_MAX.
 */
test('Test that trimFaActionHistoryRingBuffer drops oldest rows at the cap', () => {
  const rows: I_faActionHistoryEntry[] = []
  for (let index = 0; index < FA_ACTION_HISTORY_MAX + 3; index += 1) {
    rows.push(makeHistoryRow(`uid-${index}`))
  }
  trimFaActionHistoryRingBuffer(rows)
  expect(rows).toHaveLength(FA_ACTION_HISTORY_MAX)
  expect(rows[0]?.uid).toBe('uid-3')
})
