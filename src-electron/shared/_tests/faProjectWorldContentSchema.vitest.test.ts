import { expect, test } from 'vitest'

import {
  parseFaProjectWorldCreateInput,
  parseFaProjectWorldIdPayload,
  parseFaProjectWorldsSnapshotPayload,
  parseFaProjectWorldUpdatePayload
} from '../faProjectWorldContentSchema'

/**
 * parseFaProjectWorldCreateInput
 * Accepts a trimmed display name in a strict object.
 */
test('Test that parseFaProjectWorldCreateInput trims displayName', () => {
  const parsed = parseFaProjectWorldCreateInput({ displayName: '  Realm  ' })
  expect(parsed.displayName).toBe('Realm')
})

/**
 * parseFaProjectWorldUpdatePayload
 * Requires id and nested patch object.
 */
test('Test that parseFaProjectWorldUpdatePayload parses id and patch', () => {
  const parsed = parseFaProjectWorldUpdatePayload({
    id: '550e8400-e29b-41d4-a716-446655440000',
    patch: { displayName: 'New' }
  })
  expect(parsed.patch.displayName).toBe('New')
})

/**
 * parseFaProjectWorldIdPayload
 * Rejects non-uuid ids.
 */
test('Test that parseFaProjectWorldIdPayload rejects invalid uuid', () => {
  expect(() => parseFaProjectWorldIdPayload({ id: 'nope' })).toThrow()
})

/**
 * parseFaProjectWorldsSnapshotPayload
 * Rejects invalid color_pallete strings in snapshot items.
 */
test('Test that parseFaProjectWorldsSnapshotPayload rejects invalid colorPallete', () => {
  expect(() => parseFaProjectWorldsSnapshotPayload({
    items: [
      {
        colorPallete: 'not-a-palette',
        displayName: 'Realm',
        id: '550e8400-e29b-41d4-a716-446655440000'
      }
    ]
  })).toThrow()
})

/**
 * parseFaProjectWorldsSnapshotPayload
 * Rejects color_pallete strings with duplicate hex values (case-insensitive).
 */
test('Test that parseFaProjectWorldsSnapshotPayload rejects duplicate colorPallete colors', () => {
  expect(() => parseFaProjectWorldsSnapshotPayload({
    items: [
      {
        colorPallete: '#112233;#aabbcc;#112233',
        displayName: 'Realm',
        id: '550e8400-e29b-41d4-a716-446655440000'
      }
    ]
  })).toThrow()
})
