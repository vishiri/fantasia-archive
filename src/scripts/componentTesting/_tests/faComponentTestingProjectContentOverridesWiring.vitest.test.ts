import { afterEach, expect, test, vi } from 'vitest'

import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectDocumentTemplate } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'

import {
  createFaProjectDocumentForRenderer,
  deleteFaProjectDocumentForRenderer,
  hasFaProjectDocumentCreateWriter,
  hasFaProjectDocumentDeleteWriter,
  hasFaProjectDocumentUpdateWriter,
  updateFaProjectDocumentForRenderer
} from '../faComponentTestingProjectContentDocumentWriteWiring'
import {
  getFaComponentTestingHierarchySearchProbe,
  getFaComponentTestingProjectContentOverrides,
  getFaProjectDocumentByIdForRenderer,
  getFaProjectDocumentTemplateByIdForRenderer,
  getFaProjectWorldByIdForRenderer,
  hasFaProjectContentEntityReaders,
  hasFaProjectDocumentByIdReader,
  hasFaProjectHierarchySearch,
  hasFaProjectHierarchySortBridge,
  listFaProjectPlacementDocumentChildrenForRenderer,
  reindexFaProjectDocumentSiblingsForRenderer,
  searchFaProjectHierarchyForRenderer,
  setFaComponentTestingProjectContentOverrides
} from '../faComponentTestingProjectContentOverridesWiring'

const sampleDocument: I_faProjectDocument = {
  createdAtMs: 1,
  displayName: 'Override Doc',
  documentBackgroundColor: null,
  documentTextColor: null,
  extraClasses: '',
  id: 'doc-override',
  isCategory: false,
  isDead: false,
  isFinished: false,
  isMinor: false,
  parentDocumentId: null,
  placementId: null,
  sortOrder: 0,
  templateId: null,
  treeOrderNumber: Number.MIN_SAFE_INTEGER,
  updatedAtMs: 1,
  worldId: 'world-1'
}

const sampleTemplate: I_faProjectDocumentTemplate = {
  createdAtMs: 1,
  displayName: 'Character',
  icon: 'mdi-account',
  id: 'tpl-1',
  sortOrder: 0,
  titlePluralTranslations: { 'en-US': 'Characters' },
  titleSingularTranslations: { 'en-US': 'Character' },
  updatedAtMs: 1,
  worldAppendix: '',
  worldAppendixTranslations: {}
}

const sampleWorld: I_faProjectWorld = {
  color: '#4caf50',
  colorPalette: '',
  createdAtMs: 1,
  displayName: 'Eldoria',
  displayNameTranslations: { 'en-US': 'Eldoria' },
  id: 'world-1',
  sortOrder: 0,
  updatedAtMs: 1
}

afterEach(() => {
  setFaComponentTestingProjectContentOverrides(null)
  vi.unstubAllGlobals()
})

test('Test that getFaProjectDocumentByIdForRenderer prefers component-testing overrides', async () => {
  setFaComponentTestingProjectContentOverrides({
    documentsById: {
      [sampleDocument.id]: sampleDocument
    }
  })
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        getDocumentById: vi.fn(async () => {
          throw new Error('bridge should not run')
        })
      }
    }
  })

  await expect(getFaProjectDocumentByIdForRenderer(sampleDocument.id)).resolves.toEqual(sampleDocument)
})

test('Test that get entity ForRenderer falls back to bridge and throws when missing', async () => {
  setFaComponentTestingProjectContentOverrides(null)
  const getDocumentById = vi.fn(async () => sampleDocument)
  const getDocumentTemplateById = vi.fn(async () => sampleTemplate)
  const getWorldById = vi.fn(async () => sampleWorld)
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        getDocumentById,
        getDocumentTemplateById,
        getWorldById
      }
    }
  })

  await expect(getFaProjectDocumentByIdForRenderer('doc-bridge')).resolves.toEqual(sampleDocument)
  await expect(getFaProjectDocumentTemplateByIdForRenderer('tpl-1')).resolves.toEqual(sampleTemplate)
  await expect(getFaProjectWorldByIdForRenderer('world-1')).resolves.toEqual(sampleWorld)
  expect(getDocumentById).toHaveBeenCalledWith('doc-bridge')

  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {}
    }
  })
  await expect(getFaProjectDocumentByIdForRenderer('x')).rejects.toThrow(
    'projectContent.getDocumentById unavailable'
  )
  await expect(getFaProjectDocumentTemplateByIdForRenderer('x')).rejects.toThrow(
    'projectContent.getDocumentTemplateById unavailable'
  )
  await expect(getFaProjectWorldByIdForRenderer('x')).rejects.toThrow(
    'projectContent.getWorldById unavailable'
  )
})

