import { expect, test } from 'vitest'

import {
  findDialogProjectSettingsNewlyAppendedWorldId,
  isDialogProjectSettingsWorldSelectionInvalid,
  resolveDialogProjectSettingsInitialWorldId,
  resolveDialogProjectSettingsWorldIdAfterRemove,
  resolveDialogProjectSettingsWorldsPanelSelection
} from '../dialogProjectSettingsWorldsSelection'

const worldA = {
  color: '',
  colorPallete: '',
  displayName: 'Alpha',
  documentCount: 0,
  templateLayout: {
    groups: [],
    placements: []
  },
  id: '550e8400-e29b-41d4-a716-446655440000'
}

const worldB = {
  color: '',
  colorPallete: '',
  displayName: 'Beta',
  documentCount: 0,
  templateLayout: {
    groups: [],
    placements: []
  },
  id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
}

const worldC = {
  color: '',
  colorPallete: '',
  displayName: 'Gamma',
  documentCount: 0,
  templateLayout: {
    groups: [],
    placements: []
  },
  id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
}

/**
 * resolveDialogProjectSettingsInitialWorldId
 * Returns the first world id or null for an empty list.
 */
test('Test that resolveDialogProjectSettingsInitialWorldId picks the first world', () => {
  expect(resolveDialogProjectSettingsInitialWorldId([worldA, worldB])).toBe(worldA.id)
  expect(resolveDialogProjectSettingsInitialWorldId([])).toBeNull()
})

/**
 * isDialogProjectSettingsWorldSelectionInvalid
 * Flags null or missing ids in the current worlds list.
 */
test('Test that isDialogProjectSettingsWorldSelectionInvalid detects stale selection', () => {
  expect(isDialogProjectSettingsWorldSelectionInvalid([worldA], null)).toBe(true)
  expect(isDialogProjectSettingsWorldSelectionInvalid([worldA], worldB.id)).toBe(true)
  expect(isDialogProjectSettingsWorldSelectionInvalid([worldA], worldA.id)).toBe(false)
})

/**
 * resolveDialogProjectSettingsWorldIdAfterRemove
 * Keeps selection when another row was removed; otherwise picks a neighbor.
 */
test('Test that resolveDialogProjectSettingsWorldIdAfterRemove selects a neighbor of the removed row', () => {
  const before = [worldA, worldB, worldC]
  const afterRemoveB = [worldA, worldC]

  expect(resolveDialogProjectSettingsWorldIdAfterRemove(
    afterRemoveB,
    worldB.id,
    worldA.id,
    before
  )).toBe(worldA.id)

  expect(resolveDialogProjectSettingsWorldIdAfterRemove(
    afterRemoveB,
    worldB.id,
    worldB.id,
    before
  )).toBe(worldC.id)

  expect(resolveDialogProjectSettingsWorldIdAfterRemove(
    [worldA, worldC],
    worldB.id,
    worldB.id,
    [worldA, worldB, worldC]
  )).toBe(worldC.id)

  expect(resolveDialogProjectSettingsWorldIdAfterRemove(
    [worldB],
    worldA.id,
    worldA.id,
    [worldA, worldB]
  )).toBe(worldB.id)
})

/**
 * findDialogProjectSettingsNewlyAppendedWorldId
 * Detects a new id at the end after append.
 */
test('Test that findDialogProjectSettingsNewlyAppendedWorldId returns the appended world id', () => {
  const newWorld = {
    ...worldA,
    displayName: 'New world',
    id: '7ba7b811-9dad-11d1-80b4-00c04fd430c8'
  }
  const previous = [worldA, worldB]
  const next = [worldA, worldB, newWorld]

  expect(findDialogProjectSettingsNewlyAppendedWorldId(previous, next)).toBe(newWorld.id)
  expect(findDialogProjectSettingsNewlyAppendedWorldId(previous, [worldB, worldA])).toBeNull()
  expect(findDialogProjectSettingsNewlyAppendedWorldId(previous, [])).toBeNull()
})

/**
 * resolveDialogProjectSettingsWorldIdAfterRemove
 * Handles empty lists and stale selection when another row was removed.
 */
test('Test that resolveDialogProjectSettingsWorldIdAfterRemove handles edge removal cases', () => {
  expect(resolveDialogProjectSettingsWorldIdAfterRemove([], worldA.id, worldA.id, [worldA])).toBeNull()

  const before = [worldA, worldB]
  const afterRemoveB = [worldA]

  expect(resolveDialogProjectSettingsWorldIdAfterRemove(
    afterRemoveB,
    worldB.id,
    worldC.id,
    before
  )).toBe(worldA.id)

  expect(resolveDialogProjectSettingsWorldIdAfterRemove(
    afterRemoveB,
    'missing-id',
    worldA.id,
    before
  )).toBe(worldA.id)

  expect(resolveDialogProjectSettingsWorldIdAfterRemove(
    [worldA],
    worldC.id,
    worldC.id,
    [worldA, worldB, worldC]
  )).toBe(worldA.id)

  expect(resolveDialogProjectSettingsWorldIdAfterRemove(
    [worldA],
    worldB.id,
    worldB.id,
    [worldA]
  )).toBe(worldA.id)
})

/**
 * resolveDialogProjectSettingsWorldsPanelSelection
 * Selects an appended world when add world inserts at the bottom.
 */
test('Test that resolveDialogProjectSettingsWorldsPanelSelection selects an appended world', () => {
  const newWorld = {
    ...worldA,
    displayName: 'New world',
    id: '7ba7b811-9dad-11d1-80b4-00c04fd430c8'
  }

  expect(resolveDialogProjectSettingsWorldsPanelSelection(
    [worldA, newWorld],
    [worldA],
    worldA.id
  )).toBe(newWorld.id)
})

/**
 * resolveDialogProjectSettingsWorldsPanelSelection
 * Keeps a valid selection when the list changes without append or removal.
 */
test('Test that resolveDialogProjectSettingsWorldsPanelSelection keeps a valid selection', () => {
  expect(resolveDialogProjectSettingsWorldsPanelSelection(
    [worldA, worldB],
    [worldA, worldB],
    worldB.id
  )).toBe(worldB.id)
})

/**
 * resolveDialogProjectSettingsWorldsPanelSelection
 * Reselects when the worlds list is replaced with new ids.
 */
test('Test that resolveDialogProjectSettingsWorldsPanelSelection reselects after replacement', () => {
  const replacement = {
    ...worldA,
    displayName: 'Replacement',
    id: '7ba7b811-9dad-11d1-80b4-00c04fd430c8'
  }

  expect(resolveDialogProjectSettingsWorldsPanelSelection(
    [replacement],
    [worldA],
    worldA.id
  )).toBe(replacement.id)
})

test('Test that findDialogProjectSettingsNewlyAppendedWorldId returns null when append is not at the end', () => {
  const insertedMiddle = {
    ...worldA,
    displayName: 'Inserted',
    id: '7ba7b811-9dad-11d1-80b4-00c04fd430c8'
  }

  expect(findDialogProjectSettingsNewlyAppendedWorldId(
    [worldA, worldB],
    [worldA, insertedMiddle, worldB]
  )).toBeNull()
})

/**
 * resolveDialogProjectSettingsWorldsPanelSelection
 * Reselects the first world when the current selection is stale.
 */
test('Test that resolveDialogProjectSettingsWorldsPanelSelection reselects stale selection', () => {
  expect(resolveDialogProjectSettingsWorldsPanelSelection(
    [worldB],
    [worldA, worldB],
    worldA.id
  )).toBe(worldB.id)
})
