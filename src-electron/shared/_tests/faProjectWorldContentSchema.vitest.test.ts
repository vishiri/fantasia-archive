import { expect, test } from 'vitest'

import {
  parseFaProjectWorldCreateInput,
  parseFaProjectWorldIdPayload,
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