test('Test that template and world ForRenderer prefer overrides', async () => {
  setFaComponentTestingProjectContentOverrides({
    templatesById: { 'tpl-1': sampleTemplate },
    worldsById: { 'world-1': sampleWorld }
  })
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        getDocumentTemplateById: vi.fn(async () => {
          throw new Error('bridge should not run')
        }),
        getWorldById: vi.fn(async () => {
          throw new Error('bridge should not run')
        })
      }
    }
  })
  await expect(getFaProjectDocumentTemplateByIdForRenderer('tpl-1')).resolves.toEqual(sampleTemplate)
  await expect(getFaProjectWorldByIdForRenderer('world-1')).resolves.toEqual(sampleWorld)
})

test('Test that hasFaProjectDocumentByIdReader and entity readers cover bridge and override paths', () => {
  setFaComponentTestingProjectContentOverrides(null)
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {}
    }
  })
  expect(hasFaProjectDocumentByIdReader()).toBe(false)
  expect(hasFaProjectContentEntityReaders()).toBe(false)

  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        getDocumentById: vi.fn(),
        getDocumentTemplateById: vi.fn(),
        getWorldById: vi.fn()
      }
    }
  })
  expect(hasFaProjectDocumentByIdReader()).toBe(true)
  expect(hasFaProjectContentEntityReaders()).toBe(true)

  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {}
    }
  })
  setFaComponentTestingProjectContentOverrides({
    documentsById: {},
    templatesById: {},
    worldsById: {}
  })
  expect(hasFaProjectDocumentByIdReader()).toBe(true)
  expect(hasFaProjectContentEntityReaders()).toBe(true)

  setFaComponentTestingProjectContentOverrides({
    documentsById: {}
  })
  expect(hasFaProjectContentEntityReaders()).toBe(false)
})

