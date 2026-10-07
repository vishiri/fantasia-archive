import { expect, test } from 'vitest'

import { faProjectWorldTemplatePlacementNicknameSchema } from '../faProjectContentSchemaShared'
import { parseFaProjectContentPlainRecord } from '../faProjectContentSchemaShared'
import {
  parseFaProjectDocumentCreateInput,
  parseFaProjectDocumentIdPayload,
  parseFaProjectDocumentListFilter,
  parseFaProjectDocumentPatch,
  parseFaProjectDocumentUpdatePayload,
  parseFaProjectSetDocumentTemplatePayload,
  parseFaProjectSetDocumentWorldPayload
} from '../faProjectDocumentContentSchema'
import {
  parseFaProjectDocumentMediaLinkPayload,
  parseFaProjectDocumentIdOnlyPayload,
  parseFaProjectWorldIdOnlyPayload
} from '../faProjectContentLinksSchema'
import {
  parseFaProjectDocumentTemplateCreateInput,
  parseFaProjectDocumentTemplateIdPayload,
  parseFaProjectDocumentTemplatePatch,
  parseFaProjectDocumentTemplatesSnapshotPayload,
  parseFaProjectDocumentTemplateUpdatePayload
} from '../faProjectDocumentTemplateContentSchema'
import {
  parseFaProjectMediaCreateInput,
  parseFaProjectMediaIdPayload,
  parseFaProjectMediaPatch,
  parseFaProjectMediaPersistedRow,
  parseFaProjectMediaUpdatePayload,
  parseFaProjectMediaUpsertPayload
} from '../faProjectMediaContentSchema'
import {
  parseFaProjectWorldCreateInput,
  parseFaProjectWorldIdPayload,
  parseFaProjectWorldPatch,
  parseFaProjectWorldsSnapshotPayload,
  parseFaProjectWorldUpdatePayload
} from '../faProjectWorldContentSchema'

const SAMPLE_UUID = '550e8400-e29b-41d4-a716-446655440000'

/**
 * parseFaProjectContentPlainRecord
 * Rejects non-plain object payloads at IPC boundaries.
 */
test('Test that parseFaProjectContentPlainRecord rejects array payloads', () => {
  expect(() => parseFaProjectContentPlainRecord([])).toThrow(/plain object/)
})

/**
 * faProjectWorldTemplatePlacementNicknameSchema
 * Trims optional placement nickname strings at IPC boundaries.
 */
test('Test that faProjectWorldTemplatePlacementNicknameSchema trims nickname values', () => {
  expect(faProjectWorldTemplatePlacementNicknameSchema.parse('  alias  ')).toBe('alias')
})

/**
 * Project content Zod parsers
 * Accept strict create, update, link, and list filter shapes.
 */
test('Test that parseFaProjectMediaPatch keeps a display name longer than 120 characters', () => {
  const longName = 'M'.repeat(121)
  const parsed = parseFaProjectMediaPatch({
    displayName: `  ${longName}  `
  })
  expect(parsed.displayName).toBe(longName)
})

