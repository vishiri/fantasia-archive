import { expect, test } from 'vitest'

import type { I_faSqlMediaRow } from 'app/types/I_faProjectContentRowMap'
import {
  createMapFaProjectWorldRow,
  mapFaProjectMediaRow,
  mapFaProjectNamedEntityRow
} from '../faProjectContentRowMap'
import { mapFaProjectDocumentRow } from '../faProjectDocumentRowMap'

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
    color_palette: '#112233;#445566',
    sort_order: 2,
    created_at_ms: 5,
    updated_at_ms: 6
  })
  expect(mapped.color).toBe('#808080')
  expect(mapped.colorPalette).toBe('#112233;#445566')
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

function buildFaSqlMediaRowFixture (overrides: Partial<I_faSqlMediaRow> = {}): I_faSqlMediaRow {
  return {
    id: '850e8400-e29b-41d4-a716-446655440003',
    display_name: 'Pic',
    type: 'external',
    internal_type: '',
    external_type: '',
    external_link: '',
    external_embed: '',
    internal_link: '',
    internal_embed: null,
    created_at_ms: 7,
    updated_at_ms: 8,
    ...overrides
  }
}

/**
 * mapFaProjectMediaRow
 * Maps media type, link, and embed columns; empty BLOB bytes become null.
 */
test('Test that mapFaProjectMediaRow maps type columns and empty embed', () => {
  const mapped = mapFaProjectMediaRow(buildFaSqlMediaRowFixture())
  expect(mapped.type).toBe('external')
  expect(mapped.internalType).toBe('')
  expect(mapped.externalType).toBe('')
  expect(mapped.externalLink).toBe('')
  expect(mapped.externalEmbed).toBe('')
  expect(mapped.internalLink).toBe('')
  expect(mapped.internalEmbed).toBeNull()
})

test('Test that mapFaProjectMediaRow maps internal embedded rows and non-empty embed', () => {
  const bytes = new Uint8Array([1, 2, 3])
  const mapped = mapFaProjectMediaRow(buildFaSqlMediaRowFixture({
    type: 'internal',
    internal_type: 'embedded',
    internal_embed: bytes
  }))
  expect(mapped.type).toBe('internal')
  expect(mapped.internalType).toBe('embedded')
  expect(mapped.internalEmbed).toBe(bytes)
})

test('Test that mapFaProjectMediaRow maps linked types and empty Uint8Array embed to null', () => {
  const mapped = mapFaProjectMediaRow(buildFaSqlMediaRowFixture({
    type: 'unknown',
    internal_type: 'linked_outside',
    external_type: 'linked',
    external_link: 'https://example.test/a',
    internal_link: 'C:\\media\\a.png',
    internal_embed: new Uint8Array()
  }))
  expect(mapped.type).toBe('external')
  expect(mapped.internalType).toBe('linked_outside')
  expect(mapped.externalType).toBe('linked')
  expect(mapped.externalLink).toBe('https://example.test/a')
  expect(mapped.internalLink).toBe('C:\\media\\a.png')
  expect(mapped.internalEmbed).toBeNull()
})

test('Test that mapFaProjectMediaRow maps linked_in_project internal_type', () => {
  const mapped = mapFaProjectMediaRow(buildFaSqlMediaRowFixture({
    internal_type: 'linked_in_project'
  }))
  expect(mapped.internalType).toBe('linked_in_project')
})

test('Test that mapFaProjectMediaRow maps unknown internal_type including legacy linked to empty', () => {
  const mapped = mapFaProjectMediaRow(buildFaSqlMediaRowFixture({
    internal_type: 'linked'
  }))
  expect(mapped.internalType).toBe('')
})

test('Test that mapFaProjectMediaRow maps embed external_type and external_embed', () => {
  const mapped = mapFaProjectMediaRow(buildFaSqlMediaRowFixture({
    external_type: 'embed',
    external_embed: '<iframe></iframe>'
  }))
  expect(mapped.externalType).toBe('embed')
  expect(mapped.externalEmbed).toBe('<iframe></iframe>')
})

test('Test that mapFaProjectMediaRow maps unknown external_type to empty', () => {
  const mapped = mapFaProjectMediaRow(buildFaSqlMediaRowFixture({
    external_type: 'nope'
  }))
  expect(mapped.externalType).toBe('')
})