test('Test that list and reindex placement children use override maps', async () => {
  setFaComponentTestingProjectContentOverrides({
    placementDocumentChildrenByKey: {
      'placement-1::__root__': [
        {
          displayName: 'Beta',
          hasChildren: false,
          id: 'b',
          parentDocumentId: null,
          placementId: 'placement-1',
          sortOrder: 0
        },
        {
          displayName: 'Alpha',
          hasChildren: false,
          id: 'a',
          parentDocumentId: null,
          placementId: 'placement-1',
          sortOrder: 1
        }
      ]
    }
  })

  const listed = await listFaProjectPlacementDocumentChildrenForRenderer({
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  expect(listed.items.map((item) => item.id)).toEqual(['b', 'a'])

  const missingKey = await listFaProjectPlacementDocumentChildrenForRenderer({
    parentDocumentId: 'missing-parent',
    placementId: 'placement-1'
  })
  expect(missingKey.items).toEqual([])

  await reindexFaProjectDocumentSiblingsForRenderer({
    movedDocumentId: 'a',
    orderedDocumentIds: ['a', 'b'],
    parentDocumentId: null,
    placementId: 'placement-1'
  })

  await reindexFaProjectDocumentSiblingsForRenderer({
    movedDocumentId: 'ghost',
    orderedDocumentIds: [],
    parentDocumentId: 'no-bucket',
    placementId: 'placement-1'
  })
  expect(
    getFaComponentTestingProjectContentOverrides()?.placementDocumentChildrenByKey?.['placement-1::no-bucket']
  ).toEqual([])

  const reordered = await listFaProjectPlacementDocumentChildrenForRenderer({
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  expect(reordered.items.map((item) => item.id)).toEqual(['a', 'b'])
  expect(reordered.items.map((item) => item.sortOrder)).toEqual([0, 1])
  expect(hasFaProjectHierarchySortBridge()).toBe(true)
})

test('Test that list and reindex placement children use bridge when overrides unset', async () => {
  setFaComponentTestingProjectContentOverrides(null)
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: [{
      displayName: 'Bridge Child',
      hasChildren: false,
      id: 'bridge-doc',
      parentDocumentId: null,
      placementId: 'placement-1',
      sortOrder: 0
    }]
  }))
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => true)
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        listPlacementDocumentChildren,
        reindexDocumentSiblingsInHierarchy
      }
    }
  })

  await expect(listFaProjectPlacementDocumentChildrenForRenderer({
    parentDocumentId: null,
    placementId: 'placement-1'
  })).resolves.toMatchObject({
    items: [expect.objectContaining({ id: 'bridge-doc' })]
  })
  expect(hasFaProjectHierarchySortBridge()).toBe(true)
  await expect(reindexFaProjectDocumentSiblingsForRenderer({
    movedDocumentId: 'bridge-doc',
    orderedDocumentIds: ['bridge-doc'],
    parentDocumentId: null,
    placementId: 'placement-1'
  })).resolves.toBe(true)
  expect(reindexDocumentSiblingsInHierarchy).toHaveBeenCalled()

  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {}
    }
  })
  expect(hasFaProjectHierarchySortBridge()).toBe(false)
  await expect(listFaProjectPlacementDocumentChildrenForRenderer({
    parentDocumentId: null,
    placementId: 'placement-1'
  })).resolves.toEqual({ items: [] })
  await expect(reindexFaProjectDocumentSiblingsForRenderer({
    movedDocumentId: 'x',
    orderedDocumentIds: ['x'],
    parentDocumentId: null,
    placementId: 'placement-1'
  })).rejects.toThrow('projectContent.reindexDocumentSiblingsInHierarchy unavailable')
})

test('Test that searchFaProjectHierarchyForRenderer uses searchHitsByQuery overrides', async () => {
  const hit = {
    ancestorDocumentIds: [] as string[],
    displayName: 'Hero',
    documentId: 'doc-1',
    placementId: 'placement-1',
    worldId: 'world-1'
  }
  setFaComponentTestingProjectContentOverrides({
    searchHitsByQuery: {
      '*': [hit],
      hero: [hit]
    }
  })
  const bridgeSearch = vi.fn(async () => {
    throw new Error('bridge should not run')
  })
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        searchProjectHierarchy: bridgeSearch
      }
    }
  })

  await expect(searchFaProjectHierarchyForRenderer('hero')).resolves.toEqual({
    hits: [hit],
    query: 'hero'
  })
  expect(getFaComponentTestingHierarchySearchProbe()).toEqual({
    callCount: 1,
    lastQuery: 'hero'
  })
  expect(hasFaProjectHierarchySearch()).toBe(true)
  expect(bridgeSearch).not.toHaveBeenCalled()

  await expect(searchFaProjectHierarchyForRenderer('unknown')).resolves.toEqual({
    hits: [hit],
    query: 'unknown'
  })
})

test('Test that searchFaProjectHierarchyForRenderer returns empty when no query or star hits', async () => {
  setFaComponentTestingProjectContentOverrides({
    searchHitsByQuery: {
      hero: []
    }
  })
  await expect(searchFaProjectHierarchyForRenderer('missing')).resolves.toEqual({
    hits: [],
    query: 'missing'
  })
})

test('Test that searchFaProjectHierarchyForRenderer uses bridge and throws when missing', async () => {
  setFaComponentTestingProjectContentOverrides(null)
  const searchProjectHierarchy = vi.fn(async (query: string) => ({
    hits: [],
    query
  }))
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        searchProjectHierarchy
      }
    }
  })
  expect(hasFaProjectHierarchySearch()).toBe(true)
  await expect(searchFaProjectHierarchyForRenderer('q')).resolves.toEqual({
    hits: [],
    query: 'q'
  })

  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {}
    }
  })
  expect(hasFaProjectHierarchySearch()).toBe(false)
  await expect(searchFaProjectHierarchyForRenderer('q')).rejects.toThrow(
    'projectContent.searchProjectHierarchy unavailable'
  )
})