test('Test that project content schema parsers accept valid payloads', () => {
  expect(parseFaProjectWorldCreateInput({ displayName: '  Realm  ' }).displayName).toBe('Realm')
  expect(parseFaProjectWorldUpdatePayload({
    id: SAMPLE_UUID,
    patch: {}
  }).id).toBe(SAMPLE_UUID)
  expect(parseFaProjectWorldIdPayload({ id: SAMPLE_UUID })).toBe(SAMPLE_UUID)
  expect(parseFaProjectWorldPatch({ displayName: 'W' }).displayName).toBe('W')

  expect(parseFaProjectMediaCreateInput({ displayName: 'Pic' }).displayName).toBe('Pic')
  expect(parseFaProjectMediaPatch({}).displayName).toBeUndefined()
  expect(parseFaProjectMediaUpdatePayload({
    id: SAMPLE_UUID,
    patch: { displayName: 'Pic 2' }
  }).patch.displayName).toBe('Pic 2')
  expect(parseFaProjectMediaIdPayload({ id: SAMPLE_UUID })).toBe(SAMPLE_UUID)
  expect(parseFaProjectMediaUpsertPayload({
    items: [{
      displayName: '  Pic  ',
      externalEmbed: '<iframe></iframe>',
      externalLink: 'https://cdn.example.test/pic.png',
      externalType: 'embed',
      id: SAMPLE_UUID,
      internalLink: '',
      internalType: '',
      type: 'external'
    }]
  })[0]?.displayName).toBe('Pic')
  expect(parseFaProjectMediaPersistedRow({
    id: SAMPLE_UUID,
    displayName: 'Pic',
    type: 'external',
    internalType: '',
    externalType: '',
    externalLink: '',
    externalEmbed: '',
    internalLink: '',
    internalEmbed: null,
    createdAtMs: 1,
    updatedAtMs: 2
  }).internalEmbed).toBeNull()
  expect(parseFaProjectMediaPersistedRow({
    id: SAMPLE_UUID,
    displayName: 'Pic',
    type: 'internal',
    internalType: 'embedded',
    externalType: 'linked',
    externalLink: 'https://example.test/a',
    externalEmbed: '',
    internalLink: '',
    internalEmbed: new Uint8Array([9]),
    createdAtMs: 1,
    updatedAtMs: 2
  }).type).toBe('internal')
  expect(parseFaProjectMediaPersistedRow({
    id: SAMPLE_UUID,
    displayName: 'Pic',
    type: 'external',
    internalType: '',
    externalType: 'embed',
    externalLink: '',
    externalEmbed: '<iframe src="https://www.youtube.com/embed/x"></iframe>',
    internalLink: '',
    internalEmbed: null,
    createdAtMs: 1,
    updatedAtMs: 2
  }).externalEmbed).toBe('<iframe src="https://www.youtube.com/embed/x"></iframe>')

  expect(parseFaProjectDocumentTemplateCreateInput({ displayName: 'Tpl' }).displayName).toBe('Tpl')
  expect(parseFaProjectDocumentTemplateUpdatePayload({
    id: SAMPLE_UUID,
    patch: {}
  }).patch).toEqual({})
  expect(parseFaProjectDocumentTemplateIdPayload({ id: SAMPLE_UUID })).toBe(SAMPLE_UUID)
  expect(parseFaProjectDocumentTemplatePatch({ displayName: 'T' }).displayName).toBe('T')

  expect(parseFaProjectDocumentPatch({ worldId: SAMPLE_UUID }).worldId).toBe(SAMPLE_UUID)
  expect(parseFaProjectDocumentCreateInput({
    displayName: 'Doc',
    worldId: SAMPLE_UUID,
    templateId: null
  }).templateId).toBeNull()
  expect(parseFaProjectDocumentUpdatePayload({
    id: SAMPLE_UUID,
    patch: { displayName: 'Doc 2' }
  }).patch.displayName).toBe('Doc 2')
  expect(parseFaProjectDocumentIdPayload({ id: SAMPLE_UUID })).toBe(SAMPLE_UUID)
  expect(parseFaProjectDocumentListFilter(undefined)).toBeUndefined()
  expect(parseFaProjectDocumentListFilter({ worldId: SAMPLE_UUID })?.worldId).toBe(SAMPLE_UUID)
  expect(parseFaProjectSetDocumentWorldPayload({
    documentId: SAMPLE_UUID,
    worldId: SAMPLE_UUID
  }).worldId).toBe(SAMPLE_UUID)
  expect(parseFaProjectSetDocumentTemplatePayload({
    documentId: SAMPLE_UUID,
    templateId: null
  }).templateId).toBeNull()

  expect(parseFaProjectDocumentMediaLinkPayload({
    documentId: SAMPLE_UUID,
    mediaId: SAMPLE_UUID
  }).documentId).toBe(SAMPLE_UUID)
  expect(parseFaProjectDocumentIdOnlyPayload({ documentId: SAMPLE_UUID })).toBe(SAMPLE_UUID)
  expect(parseFaProjectWorldIdOnlyPayload({ worldId: SAMPLE_UUID })).toBe(SAMPLE_UUID)
  expect(parseFaProjectWorldsSnapshotPayload({
    items: [
      {
        displayNameTranslations: { 'en-US': 'Realm' },
        id: SAMPLE_UUID
      }
    ]
  })).toHaveLength(1)
  expect(parseFaProjectDocumentTemplatesSnapshotPayload({
    items: [
      {
        icon: 'person',
        id: SAMPLE_UUID,
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {},
        worldAppendixTranslations: { 'en-US': 'notes' }
      }
    ]
  })).toHaveLength(1)
})
