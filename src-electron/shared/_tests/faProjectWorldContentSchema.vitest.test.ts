import { expect, test } from 'vitest'

import {
  parseFaProjectWorldCreateInput,
  parseFaProjectWorldIdPayload,
  parseFaProjectWorldPatch,
  parseFaProjectWorldsSnapshotPayload,
  parseFaProjectWorldUpdatePayload
} from '../faProjectWorldContentSchema'

const SAMPLE_UUID = '550e8400-e29b-41d4-a716-446655440000'
const SAMPLE_PLACEMENT_UUID = '550e8400-e29b-41d4-a716-446655440001'
const SAMPLE_TEMPLATE_UUID = '550e8400-e29b-41d4-a716-446655440002'

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
        displayNameTranslations: { 'en-US': 'Realm' },
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
        displayNameTranslations: { 'en-US': 'Realm' },
        id: SAMPLE_UUID
      }
    ]
  })).toThrow()
})

/**
 * parseFaProjectWorldPatch
 * Accepts optional color, palette, displayName, and sortOrder fields.
 */
test('Test that parseFaProjectWorldPatch parses optional world patch fields', () => {
  const parsed = parseFaProjectWorldPatch({
    color: '#AABBCC',
    colorPallete: '#AABBCC;#112233',
    displayName: '  Realm  ',
    sortOrder: 2
  })
  expect(parsed).toEqual({
    color: '#AABBCC',
    colorPallete: '#AABBCC;#112233',
    displayName: 'Realm',
    sortOrder: 2
  })
})

/**
 * parseFaProjectWorldPatch
 * Drops undefined optional keys from the returned patch object.
 */
test('Test that parseFaProjectWorldPatch omits undefined optional keys', () => {
  expect(parseFaProjectWorldPatch({})).toEqual({})
})

/**
 * parseFaProjectWorldsSnapshotPayload
 * Maps optional color, colorPallete, and templateLayout snapshot fields.
 */
test('Test that parseFaProjectWorldsSnapshotPayload maps optional snapshot fields', () => {
  const parsed = parseFaProjectWorldsSnapshotPayload({
    items: [
      {
        color: '#AABBCC',
        colorPallete: '#AABBCC;#112233',
        displayNameTranslations: { 'en-US': 'Realm' },
        id: SAMPLE_UUID,
        templateLayout: {
          groups: [],
          placements: [{
            documentTemplateId: SAMPLE_TEMPLATE_UUID,
            groupId: null,
            groupSortOrder: null,
            id: SAMPLE_PLACEMENT_UUID,
            nicknamePluralTranslations: {},
            nicknameSingularTranslations: {},
            rootSortOrder: 0
          }]
        }
      }
    ]
  })
  expect(parsed[0]?.color).toBe('#AABBCC')
  expect(parsed[0]?.colorPallete).toBe('#AABBCC;#112233')
  expect(parsed[0]?.templateLayout?.placements).toHaveLength(1)
})

/**
 * parseFaProjectWorldPatch
 * Rejects invalid colorPallete strings in patch payloads.
 */
test('Test that parseFaProjectWorldPatch rejects invalid colorPallete', () => {
  expect(() => parseFaProjectWorldPatch({
    colorPallete: 'not-a-palette'
  })).toThrow()
})

/**
 * parseFaProjectWorldsSnapshotPayload
 * Maps snapshot items that only include color.
 */
test('Test that parseFaProjectWorldsSnapshotPayload maps color-only snapshot items', () => {
  const parsed = parseFaProjectWorldsSnapshotPayload({
    items: [
      {
        color: '#AABBCC',
        displayNameTranslations: { 'en-US': 'Realm' },
        id: SAMPLE_UUID
      }
    ]
  })
  expect(parsed[0]?.color).toBe('#AABBCC')
  expect(parsed[0]?.colorPallete).toBeUndefined()
  expect(parsed[0]?.templateLayout).toBeUndefined()
})

/**
 * parseFaProjectWorldsSnapshotPayload
 * Maps snapshot items that only include colorPallete.
 */
test('Test that parseFaProjectWorldsSnapshotPayload maps palette-only snapshot items', () => {
  const parsed = parseFaProjectWorldsSnapshotPayload({
    items: [
      {
        colorPallete: '#AABBCC;#112233',
        displayNameTranslations: { 'en-US': 'Realm' },
        id: SAMPLE_UUID
      }
    ]
  })
  expect(parsed[0]?.colorPallete).toBe('#AABBCC;#112233')
  expect(parsed[0]?.color).toBeUndefined()
})

/**
 * parseFaProjectWorldsSnapshotPayload
 * Maps snapshot items that only include templateLayout.
 */
test('Test that parseFaProjectWorldsSnapshotPayload maps templateLayout-only snapshot items', () => {
  const parsed = parseFaProjectWorldsSnapshotPayload({
    items: [
      {
        displayNameTranslations: { 'en-US': 'Realm' },
        id: SAMPLE_UUID,
        templateLayout: {
          groups: [],
          placements: [{
            documentTemplateId: SAMPLE_TEMPLATE_UUID,
            groupId: null,
            groupSortOrder: null,
            id: SAMPLE_PLACEMENT_UUID,
            nicknamePluralTranslations: {},
            nicknameSingularTranslations: {},
            rootSortOrder: 0
          }]
        }
      }
    ]
  })
  expect(parsed[0]?.templateLayout?.placements).toHaveLength(1)
  expect(parsed[0]?.color).toBeUndefined()
  expect(parsed[0]?.colorPallete).toBeUndefined()
})

/**
 * parseFaProjectWorldUpdatePayload
 * Drops undefined nested patch keys after parsing.
 */
test('Test that parseFaProjectWorldUpdatePayload drops undefined nested patch keys', () => {
  const parsed = parseFaProjectWorldUpdatePayload({
    id: SAMPLE_UUID,
    patch: {
      color: '#AABBCC',
      sortOrder: 1
    }
  })
  expect(parsed.patch).toEqual({
    color: '#AABBCC',
    sortOrder: 1
  })
})