test('Test that create document ForRenderer appends placement children overrides', async () => {
  setFaComponentTestingProjectContentOverrides({
    documentsById: {},
    placementDocumentChildrenByKey: {
      'placement-1::__root__': [
        {
          displayName: 'Existing',
          hasChildren: false,
          id: 'doc-tree',
          parentDocumentId: null,
          placementId: 'placement-1',
          sortOrder: 9
        }
      ]
    }
  })

  const created = await createFaProjectDocumentForRenderer({
    displayName: 'Tree Child',
    documentBackgroundColor: '#fff',
    documentTextColor: '#000',
    extraClasses: 'extra',
    id: 'doc-tree',
    isCategory: true,
    isDead: true,
    isFinished: true,
    isMinor: true,
    parentDocumentId: null,
    placementId: 'placement-1',
    sortOrder: 0,
    templateId: 'tpl-1',
    treeOrderNumber: 7,
    worldId: 'world-1'
  })
  expect(created.placementId).toBe('placement-1')
  expect(created.isCategory).toBe(true)

  const listed = await listFaProjectPlacementDocumentChildrenForRenderer({
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  expect(listed.items).toHaveLength(1)
  expect(listed.items[0]).toMatchObject({
    displayName: 'Tree Child',
    id: 'doc-tree',
    isCategory: true,
    placementId: 'placement-1',
    sortOrder: 0,
    treeOrderNumber: 7
  })

  await createFaProjectDocumentForRenderer({
    displayName: 'Nested',
    id: 'doc-nested',
    parentDocumentId: 'doc-tree',
    placementId: 'placement-1',
    worldId: 'world-1'
  })
  const nestedListed = await listFaProjectPlacementDocumentChildrenForRenderer({
    parentDocumentId: 'doc-tree',
    placementId: 'placement-1'
  })
  expect(nestedListed.items).toEqual([
    expect.objectContaining({
      id: 'doc-nested',
      parentDocumentId: 'doc-tree'
    })
  ])
})

test('Test that create and update document ForRenderer mutate override maps', async () => {
  setFaComponentTestingProjectContentOverrides({
    documentsById: {}
  })
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        createDocument: vi.fn(async () => {
          throw new Error('bridge should not run')
        }),
        updateDocument: vi.fn(async () => {
          throw new Error('bridge should not run')
        })
      }
    }
  })

  expect(hasFaProjectDocumentCreateWriter()).toBe(true)
  expect(hasFaProjectDocumentUpdateWriter()).toBe(true)
  expect(hasFaProjectDocumentDeleteWriter()).toBe(true)

  const created = await createFaProjectDocumentForRenderer({
    displayName: 'New Hero',
    id: 'doc-new',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  expect(created.id).toBe('doc-new')
  expect(created.displayName).toBe('New Hero')

  const updated = await updateFaProjectDocumentForRenderer('doc-new', {
    displayName: 'Renamed Hero',
    documentBackgroundColor: '#111',
    documentTextColor: '#222',
    extraClasses: 'cls',
    isCategory: true,
    isDead: true,
    isFinished: true,
    isMinor: true,
    parentDocumentId: 'parent-1',
    placementId: 'placement-2',
    sortOrder: 3,
    templateId: 'tpl-2',
    treeOrderNumber: 4,
    worldId: 'world-2'
  })
  expect(updated).toMatchObject({
    displayName: 'Renamed Hero',
    documentBackgroundColor: '#111',
    documentTextColor: '#222',
    extraClasses: 'cls',
    isCategory: true,
    isDead: true,
    isFinished: true,
    isMinor: true,
    parentDocumentId: 'parent-1',
    placementId: 'placement-2',
    sortOrder: 3,
    templateId: 'tpl-2',
    treeOrderNumber: 4,
    worldId: 'world-2'
  })
  await expect(getFaProjectDocumentByIdForRenderer('doc-new')).resolves.toMatchObject({
    displayName: 'Renamed Hero',
    id: 'doc-new'
  })

  await expect(updateFaProjectDocumentForRenderer('missing', {
    displayName: 'Nope'
  })).rejects.toThrow('projectContent override missing document missing')

  const unchanged = await updateFaProjectDocumentForRenderer('doc-new', {})
  expect(unchanged.displayName).toBe('Renamed Hero')
  expect(unchanged.documentBackgroundColor).toBe('#111')

  await deleteFaProjectDocumentForRenderer('doc-new')
  expect(
    getFaComponentTestingProjectContentOverrides()?.documentsById?.['doc-new']
  ).toBeUndefined()
})

