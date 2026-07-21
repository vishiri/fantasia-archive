import { expect, test } from 'vitest'

import {
  createMapFaProjectWorldRow,
  mapFaProjectDocumentRow,
  mapFaProjectNamedEntityRow
} from '../faProjectContentRowMap'

const mapFaProjectWorldRow = createMapFaProjectWorldRow({
  parseDisplayNameTranslationsJson: (raw) => JSON.parse(raw) as { 'en-US': string }
})

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
 * mapFaProjectWorldRow
 * Maps worlds color, sort_order, and display name translations columns.
 */
test('Test that mapFaProjectWorldRow maps color and sortOrder', () => {
  const mapped = mapFaProjectWorldRow({
    id: '750e8400-e29b-41d4-a716-446655440002',
    display_name: 'Realm',
    display_name_translations_json: '{"en-US":"Realm"}',
    color: '#808080',
    color_pallete: '#112233;#445566',
    sort_order: 2,
    created_at_ms: 5,
    updated_at_ms: 6
  })
  expect(mapped.color).toBe('#808080')
  expect(mapped.colorPallete).toBe('#112233;#445566')
  expect(mapped.sortOrder).toBe(2)
  expect(mapped.displayNameTranslations).toEqual({ 'en-US': 'Realm' })
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
    tree_placement_id: null,
    tree_parent_document_id: null,
    tree_custom_sort_order: 0,
    display_name: 'Doc',
    document_text_color: '#AABBCC',
    document_background_color: null,
    is_category: 0,
    is_finished: 0,
    is_minor: 0,
    is_dead: 0,
    tree_order_number: Number.MIN_SAFE_INTEGER,
    extra_classes: '',
    created_at_ms: 3,
    updated_at_ms: 4
  })
  expect(mapped.templateId).toBeNull()
  expect(mapped.placementId).toBeNull()
  expect(mapped.sortOrder).toBe(0)
  expect(mapped.documentTextColor).toBe('#AABBCC')
  expect(mapped.documentBackgroundColor).toBeNull()
  expect(mapped.worldId).toBe('750e8400-e29b-41d4-a716-446655440002')
})
