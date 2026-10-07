import { expect, test } from 'vitest'

import { faOpenedDocumentsSnapshotSchema, parseFaOpenedDocumentsSnapshotJson, parseFaOpenedDocumentsSnapshotPayload, serializeFaOpenedDocumentsSnapshotJson } from 'app/src-electron/shared/faOpenedDocumentsSnapshotSchema'

/**
 * faOpenedDocumentsSnapshotSchema parse and serialize round trip
 */
test('Test that parseFaOpenedDocumentsSnapshotJson accepts a valid snapshot payload', () => {
  const raw = JSON.stringify({
    schemaVersion: 1,
    activeDocumentId: 'doc-1',
    tabs: [{
      documentId: 'doc-1',
      persistenceState: 'persisted',
      tabLabel: 'Doc',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'Draft',
      savedDisplayName: 'Saved',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
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
      persistenceState: 'persisted',
      tabLabel: 'Doc',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'Draft',
      savedDisplayName: 'Saved',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
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

test('Test that parseFaOpenedDocumentsSnapshotJson reads v1 tabs without persistenceState as persisted', () => {
  const raw = JSON.stringify({
    schemaVersion: 1,
    activeDocumentId: 'doc-1',
    tabs: [{
      documentId: 'doc-1',
      tabLabel: 'Doc',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'Draft',
      savedDisplayName: 'Saved',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      hasUnsavedChanges: false,
      editState: false
    }]
  })
  const parsed = parseFaOpenedDocumentsSnapshotJson(raw)
  expect(parsed.tabs[0]?.persistenceState).toBe('persisted')
})

test('Test that parseFaOpenedDocumentsSnapshotJson accepts temporary tabs with metadata', () => {
  const raw = JSON.stringify({
    schemaVersion: 2,
    activeDocumentId: 'temp-1',
    tabs: [{
      documentId: 'temp-1',
      persistenceState: 'temporary',
      worldId: 'world-1',
      templateId: 'tpl-1',
      parentDocumentId: null,
      tabLabel: 'Character',
      templateIcon: 'mdi-account',
      displayNameDraft: 'Aria',
      savedDisplayName: '',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      hasUnsavedChanges: true,
      editState: true
    }]
  })
  const parsed = parseFaOpenedDocumentsSnapshotJson(raw)
  expect(parsed.schemaVersion).toBe(2)
  expect(parsed.tabs[0]?.persistenceState).toBe('temporary')
  expect(parsed.tabs[0]?.worldId).toBe('world-1')
})

test('Test that parseFaOpenedDocumentsSnapshotJson keeps a temporary placement id', () => {
  const raw = JSON.stringify({
    schemaVersion: 2,
    activeDocumentId: 'temp-1',
    tabs: [{
      documentId: 'temp-1',
      persistenceState: 'temporary',
      worldId: 'world-1',
      templateId: 'tpl-1',
      parentDocumentId: null,
      placementId: 'placement-2',
      tabLabel: 'Character',
      templateIcon: 'mdi-account',
      displayNameDraft: 'Aria',
      savedDisplayName: '',
      hasUnsavedChanges: true,
      editState: true
    }]
  })
  const parsed = parseFaOpenedDocumentsSnapshotJson(raw)
  expect(parsed.tabs[0]?.placementId).toBe('placement-2')
})

test('Test that parseFaOpenedDocumentsSnapshotJson accepts temporary tabs with parent resolve chain', () => {
  const raw = JSON.stringify({
    schemaVersion: 2,
    activeDocumentId: 'temp-1',
    tabs: [{
      documentId: 'temp-1',
      persistenceState: 'temporary',
      worldId: 'world-1',
      templateId: 'tpl-1',
      parentDocumentId: 'doc-parent',
      temporaryParentResolveDocumentIds: ['doc-parent', 'doc-root'],
      tabLabel: 'Character',
      templateIcon: 'mdi-account',
      displayNameDraft: 'Aria',
      savedDisplayName: '',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      hasUnsavedChanges: false,
      editState: true
    }]
  })
  const parsed = parseFaOpenedDocumentsSnapshotJson(raw)
  expect(parsed.tabs[0]?.temporaryParentResolveDocumentIds).toEqual([
    'doc-parent',
    'doc-root'
  ])
})

test('Test that parseFaOpenedDocumentsSnapshotPayload accepts temporaryParentResolveDocumentIds', () => {
  const parsed = parseFaOpenedDocumentsSnapshotPayload({
    schemaVersion: 2,
    activeDocumentId: 'temp-1',
    tabs: [{
      documentId: 'temp-1',
      persistenceState: 'temporary',
      worldId: 'world-1',
      templateId: 'tpl-1',
      parentDocumentId: 'doc-parent',
      temporaryParentResolveDocumentIds: ['doc-parent'],
      tabLabel: 'Character',
      templateIcon: 'mdi-account',
      displayNameDraft: 'Aria',
      savedDisplayName: '',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      hasUnsavedChanges: false,
      editState: true
    }]
  })
  expect(parsed.tabs[0]?.temporaryParentResolveDocumentIds).toEqual(['doc-parent'])
})

test('Test that faOpenedDocumentsSnapshotSchema rejects temporary tabs missing worldId', () => {
  expect(() => faOpenedDocumentsSnapshotSchema.parse({
    schemaVersion: 2,
    activeDocumentId: 'temp-1',
    tabs: [{
      documentId: 'temp-1',
      persistenceState: 'temporary',
      templateId: 'tpl-1',
      tabLabel: 'Character',
      templateIcon: 'mdi-account',
      displayNameDraft: 'Aria',
      savedDisplayName: '',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      hasUnsavedChanges: true,
      editState: true
    }]
  })).toThrow()
})

test('Test that serializeFaOpenedDocumentsSnapshotJson keeps an order-number draft longer than 32 characters', () => {
  const longOrder = '9'.repeat(33)
  const serialized = serializeFaOpenedDocumentsSnapshotJson({
    schemaVersion: 2,
    activeDocumentId: 'doc-1',
    tabs: [{
      documentId: 'doc-1',
      persistenceState: 'persisted',
      tabLabel: 'Doc',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'Draft',
      savedDisplayName: 'Saved',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: longOrder,
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      hasUnsavedChanges: true,
      editState: true
    }]
  })
  const parsed = JSON.parse(serialized) as {
    tabs: Array<{ treeOrderNumberDraft: string }>
  }
  expect(parsed.tabs[0]?.treeOrderNumberDraft).toBe(longOrder)
})

test('Test that serializeFaOpenedDocumentsSnapshotJson keeps a belongs-under draft longer than 64 characters', () => {
  const longParentId = 'p'.repeat(65)
  const serialized = serializeFaOpenedDocumentsSnapshotJson({
    schemaVersion: 2,
    activeDocumentId: 'doc-1',
    tabs: [{
      documentId: 'doc-1',
      persistenceState: 'persisted',
      tabLabel: 'Doc',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'Draft',
      savedDisplayName: 'Saved',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: longParentId,
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      hasUnsavedChanges: true,
      editState: true
    }]
  })
  const parsed = JSON.parse(serialized) as {
    tabs: Array<{ parentDocumentIdDraft: string }>
  }
  expect(parsed.tabs[0]?.parentDocumentIdDraft).toBe(longParentId)
})

test('Test that serializeFaOpenedDocumentsSnapshotJson keeps extra classes longer than 512 characters', () => {
  const longClasses = 'a'.repeat(513)
  const serialized = serializeFaOpenedDocumentsSnapshotJson({
    schemaVersion: 2,
    activeDocumentId: 'doc-1',
    tabs: [{
      documentId: 'doc-1',
      persistenceState: 'persisted',
      tabLabel: 'Doc',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'Draft',
      savedDisplayName: 'Saved',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: longClasses,
      savedExtraClasses: longClasses,
      hasUnsavedChanges: true,
      editState: true
    }]
  })
  const parsed = JSON.parse(serialized) as {
    tabs: Array<{ extraClassesDraft: string, savedExtraClasses: string }>
  }
  expect(parsed.tabs[0]?.extraClassesDraft).toBe(longClasses)
  expect(parsed.tabs[0]?.savedExtraClasses).toBe(longClasses)
})

test('Test that serializeFaOpenedDocumentsSnapshotJson keeps a tag name longer than 512 characters', () => {
  const longName = 'T'.repeat(513)
  const serialized = serializeFaOpenedDocumentsSnapshotJson({
    schemaVersion: 2,
    activeDocumentId: 'doc-1',
    tabs: [{
      documentId: 'doc-1',
      persistenceState: 'persisted',
      tabLabel: 'Doc',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'Draft',
      savedDisplayName: 'Saved',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      tagsDraft: [{
        id: 'tag-1',
        name: longName,
        isNew: false
      }],
      savedTags: [{
        id: 'tag-1',
        name: longName
      }],
      hasUnsavedChanges: false,
      editState: false
    }]
  })
  const parsed = JSON.parse(serialized) as {
    tabs: Array<{
      tagsDraft: Array<{ name: string }>
      savedTags: Array<{ name: string }>
    }>
  }
  expect(parsed.tabs[0]?.tagsDraft[0]?.name).toBe(longName)
  expect(parsed.tabs[0]?.savedTags[0]?.name).toBe(longName)
})

test('Test that serializeFaOpenedDocumentsSnapshotJson keeps a display name longer than 512 characters', () => {
  const longName = 'A'.repeat(513)
  const serialized = serializeFaOpenedDocumentsSnapshotJson({
    schemaVersion: 2,
    activeDocumentId: 'doc-1',
    tabs: [{
      documentId: 'doc-1',
      persistenceState: 'persisted',
      tabLabel: longName,
      templateIcon: 'mdi-feather',
      displayNameDraft: longName,
      savedDisplayName: longName,
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      hasUnsavedChanges: false,
      editState: false
    }]
  })
  const parsed = JSON.parse(serialized) as {
    tabs: Array<{ displayNameDraft: string, savedDisplayName: string, tabLabel: string }>
  }
  expect(parsed.tabs[0]?.displayNameDraft).toBe(longName)
  expect(parsed.tabs[0]?.savedDisplayName).toBe(longName)
  expect(parsed.tabs[0]?.tabLabel).toBe(longName)
})

test('Test that serializeFaOpenedDocumentsSnapshotJson writes schemaVersion 2', () => {
  const serialized = serializeFaOpenedDocumentsSnapshotJson({
    schemaVersion: 1,
    activeDocumentId: 'doc-1',
    tabs: [{
      documentId: 'doc-1',
      persistenceState: 'persisted',
      tabLabel: 'Doc',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'Draft',
      savedDisplayName: 'Saved',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      hasUnsavedChanges: false,
      editState: false
    }]
  })
  const parsed = JSON.parse(serialized) as {
    schemaVersion: number
    tabs: Array<{ savedTags?: unknown, tagsDraft?: unknown }>
  }
  expect(parsed.schemaVersion).toBe(2)
  expect(parsed.tabs[0]?.tagsDraft).toBeUndefined()
  expect(parsed.tabs[0]?.savedTags).toBeUndefined()
})

test('Test that serializeFaOpenedDocumentsSnapshotJson drops a color that is not #RRGGBB', () => {
  const serialized = serializeFaOpenedDocumentsSnapshotJson({
    schemaVersion: 2,
    activeDocumentId: 'doc-1',
    tabs: [{
      documentId: 'doc-1',
      persistenceState: 'persisted',
      tabLabel: 'Doc',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'Draft',
      savedDisplayName: 'Saved',
      documentTextColorDraft: '#aabbccff',
      savedDocumentTextColor: '#abc',
      documentBackgroundColorDraft: 'red',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      hasUnsavedChanges: false,
      editState: false
    }]
  })
  const parsed = JSON.parse(serialized) as {
    tabs: Array<{
      documentBackgroundColorDraft: string
      documentTextColorDraft: string
      savedDocumentTextColor: string
    }>
  }
  expect(parsed.tabs[0]?.documentTextColorDraft).toBe('')
  expect(parsed.tabs[0]?.savedDocumentTextColor).toBe('#AABBCC')
  expect(parsed.tabs[0]?.documentBackgroundColorDraft).toBe('')
})

test('Test that faOpenedDocumentsSnapshotSchema round-trips extra HTML classes fields', () => {
  const snapshot = faOpenedDocumentsSnapshotSchema.parse({
    schemaVersion: 2,
    activeDocumentId: 'doc-1',
    tabs: [{
      documentId: 'doc-1',
      persistenceState: 'persisted',
      tabLabel: 'Doc',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'Draft',
      savedDisplayName: 'Saved',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: 'foo bar',
      savedExtraClasses: 'foo bar',
      hasUnsavedChanges: false,
      editState: false
    }]
  })
  expect(snapshot.tabs[0]?.extraClassesDraft).toBe('foo bar')
  expect(snapshot.tabs[0]?.savedExtraClasses).toBe('foo bar')
})

test('Test that parseFaOpenedDocumentsSnapshotPayload rejects non-object payloads', () => {
  expect(() => parseFaOpenedDocumentsSnapshotPayload(null)).toThrow(TypeError)
})
