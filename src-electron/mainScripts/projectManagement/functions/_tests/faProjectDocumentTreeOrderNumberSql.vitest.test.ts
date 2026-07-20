import { expect, test } from 'vitest'

import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'

import {
  resolveFaProjectDocumentTreeOrderNumberForCreateInput,
  resolveFaProjectDocumentTreeOrderNumberForUpdate
} from '../faProjectDocumentTreeOrderNumberSql'

const FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY = Number.MIN_SAFE_INTEGER

const existingRow = {
  tree_order_number: 12
} as I_faSqlProjectDocumentRow

test('Test that create input resolves empty sentinel when treeOrderNumber omitted', () => {
  const resolved = resolveFaProjectDocumentTreeOrderNumberForCreateInput({
    worldId: 'world-1',
    displayName: 'Doc'
  })
  expect(resolved).toBe(FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY)
})

test('Test that create input returns explicit treeOrderNumber', () => {
  const resolved = resolveFaProjectDocumentTreeOrderNumberForCreateInput({
    worldId: 'world-1',
    displayName: 'Doc',
    treeOrderNumber: 42
  })
  expect(resolved).toBe(42)
})

test('Test that update patch preserves existing tree_order_number when omitted', () => {
  const resolved = resolveFaProjectDocumentTreeOrderNumberForUpdate(
    { displayName: 'Renamed' },
    existingRow
  )
  expect(resolved).toBe(12)
})

test('Test that update patch applies explicit treeOrderNumber', () => {
  const resolved = resolveFaProjectDocumentTreeOrderNumberForUpdate(
    { treeOrderNumber: 99 },
    existingRow
  )
  expect(resolved).toBe(99)
})