test('Test that delete ForRenderer filters placement children and skips undefined keys', async () => {
  setFaComponentTestingProjectContentOverrides({
    documentsById: {
      'drop-me': {
        ...sampleDocument,
        id: 'drop-me'
      }
    },
    placementDocumentChildrenByKey: {
      'placement-1::__root__': [
        {
          displayName: 'Keep',
          hasChildren: false,
          id: 'keep',
          parentDocumentId: null,
          placementId: 'placement-1',
          sortOrder: 0
        },
        {
          displayName: 'Drop',
          hasChildren: false,
          id: 'drop-me',
          parentDocumentId: null,
          placementId: 'placement-1',
          sortOrder: 1
        }
      ]
    }
  })
  const overrides = getFaComponentTestingProjectContentOverrides()
  if (overrides?.placementDocumentChildrenByKey !== undefined) {
    Object.defineProperty(overrides.placementDocumentChildrenByKey, 'placement-ghost::__root__', {
      configurable: true,
      enumerable: true,
      value: undefined
    })
  }

  await deleteFaProjectDocumentForRenderer('drop-me')
  expect(
    getFaComponentTestingProjectContentOverrides()?.placementDocumentChildrenByKey?.['placement-1::__root__']
  ).toEqual([
    expect.objectContaining({ id: 'keep' })
  ])
})

test('Test that document writers fall back to bridge and throw when unavailable', async () => {
  setFaComponentTestingProjectContentOverrides(null)
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {}
    }
  })
  expect(hasFaProjectDocumentCreateWriter()).toBe(false)
  expect(hasFaProjectDocumentUpdateWriter()).toBe(false)
  expect(hasFaProjectDocumentDeleteWriter()).toBe(false)
  await expect(createFaProjectDocumentForRenderer({
    displayName: 'X',
    worldId: 'w'
  })).rejects.toThrow('projectContent.createDocument unavailable')
  await expect(updateFaProjectDocumentForRenderer('x', {
    displayName: 'Y'
  })).rejects.toThrow('projectContent.updateDocument unavailable')
  await expect(deleteFaProjectDocumentForRenderer('x')).rejects.toThrow(
    'projectContent.deleteDocument unavailable'
  )

  const createdBridge = {
    ...sampleDocument,
    id: 'bridge-created'
  }
  const createDocument = vi.fn(async () => createdBridge)
  const updateDocument = vi.fn(async () => ({
    ...createdBridge,
    displayName: 'Updated'
  }))
  const deleteDocument = vi.fn(async () => undefined)
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        createDocument,
        deleteDocument,
        updateDocument
      }
    }
  })
  expect(hasFaProjectDocumentCreateWriter()).toBe(true)
  expect(hasFaProjectDocumentUpdateWriter()).toBe(true)
  expect(hasFaProjectDocumentDeleteWriter()).toBe(true)
  await expect(createFaProjectDocumentForRenderer({
    displayName: 'X',
    worldId: 'w'
  })).resolves.toEqual(createdBridge)
  await expect(updateFaProjectDocumentForRenderer('bridge-created', {
    displayName: 'Updated'
  })).resolves.toMatchObject({ displayName: 'Updated' })
  await deleteFaProjectDocumentForRenderer('bridge-created')
  expect(deleteDocument).toHaveBeenCalledWith('bridge-created')
})

test('Test that create ForRenderer generates id when omitted', async () => {
  setFaComponentTestingProjectContentOverrides({
    documentsById: {}
  })
  const created = await createFaProjectDocumentForRenderer({
    displayName: 'Auto Id',
    worldId: 'world-1'
  })
  expect(created.id.length).toBeGreaterThan(0)
  expect(created.displayName).toBe('Auto Id')
})
