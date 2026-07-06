import { expect, test } from 'vitest'

import { faOpenedDocumentsSnapshotSchema, parseFaOpenedDocumentsSnapshotJson } from 'app/src-electron/shared/faOpenedDocumentsSnapshotSchema'

/**
 * faOpenedDocumentsSnapshotSchema parse and serialize round trip
 */
test('Test that parseFaOpenedDocumentsSnapshotJson accepts a valid snapshot payload', () => {
  const raw = JSON.stringify({
    schemaVersion: 1,
    activeDocumentId: 'doc-1',
    tabs: [{
      documentId: 'doc-1',
      tabLabel: 'Doc',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'Draft',
      savedDisplayName: 'Saved',
      hasUnsavedChanges: true
    }]
  })
  const parsed = parseFaOpenedDocumentsSnapshotJson(raw)
  expect(parsed.activeDocumentId).toBe('doc-1')
  expect(parsed.tabs).toHaveLength(1)
})

test('Test that parseFaOpenedDocumentsSnapshotJson returns empty tabs on invalid JSON', () => {
  const parsed = parseFaOpenedDocumentsSnapshotJson('{not-json')
  expect(parsed.tabs).toEqual([])
  expect(parsed.activeDocumentId).toBeNull()
})

test('Test that parseFaOpenedDocumentsSnapshotJson defaults editState to preview mode for legacy tabs', () => {
  const raw = JSON.stringify({
    schemaVersion: 1,
    activeDocumentId: 'doc-1',
    tabs: [{
      documentId: 'doc-1',
      tabLabel: 'Doc',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'Draft',
      savedDisplayName: 'Saved',
      hasUnsavedChanges: true
    }]
  })
  const parsed = parseFaOpenedDocumentsSnapshotJson(raw)
  expect(parsed.tabs[0]?.editState).toBe(false)
})

test('Test that faOpenedDocumentsSnapshotSchema rejects unknown keys', () => {
  expect(() => faOpenedDocumentsSnapshotSchema.parse({
    schemaVersion: 1,
    activeDocumentId: null,
    tabs: [],
    extra: true
  })).toThrow()
})
