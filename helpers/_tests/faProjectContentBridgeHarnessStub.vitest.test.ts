import { expect, test } from 'vitest'

import { createFaProjectContentBridgeHarnessStub } from '../faProjectContentBridgeHarnessStub'

const STUB_UUID = '550e8400-e29b-41d4-a716-446655440000'

const stubNamedEntityShape = {
  id: STUB_UUID,
  displayName: 'Stub',
  displayNameTranslations: { 'en-US': 'Stub' },
  createdAtMs: 0,
  updatedAtMs: 0
}

const stubWorldShape = {
  ...stubNamedEntityShape,
  color: '#808080',
  colorPallete: '',
  sortOrder: 0
}

const stubWorldForSettingsShape = {
  ...stubWorldShape,
  documentCount: 0,
  templateLayout: {
    groups: [],
    placements: []
  }
}

const stubDocumentTemplateShape = {
  ...stubNamedEntityShape,
  icon: '',
  sortOrder: 0,
  titlePluralTranslations: { 'en-US': 'Stub' },
  titleSingularTranslations: {},
  worldAppendix: '',
  worldAppendixTranslations: {}
}

const stubDocumentShape = {
  ...stubNamedEntityShape,
  templateId: null,
  worldId: STUB_UUID,
  placementId: null,
  parentDocumentId: null,
  sortOrder: 0
}

/**
 * createFaProjectContentBridgeHarnessStub
 * Returns a no-op bridge whose create/get/update/set methods yield fixed stub rows.
 */
test('Test that createFaProjectContentBridgeHarnessStub create and get methods return stub shapes', async () => {
  const api = createFaProjectContentBridgeHarnessStub()

  await expect(api.createDocument({
    displayName: 'Doc',
    worldId: STUB_UUID
  })).resolves.toEqual(stubDocumentShape)
  await expect(api.createDocumentTemplate({ displayName: 'Template' })).resolves.toEqual(stubDocumentTemplateShape)
  await expect(api.createMedia({ displayName: 'Media' })).resolves.toEqual(stubNamedEntityShape)
  await expect(api.createWorld({ displayName: 'World' })).resolves.toEqual(stubWorldShape)

  await expect(api.getDocumentById(STUB_UUID)).resolves.toEqual(stubDocumentShape)
  await expect(api.getDocumentTemplateById(STUB_UUID)).resolves.toEqual(stubDocumentTemplateShape)
  await expect(api.getMediaById(STUB_UUID)).resolves.toEqual(stubNamedEntityShape)
  await expect(api.getWorldById(STUB_UUID)).resolves.toEqual(stubWorldShape)
})

/**
 * createFaProjectContentBridgeHarnessStub
 * Update and set methods return the same stub document or named-entity shapes.
 */
test('Test that createFaProjectContentBridgeHarnessStub update and set methods return stub shapes', async () => {
  const api = createFaProjectContentBridgeHarnessStub()

  await expect(api.updateDocument(STUB_UUID, { displayName: 'Updated' })).resolves.toEqual(stubDocumentShape)
  await expect(api.updateDocumentTemplate(STUB_UUID, { displayName: 'Updated' })).resolves.toEqual(stubDocumentTemplateShape)
  await expect(api.updateMedia(STUB_UUID, { displayName: 'Updated' })).resolves.toEqual(stubNamedEntityShape)
  await expect(api.updateWorld(STUB_UUID, { displayName: 'Updated' })).resolves.toEqual(stubWorldShape)

  await expect(api.setDocumentTemplate({
    documentId: STUB_UUID,
    templateId: STUB_UUID
  })).resolves.toEqual(stubDocumentShape)
  await expect(api.setDocumentWorld({
    documentId: STUB_UUID,
    worldId: STUB_UUID
  })).resolves.toEqual(stubDocumentShape)
})

/**
 * createFaProjectContentBridgeHarnessStub
 * List methods resolve to empty item arrays or project-settings stub rows.
 */
