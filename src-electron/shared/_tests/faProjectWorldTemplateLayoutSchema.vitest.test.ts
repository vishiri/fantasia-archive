import { expect, test } from 'vitest'

import {
  parseFaProjectWorldTemplateLayoutSnapshot
} from '../faProjectWorldTemplateLayoutSchema'

const SAMPLE_UUID = '550e8400-e29b-41d4-a716-446655440000'
const SAMPLE_UUID_B = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/**
 * parseFaProjectWorldTemplateLayoutSnapshot
 * Accepts valid root and grouped placement rows.
 */
test('Test that parseFaProjectWorldTemplateLayoutSnapshot accepts valid layout payloads', () => {
  const parsed = parseFaProjectWorldTemplateLayoutSnapshot({
    groups: [
      {
        displayName: 'Creatures',
        displayNameTranslations: { 'en-US': 'Creatures' },
        id: SAMPLE_UUID,
        rootSortOrder: 0
      }
    ],
    placements: [
      {
        documentTemplateId: SAMPLE_UUID_B,
        groupId: null,
        groupSortOrder: null,
        id: SAMPLE_UUID,
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        rootSortOrder: 1
      },
      {
        documentTemplateId: SAMPLE_UUID,
        groupId: SAMPLE_UUID,
        groupSortOrder: 0,
        id: SAMPLE_UUID_B,
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        rootSortOrder: null
      }
    ]
  })
  expect(parsed.groups).toHaveLength(1)
  expect(parsed.placements).toHaveLength(2)
})

/**
 * parseFaProjectWorldTemplateLayoutSnapshot
 * Rejects invalid root and grouped placement sort combinations.
 */
test('Test that parseFaProjectWorldTemplateLayoutSnapshot rejects invalid placement sort fields', () => {
  expect(() => parseFaProjectWorldTemplateLayoutSnapshot({
    groups: [],
    placements: [
      {
        documentTemplateId: SAMPLE_UUID,
        groupId: null,
        groupSortOrder: 0,
        id: SAMPLE_UUID_B,
        rootSortOrder: 0
      }
    ]
  })).toThrow()
  expect(() => parseFaProjectWorldTemplateLayoutSnapshot({
    groups: [],
    placements: [
      {
        documentTemplateId: SAMPLE_UUID,
        groupId: SAMPLE_UUID_B,
        groupSortOrder: null,
        id: SAMPLE_UUID,
        rootSortOrder: 0
      }
    ]
  })).toThrow()
})

/**
 * parseFaProjectWorldTemplateLayoutSnapshot
 * Rejects layout groups without any display name translation.
 */
test('Test that parseFaProjectWorldTemplateLayoutSnapshot rejects blank group translation maps', () => {
  expect(() => parseFaProjectWorldTemplateLayoutSnapshot({
    groups: [
      {
        displayNameTranslations: {},
        id: SAMPLE_UUID,
        rootSortOrder: 0
      }
    ],
    placements: []
  })).toThrow()
})

/**
 * parseFaProjectWorldTemplateLayoutSnapshot
 * Rejects layout groups without any display name translation.
 */
test('Test that parseFaProjectWorldTemplateLayoutSnapshot rejects blank group translation maps', () => {
  expect(() => parseFaProjectWorldTemplateLayoutSnapshot({
    groups: [
      {
        displayNameTranslations: {},
        id: SAMPLE_UUID,
        rootSortOrder: 0
      }
    ],
    placements: []
  })).toThrow()
})
