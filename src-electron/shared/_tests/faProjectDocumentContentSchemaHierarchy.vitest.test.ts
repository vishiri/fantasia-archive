import { expect, test } from 'vitest'

import { parseFaProjectDocumentCreateInput, parseFaProjectDocumentIdPayload, parseFaProjectDocumentListFilter, parseFaProjectDocumentPatch, parseFaProjectDocumentUpdatePayload, parseFaProjectSetDocumentTemplatePayload, parseFaProjectSetDocumentWorldPayload } from '../faProjectDocumentContentSchema'

const SAMPLE_UUID = '550e8400-e29b-41d4-a716-446655440000'

/**
 * parseFaProjectDocumentCreateInput
 * Accepts optional hierarchy placement and parent fields.
 */
test('Test that parseFaProjectDocumentCreateInput accepts hierarchy fields', () => {
  const parsed = parseFaProjectDocumentCreateInput({
    displayName: 'Hero',
    worldId: SAMPLE_UUID,
    placementId: SAMPLE_UUID,
    parentDocumentId: null,
    sortOrder: 2
  })
  expect(parsed.placementId).toBe(SAMPLE_UUID)
  expect(parsed.sortOrder).toBe(2)
})

/**
 * parseFaProjectDocumentCreateInput
 * Omits optional hierarchy keys when they are not provided.
 */
test('Test that parseFaProjectDocumentCreateInput omits optional hierarchy keys', () => {
  const parsed = parseFaProjectDocumentCreateInput({
    displayName: 'Hero',
    worldId: SAMPLE_UUID
  })
  expect(parsed).not.toHaveProperty('placementId')
  expect(parsed).not.toHaveProperty('parentDocumentId')
})

/**
 * parseFaProjectDocumentListFilter
 * Returns undefined when IPC payload is omitted.
 */
test('Test that parseFaProjectDocumentListFilter returns undefined for missing payload', () => {
  expect(parseFaProjectDocumentListFilter(undefined)).toBeUndefined()
})

/**
 * parseFaProjectDocumentListFilter
 * Parses optional worldId filter from IPC payload.
 */
test('Test that parseFaProjectDocumentListFilter parses worldId filter', () => {
  const parsed = parseFaProjectDocumentListFilter({ worldId: SAMPLE_UUID })
  expect(parsed?.worldId).toBe(SAMPLE_UUID)
})

/**
 * parseFaProjectDocumentUpdatePayload
 * Parses document update IPC payload with nested patch.
 */
test('Test that parseFaProjectDocumentUpdatePayload parses id and patch', () => {
  const parsed = parseFaProjectDocumentUpdatePayload({
    id: SAMPLE_UUID,
    patch: {
      sortOrder: 1,
      parentDocumentId: null
    }
  })
  expect(parsed.id).toBe(SAMPLE_UUID)
  expect(parsed.patch.sortOrder).toBe(1)
})

/**
 * parseFaProjectDocumentIdPayload
 * Extracts document id from IPC payload wrapper.
 */
test('Test that parseFaProjectDocumentIdPayload reads id field', () => {
  expect(parseFaProjectDocumentIdPayload({ id: SAMPLE_UUID })).toBe(SAMPLE_UUID)
})

/**
 * parseFaProjectSetDocumentWorldPayload
 * Parses set-document-world IPC payload.
 */
test('Test that parseFaProjectSetDocumentWorldPayload parses document and world ids', () => {
  const parsed = parseFaProjectSetDocumentWorldPayload({
    documentId: SAMPLE_UUID,
    worldId: SAMPLE_UUID
  })
  expect(parsed.documentId).toBe(SAMPLE_UUID)
})

/**
 * parseFaProjectSetDocumentTemplatePayload
 * Parses nullable template id on set-document-template IPC.
 */
test('Test that parseFaProjectSetDocumentTemplatePayload accepts null template id', () => {
  const parsed = parseFaProjectSetDocumentTemplatePayload({
    documentId: SAMPLE_UUID,
    templateId: null
  })
  expect(parsed.templateId).toBeNull()
})

/**
 * parseFaProjectDocumentPatch
 * Drops undefined optional keys from parsed patch objects.
 */
test('Test that parseFaProjectDocumentPatch keeps only provided patch keys', () => {
  const parsed = parseFaProjectDocumentPatch({ displayName: 'Renamed' })
  expect(parsed.displayName).toBe('Renamed')
  expect(parsed).not.toHaveProperty('sortOrder')
})

/**
 * parseFaProjectDocumentCreateInput
 * Normalizes empty appearance color strings to null.
 */
test('Test that parseFaProjectDocumentCreateInput normalizes empty appearance colors to null', () => {
  const parsed = parseFaProjectDocumentCreateInput({
    displayName: 'Hero',
    worldId: SAMPLE_UUID,
    documentTextColor: '',
    documentBackgroundColor: '#112233'
  })
  expect(parsed.documentTextColor).toBeNull()
  expect(parsed.documentBackgroundColor).toBe('#112233')
})

/**
 * parseFaProjectDocumentPatch
 * Accepts nullable appearance color patch fields.
 */
test('Test that parseFaProjectDocumentPatch accepts appearance color fields', () => {
  const parsed = parseFaProjectDocumentPatch({
    documentTextColor: '#AABBCC',
    documentBackgroundColor: null
  })
  expect(parsed.documentTextColor).toBe('#AABBCC')
  expect(parsed.documentBackgroundColor).toBeNull()
})