test('Test that createFaProjectContentBridgeHarnessStub list methods return expected collections', async () => {
  const api = createFaProjectContentBridgeHarnessStub()
  const emptyList = { items: [] }

  await expect(api.listDocumentMedia(STUB_UUID)).resolves.toEqual(emptyList)
  await expect(api.listDocuments()).resolves.toEqual(emptyList)
  await expect(api.listDocuments({ worldId: STUB_UUID })).resolves.toEqual(emptyList)
  await expect(api.listDocumentTemplates()).resolves.toEqual(emptyList)
  await expect(api.listMedia()).resolves.toEqual(emptyList)
  await expect(api.listWorlds()).resolves.toEqual(emptyList)
  await expect(api.listWorldsForProjectSettings()).resolves.toEqual({
    items: [stubWorldForSettingsShape]
  })
  await expect(api.listDocumentTemplatesForProjectSettings()).resolves.toEqual(emptyList)
})

/**
 * createFaProjectContentBridgeHarnessStub
 * Delete and link/unlink methods resolve without a value.
 */
test('Test that createFaProjectContentBridgeHarnessStub noop methods resolve undefined', async () => {
  const api = createFaProjectContentBridgeHarnessStub()

  await expect(api.deleteDocument(STUB_UUID)).resolves.toBeUndefined()
  await expect(api.deleteDocumentTemplate(STUB_UUID)).resolves.toBeUndefined()
  await expect(api.deleteMedia(STUB_UUID)).resolves.toBeUndefined()
  await expect(api.deleteWorld(STUB_UUID)).resolves.toBeUndefined()

  await expect(api.linkDocumentMedia({
    documentId: STUB_UUID,
    mediaId: STUB_UUID
  })).resolves.toBeUndefined()
  await expect(api.unlinkDocumentMedia({
    documentId: STUB_UUID,
    mediaId: STUB_UUID
  })).resolves.toBeUndefined()
  await expect(api.saveWorldsSnapshot([
    {
      displayNameTranslations: { 'en-US': 'World' },
      id: STUB_UUID
    }
  ])).resolves.toBeUndefined()
  await expect(api.saveDocumentTemplatesSnapshot([
    {
      id: STUB_UUID,
      titlePluralTranslations: { 'en-US': 'Template' },
      titleSingularTranslations: {},
    }
  ])).resolves.toBeUndefined()
})

/**
 * createFaProjectContentBridgeHarnessStub
 * Hierarchy tree methods return empty layout, lists, and search results.
 */
test('Test that createFaProjectContentBridgeHarnessStub hierarchy methods return stub shapes', async () => {
  const api = createFaProjectContentBridgeHarnessStub()

  await expect(api.listWorkspaceHierarchyLayout()).resolves.toEqual({ worlds: [] })
  await expect(api.listPlacementDocumentChildren({
    placementId: STUB_UUID
  })).resolves.toEqual({ items: [] })
  await expect(api.moveDocumentInHierarchy({
    documentId: STUB_UUID,
    targetParentDocumentId: null,
    targetSortOrder: 0
  })).resolves.toEqual({
    id: STUB_UUID,
    displayName: 'Stub',
    placementId: 'placement-stub',
    parentDocumentId: null,
    sortOrder: 0,
    hasChildren: false
  })
  await expect(api.reindexDocumentSiblingsInHierarchy({
    movedDocumentId: STUB_UUID,
    orderedDocumentIds: [STUB_UUID],
    parentDocumentId: null,
    placementId: STUB_UUID
  })).resolves.toEqual({
    id: STUB_UUID,
    displayName: 'Stub',
    placementId: 'placement-stub',
    parentDocumentId: null,
    sortOrder: 0,
    hasChildren: false
  })
  await expect(api.searchProjectHierarchy('hero')).resolves.toEqual({
    hits: [],
    query: 'hero'
  })
})
