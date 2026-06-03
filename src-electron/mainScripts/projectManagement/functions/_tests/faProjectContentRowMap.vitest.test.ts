import { expect, test } from 'vitest'

import {
  mapFaProjectDocumentRow,
  mapFaProjectNamedEntityRow
} from '../faProjectContentRowMap'

/**
 * mapFaProjectNamedEntityRow
 * Maps SQLite column names to the renderer-facing DTO.
 */
test('Test that mapFaProjectNamedEntityRow maps snake_case columns', () => {
  const mapped = mapFaProjectNamedEntityRow({
    id: '550e8400-e29b-41d4-a716-446655440000',
    display_name: 'Realm',
    created_at_ms: 1,
    updated_at_ms: 2
  })
  expect(mapped.displayName).toBe('Realm')
  expect(mapped.createdAtMs).toBe(1)
})

/**
 * mapFaProjectDocumentRow
 * Maps document FK columns and display name.
 */
test('Test that mapFaProjectDocumentRow maps template_id null', () => {
  const mapped = mapFaProjectDocumentRow({
    id: '650e8400-e29b-41d4-a716-446655440001',
    world_id: '750e8400-e29b-41d4-a716-446655440002',
    template_id: null,
    display_name: 'Doc',
    created_at_ms: 3,
    updated_at_ms: 4
  })
  expect(mapped.templateId).toBeNull()
  expect(mapped.worldId).toBe('750e8400-e29b-41d4-a716-446655440002')
})
