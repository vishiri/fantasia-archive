import { expect, test } from 'vitest'

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
  parseFaProjectWorldIdOnlyPayload,
  parseFaProjectWorldMediaLinkPayload
} from '../faProjectContentLinksSchema'
import {
  parseFaProjectDocumentTemplateCreateInput,
  parseFaProjectDocumentTemplateIdPayload,
  parseFaProjectDocumentTemplatePatch,
  parseFaProjectDocumentTemplateUpdatePayload
} from '../faProjectDocumentTemplateContentSchema'
import {
  parseFaProjectMediaCreateInput,
  parseFaProjectMediaIdPayload,
  parseFaProjectMediaPatch,
  parseFaProjectMediaUpdatePayload
} from '../faProjectMediaContentSchema'
import {
  parseFaProjectWorldCreateInput,
  parseFaProjectWorldIdPayload,
  parseFaProjectWorldPatch,
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
 * Project content Zod parsers
 * Accept strict create, update, link, and list filter shapes.
 */
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

  expect(parseFaProjectWorldMediaLinkPayload({
    worldId: SAMPLE_UUID,
    mediaId: SAMPLE_UUID
  }).mediaId).toBe(SAMPLE_UUID)
  expect(parseFaProjectDocumentMediaLinkPayload({
    documentId: SAMPLE_UUID,
    mediaId: SAMPLE_UUID
  }).documentId).toBe(SAMPLE_UUID)
  expect(parseFaProjectWorldIdOnlyPayload({ worldId: SAMPLE_UUID })).toBe(SAMPLE_UUID)
  expect(parseFaProjectDocumentIdOnlyPayload({ documentId: SAMPLE_UUID })).toBe(SAMPLE_UUID)
})
