import { afterEach, expect, test, vi } from 'vitest'

import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectTag } from 'app/types/I_faProjectTagDomain'

import {
  getFaComponentTestingProjectContentOverrides,
  setFaComponentTestingProjectContentOverrides
} from '../faComponentTestingProjectContentOverridesWiring'
import {
  deleteFaProjectTagForRenderer,
  listFaProjectDocumentTagsForRenderer,
  listFaProjectDocumentsUnderTagForRenderer,
  listFaProjectTagsForWorldForRenderer,
  listFaProjectTagsWithDocumentCountsForWorldForRenderer,
  listFaProjectWorkspaceHierarchyLayoutForRenderer,
  renameFaProjectTagForRenderer,
  reorderFaProjectDocumentsUnderTagForRenderer,
  setFaProjectDocumentTagsForRenderer
} from '../faComponentTestingProjectContentTagsOverridesWiring'
import {
  normalizeFaComponentTestingTagName,
  resolveFaComponentTestingDocumentWorldId,
  resolveFaComponentTestingTagAssignmentToRef,
  upsertFaComponentTestingTagInWorldMaps
} from '../faComponentTestingProjectContentTagsMutateHelpersWiring'

const sampleDocument: I_faProjectDocument = {
  createdAtMs: 1,
  displayName: 'Hero Doc',
  documentBackgroundColor: null,
  documentTextColor: null,
  extraClasses: '',
  id: 'doc-1',
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

const heroesTag: I_faProjectTag = {
  createdAtMs: 1,
  id: 'tag-heroes',
  name: 'Heroes',
  updatedAtMs: 1,
  worldId: 'world-1'
}

const placesTag: I_faProjectTag = {
  createdAtMs: 2,
  id: 'tag-places',
  name: 'Places',
  updatedAtMs: 2,
  worldId: 'world-1'
}

function buildUnderTagChild (documentId: string, sortOrder: number) {
  return {
    documentBackgroundColor: '',
    documentId,
    documentTextColor: '',
    displayName: documentId,
    extraClasses: '',
    isCategory: false,
    isDead: false,
    isFinished: false,
    isMinor: false,
    sortOrder,
    templateId: null,
    treeOrderNumber: Number.MIN_SAFE_INTEGER
  }
}

afterEach(() => {
  setFaComponentTestingProjectContentOverrides(null)
  vi.unstubAllGlobals()
})

/**
 * listFaProjectTagsForWorldForRenderer
 * Returns tagsByWorldId override rows without calling the bridge.
 */
test('Test that listFaProjectTagsForWorldForRenderer reads tagsByWorldId overrides', async () => {
  setFaComponentTestingProjectContentOverrides({
    tagsByWorldId: {
      'world-1': [heroesTag]
    }
  })
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        listTagsForWorld: vi.fn(async () => {
          throw new Error('bridge should not run')
        })
      }
    }
  })

  await expect(listFaProjectTagsForWorldForRenderer({ worldId: 'world-1' })).resolves.toEqual({
    items: [heroesTag]
  })
})

/**
 * listFaProjectDocumentTagsForRenderer
 * Returns documentTagsByDocumentId override rows.
 */
test('Test that listFaProjectDocumentTagsForRenderer reads documentTagsByDocumentId', async () => {
  setFaComponentTestingProjectContentOverrides({
    documentTagsByDocumentId: {
      'doc-1': [{
        id: 'tag-heroes',
        name: 'Heroes'
      }]
    }
  })

  await expect(listFaProjectDocumentTagsForRenderer({ documentId: 'doc-1' })).resolves.toEqual({
    items: [{
      id: 'tag-heroes',
      name: 'Heroes'
    }]
  })
})

/**
 * setFaProjectDocumentTagsForRenderer
 * Creates isNew tags into tagsByWorldId and stores membership.
 */
test('Test that setFaProjectDocumentTagsForRenderer creates isNew tags in overrides', async () => {
  setFaComponentTestingProjectContentOverrides({
    documentsById: {
      'doc-1': sampleDocument
    },
    tagsByWorldId: {
      'world-1': []
    }
  })

  const result = await setFaProjectDocumentTagsForRenderer({
    documentId: 'doc-1',
    tags: [{
      id: 'tag-new',
      isNew: true,
      name: 'Villains'
    }]
  })

  expect(result.items).toEqual([{
    id: 'tag-new',
    name: 'Villains'
  }])
  const overrides = getFaComponentTestingProjectContentOverrides()
  expect(overrides?.tagsByWorldId?.['world-1']?.map((tag) => tag.id)).toEqual(['tag-new'])
  expect(overrides?.documentTagsByDocumentId?.['doc-1']).toEqual([{
    id: 'tag-new',
    name: 'Villains'
  }])
})

/**
 * renameFaProjectTagForRenderer
 * Merges into an existing same-name tag and rewrites document membership.
 */
test('Test that renameFaProjectTagForRenderer merges into clash tag in overrides', async () => {
  setFaComponentTestingProjectContentOverrides({
    documentTagsByDocumentId: {
      'doc-1': [{
        id: 'tag-heroes',
        name: 'Heroes'
      }]
    },
    documentsUnderTagByTagId: {
      'tag-heroes': [buildUnderTagChild('doc-1', 0)],
      'tag-places': [buildUnderTagChild('doc-2', 0)]
    },
    tagsByWorldId: {
      'world-1': [heroesTag, placesTag]
    },
    tagsWithCountsByWorldId: {
      'world-1': [{
        categoryCount: 0,
        documentCount: 1,
        id: 'tag-heroes',
        name: 'Heroes'
      }, {
        categoryCount: 0,
        documentCount: 1,
        id: 'tag-places',
        name: 'Places'
      }]
    }
  })

  const result = await renameFaProjectTagForRenderer({
    newName: 'Places',
    tagId: 'tag-heroes'
  })

  expect(result.merged).toBe(true)
  expect(result.mergedFromTagId).toBe('tag-heroes')
  expect(result.tag.id).toBe('tag-places')
  const overrides = getFaComponentTestingProjectContentOverrides()
  expect(overrides?.tagsByWorldId?.['world-1']?.map((tag) => tag.id)).toEqual(['tag-places'])
  expect(overrides?.documentTagsByDocumentId?.['doc-1']).toEqual([{
    id: 'tag-places',
    name: 'Places'
  }])
  expect(overrides?.documentsUnderTagByTagId?.['tag-places']?.map((row) => row.documentId)).toEqual([
    'doc-2',
    'doc-1'
  ])
  expect(overrides?.documentsUnderTagByTagId?.['tag-heroes']).toBeUndefined()
})

/**
 * deleteFaProjectTagForRenderer
 * Removes tag from world maps, membership, and under-tag lists.
 */
test('Test that deleteFaProjectTagForRenderer removes tag from overrides', async () => {
  setFaComponentTestingProjectContentOverrides({
    documentTagsByDocumentId: {
      'doc-1': [{
        id: 'tag-heroes',
        name: 'Heroes'
      }, {
        id: 'tag-places',
        name: 'Places'
      }]
    },
    documentsUnderTagByTagId: {
      'tag-heroes': [buildUnderTagChild('doc-1', 0)]
    },
    tagsByWorldId: {
      'world-1': [heroesTag, placesTag]
    },
    tagsWithCountsByWorldId: {
      'world-1': [{
        categoryCount: 0,
        documentCount: 1,
        id: 'tag-heroes',
        name: 'Heroes'
      }, {
        categoryCount: 0,
        documentCount: 0,
        id: 'tag-places',
        name: 'Places'
      }]
    },
    workspaceHierarchyLayoutWorlds: [{
      color: '#000',
      colorPalette: '',
      displayName: 'World',
      groups: [],
      id: 'world-1',
      placements: [],
      sortOrder: 0,
      tags: [{
        categoryCount: 0,
        documentCount: 1,
        id: 'tag-heroes',
        name: 'Heroes'
      }]
    }]
  })

  await deleteFaProjectTagForRenderer({ tagId: 'tag-heroes' })

  const overrides = getFaComponentTestingProjectContentOverrides()
  expect(overrides?.tagsByWorldId?.['world-1']?.map((tag) => tag.id)).toEqual(['tag-places'])
  expect(overrides?.documentTagsByDocumentId?.['doc-1']).toEqual([{
    id: 'tag-places',
    name: 'Places'
  }])
  expect(overrides?.documentsUnderTagByTagId?.['tag-heroes']).toBeUndefined()
  expect(overrides?.workspaceHierarchyLayoutWorlds?.[0]?.tags).toEqual([])
})

test('Test that listFaProjectWorkspaceHierarchyLayoutForRenderer reads layout overrides', async () => {
  setFaComponentTestingProjectContentOverrides({
    workspaceHierarchyLayoutWorlds: [{
      color: '#111',
      colorPalette: '',
      displayName: 'Override World',
      groups: [],
      id: 'world-1',
      placements: [],
      sortOrder: 0
    }]
  })
  await expect(listFaProjectWorkspaceHierarchyLayoutForRenderer()).resolves.toEqual({
    worlds: [{
      color: '#111',
      colorPalette: '',
      displayName: 'Override World',
      groups: [],
      id: 'world-1',
      placements: [],
      sortOrder: 0
    }]
  })
})

test('Test that listFaProjectWorkspaceHierarchyLayoutForRenderer uses bridge and throws when missing', async () => {
  const listWorkspaceHierarchyLayout = vi.fn(async () => ({
    worlds: [{
      color: '#222',
      colorPalette: '',
      displayName: 'Bridge World',
      groups: [],
      id: 'world-bridge',
      placements: [],
      sortOrder: 0
    }]
  }))
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        listWorkspaceHierarchyLayout
      }
    }
  })
  await expect(listFaProjectWorkspaceHierarchyLayoutForRenderer()).resolves.toEqual({
    worlds: [{
      color: '#222',
      colorPalette: '',
      displayName: 'Bridge World',
      groups: [],
      id: 'world-bridge',
      placements: [],
      sortOrder: 0
    }]
  })
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {}
    }
  })
  await expect(listFaProjectWorkspaceHierarchyLayoutForRenderer()).rejects.toThrow(
    'projectContent.listWorkspaceHierarchyLayout unavailable'
  )
})

test('Test that list tag helpers fall back to bridge or empty when overrides absent', async () => {
  const listTagsForWorld = vi.fn(async () => ({ items: [heroesTag] }))
  const listTagsWithDocumentCountsForWorld = vi.fn(async () => ({
    items: [{
      categoryCount: 0,
      documentCount: 2,
      id: 'tag-heroes',
      name: 'Heroes'
    }]
  }))
  const listDocumentTags = vi.fn(async () => ({
    items: [{
      id: 'tag-heroes',
      name: 'Heroes'
    }]
  }))
  const listDocumentsUnderTag = vi.fn(async () => ({
    items: [buildUnderTagChild('doc-1', 0)]
  }))
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        listDocumentTags,
        listDocumentsUnderTag,
        listTagsForWorld,
        listTagsWithDocumentCountsForWorld
      }
    }
  })
  await expect(listFaProjectTagsForWorldForRenderer({ worldId: 'world-1' })).resolves.toEqual({
    items: [heroesTag]
  })
  await expect(
    listFaProjectTagsWithDocumentCountsForWorldForRenderer({ worldId: 'world-1' })
  ).resolves.toEqual({
    items: [{
      categoryCount: 0,
      documentCount: 2,
      id: 'tag-heroes',
      name: 'Heroes'
    }]
  })
  await expect(listFaProjectDocumentTagsForRenderer({ documentId: 'doc-1' })).resolves.toEqual({
    items: [{
      id: 'tag-heroes',
      name: 'Heroes'
    }]
  })
  await expect(listFaProjectDocumentsUnderTagForRenderer({ tagId: 'tag-heroes' })).resolves.toEqual({
    items: [buildUnderTagChild('doc-1', 0)]
  })

  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {}
    }
  })
  await expect(listFaProjectTagsForWorldForRenderer({ worldId: 'world-1' })).resolves.toEqual({
    items: []
  })
  await expect(
    listFaProjectTagsWithDocumentCountsForWorldForRenderer({ worldId: 'world-1' })
  ).resolves.toEqual({ items: [] })
  await expect(listFaProjectDocumentTagsForRenderer({ documentId: 'doc-1' })).resolves.toEqual({
    items: []
  })
  await expect(listFaProjectDocumentsUnderTagForRenderer({ tagId: 'tag-heroes' })).resolves.toEqual({
    items: []
  })
})

test('Test that listFaProjectTagsWithDocumentCountsForWorldForRenderer reads overrides', async () => {
  setFaComponentTestingProjectContentOverrides({
    tagsWithCountsByWorldId: {
      'world-1': [{
        categoryCount: 1,
        documentCount: 0,
        id: 'tag-heroes',
        name: 'Heroes'
      }]
    }
  })
  await expect(
    listFaProjectTagsWithDocumentCountsForWorldForRenderer({ worldId: 'world-1' })
  ).resolves.toEqual({
    items: [{
      categoryCount: 1,
      documentCount: 0,
      id: 'tag-heroes',
      name: 'Heroes'
    }]
  })
})

test('Test that listFaProjectDocumentsUnderTagForRenderer reads overrides', async () => {
  setFaComponentTestingProjectContentOverrides({
    documentsUnderTagByTagId: {
      'tag-heroes': [buildUnderTagChild('doc-1', 0)]
    }
  })
  await expect(listFaProjectDocumentsUnderTagForRenderer({ tagId: 'tag-heroes' })).resolves.toEqual({
    items: [buildUnderTagChild('doc-1', 0)]
  })
})

test('Test that renameFaProjectTagForRenderer renames in place without merge', async () => {
  setFaComponentTestingProjectContentOverrides({
    tagsByWorldId: {
      'world-1': [heroesTag]
    },
    tagsWithCountsByWorldId: {
      'world-1': [{
        categoryCount: 0,
        documentCount: 1,
        id: 'tag-heroes',
        name: 'Heroes'
      }]
    }
  })
  const result = await renameFaProjectTagForRenderer({
    newName: 'Champions',
    tagId: 'tag-heroes'
  })
  expect(result.merged).toBe(false)
  expect(result.tag.name).toBe('Champions')
  expect(getFaComponentTestingProjectContentOverrides()?.tagsByWorldId?.['world-1']?.[0]?.name)
    .toBe('Champions')
})

test('Test that renameFaProjectTagForRenderer throws when tag missing or bridge unavailable', async () => {
  setFaComponentTestingProjectContentOverrides({
    tagsByWorldId: {
      'world-1': [heroesTag]
    }
  })
  await expect(renameFaProjectTagForRenderer({
    newName: 'X',
    tagId: 'missing'
  })).rejects.toThrow('renameTag: tag not found in overrides')

  setFaComponentTestingProjectContentOverrides(null)
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {}
    }
  })
  await expect(renameFaProjectTagForRenderer({
    newName: 'X',
    tagId: 'tag-heroes'
  })).rejects.toThrow('projectContent.renameTag unavailable')
})

test('Test that renameFaProjectTagForRenderer uses bridge when overrides absent', async () => {
  const renameTag = vi.fn(async () => ({
    merged: false,
    mergedFromTagId: null,
    tag: {
      ...heroesTag,
      name: 'Bridge'
    }
  }))
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        renameTag
      }
    }
  })
  await expect(renameFaProjectTagForRenderer({
    newName: 'Bridge',
    tagId: 'tag-heroes'
  })).resolves.toMatchObject({
    merged: false,
    tag: {
      name: 'Bridge'
    }
  })
})

test('Test that setFaProjectDocumentTagsForRenderer uses bridge or empty fallback', async () => {
  const setDocumentTags = vi.fn(async () => ({
    items: [{
      id: 'tag-heroes',
      name: 'Heroes'
    }]
  }))
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        setDocumentTags
      }
    }
  })
  await expect(setFaProjectDocumentTagsForRenderer({
    documentId: 'doc-1',
    tags: [{
      id: 'tag-heroes',
      name: 'Heroes'
    }]
  })).resolves.toEqual({
    items: [{
      id: 'tag-heroes',
      name: 'Heroes'
    }]
  })
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {}
    }
  })
  await expect(setFaProjectDocumentTagsForRenderer({
    documentId: 'doc-1',
    tags: []
  })).resolves.toEqual({
    items: []
  })
})

test('Test that delete and reorder tag helpers use bridge or no-op when unavailable', async () => {
  const deleteTag = vi.fn(async () => undefined)
  const reorderDocumentsUnderTag = vi.fn(async () => undefined)
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        deleteTag,
        reorderDocumentsUnderTag
      }
    }
  })
  await deleteFaProjectTagForRenderer({ tagId: 'tag-heroes' })
  expect(deleteTag).toHaveBeenCalledWith({ tagId: 'tag-heroes' })
  await reorderFaProjectDocumentsUnderTagForRenderer({
    orderedDocumentIds: ['doc-1'],
    tagId: 'tag-heroes'
  })
  expect(reorderDocumentsUnderTag).toHaveBeenCalled()

  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {}
    }
  })
  await expect(deleteFaProjectTagForRenderer({ tagId: 'tag-heroes' })).resolves.toBeUndefined()
  await expect(reorderFaProjectDocumentsUnderTagForRenderer({
    orderedDocumentIds: ['doc-1'],
    tagId: 'tag-heroes'
  })).resolves.toBeUndefined()
})

test('Test that reorderFaProjectDocumentsUnderTagForRenderer reorders override rows', async () => {
  setFaComponentTestingProjectContentOverrides({
    documentsUnderTagByTagId: {
      'tag-heroes': [
        buildUnderTagChild('doc-a', 0),
        buildUnderTagChild('doc-b', 1)
      ]
    }
  })
  await reorderFaProjectDocumentsUnderTagForRenderer({
    orderedDocumentIds: ['doc-b', 'doc-a', 'missing'],
    tagId: 'tag-heroes'
  })
  expect(
    getFaComponentTestingProjectContentOverrides()?.documentsUnderTagByTagId?.['tag-heroes']
      ?.map((row) => row.documentId)
  ).toEqual(['doc-b', 'doc-a'])
})

test('Test that mutate helpers upsert and resolve tag assignments', () => {
  expect(normalizeFaComponentTestingTagName('  Heroes  ')).toBe('Heroes')
  expect(resolveFaComponentTestingDocumentWorldId('doc-1')).toBeNull()
  setFaComponentTestingProjectContentOverrides({
    documentsById: {
      'doc-1': sampleDocument
    },
    tagsByWorldId: {
      'world-1': [heroesTag]
    }
  })
  expect(resolveFaComponentTestingDocumentWorldId('doc-1')).toBe('world-1')
  expect(resolveFaComponentTestingTagAssignmentToRef('world-1', {
    id: 'ignored',
    name: 'heroes'
  })).toEqual({
    id: 'tag-heroes',
    name: 'Heroes'
  })
  expect(resolveFaComponentTestingTagAssignmentToRef('world-1', {
    id: 'tag-heroes',
    name: 'Heroes Renamed'
  })).toEqual({
    id: 'tag-heroes',
    name: 'Heroes Renamed'
  })
  upsertFaComponentTestingTagInWorldMaps('world-1', {
    ...heroesTag,
    name: 'Heroes Updated',
    updatedAtMs: 9
  }, {
    categoryCount: 0,
    documentCount: 3,
    id: 'tag-heroes',
    name: 'Heroes Updated'
  })
  expect(getFaComponentTestingProjectContentOverrides()?.tagsByWorldId?.['world-1']?.[0]?.name)
    .toBe('Heroes Updated')
  upsertFaComponentTestingTagInWorldMaps('world-1', placesTag, {
    categoryCount: 0,
    documentCount: 1,
    id: 'tag-places',
    name: 'Places'
  })
  expect(
    getFaComponentTestingProjectContentOverrides()?.tagsByWorldId?.['world-1']?.map((tag) => tag.id)
  ).toEqual(['tag-heroes', 'tag-places'])
  setFaComponentTestingProjectContentOverrides(null)
  upsertFaComponentTestingTagInWorldMaps('world-1', heroesTag, {
    categoryCount: 0,
    documentCount: 1,
    id: 'tag-heroes',
    name: 'Heroes'
  })
  expect(getFaComponentTestingProjectContentOverrides()).toBeNull()
})

test('Test that setFaProjectDocumentTagsForRenderer works with documentTags map only', async () => {
  setFaComponentTestingProjectContentOverrides({
    documentTagsByDocumentId: {},
    documentsById: {
      'doc-1': sampleDocument
    }
  })
  const result = await setFaProjectDocumentTagsForRenderer({
    documentId: 'doc-1',
    tags: [{
      id: 'tag-solo',
      isNew: true,
      name: 'Solo'
    }]
  })
  expect(result.items).toEqual([{
    id: 'tag-solo',
    name: 'Solo'
  }])
})

/**
 * setFaProjectDocumentTagsForRenderer
 * Document-only overrides must not call bridge setDocumentTags (Playwright save path).
 */
test('Test that setFaProjectDocumentTagsForRenderer uses overrides when only documentsById seeded', async () => {
  const setDocumentTags = vi.fn(async () => ({
    items: []
  }))
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        setDocumentTags
      }
    }
  })
  setFaComponentTestingProjectContentOverrides({
    documentsById: {
      'doc-1': sampleDocument
    }
  })
  await expect(setFaProjectDocumentTagsForRenderer({
    documentId: 'doc-1',
    tags: []
  })).resolves.toEqual({
    items: []
  })
  expect(setDocumentTags).not.toHaveBeenCalled()
  expect(
    getFaComponentTestingProjectContentOverrides()?.documentTagsByDocumentId?.['doc-1']
  ).toEqual([])
})

/**
 * listFaProjectDocumentTagsForRenderer
 * Document-only overrides return empty membership without bridge.
 */
test('Test that listFaProjectDocumentTagsForRenderer skips bridge when overrides present', async () => {
  const listDocumentTags = vi.fn(async () => ({
    items: [{
      id: 'tag-bridge',
      name: 'Bridge'
    }]
  }))
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        listDocumentTags
      }
    }
  })
  setFaComponentTestingProjectContentOverrides({
    documentsById: {
      'doc-1': sampleDocument
    }
  })
  await expect(listFaProjectDocumentTagsForRenderer({
    documentId: 'doc-1'
  })).resolves.toEqual({
    items: []
  })
  expect(listDocumentTags).not.toHaveBeenCalled()
})

test('Test that rename and delete cover sparse override maps', async () => {
  setFaComponentTestingProjectContentOverrides({
    tagsByWorldId: {
      'world-1': [heroesTag, placesTag]
    }
  })
  await expect(renameFaProjectTagForRenderer({
    newName: 'Renamed',
    tagId: 'tag-heroes'
  })).resolves.toMatchObject({
    merged: false,
    tag: {
      name: 'Renamed'
    }
  })

  setFaComponentTestingProjectContentOverrides({
    documentTagsByDocumentId: {
      'doc-1': [{
        id: 'tag-heroes',
        name: 'Heroes'
      }, {
        id: 'tag-keep',
        name: 'Keep'
      }]
    },
    tagsByWorldId: {
      'world-1': [heroesTag, placesTag]
    },
    workspaceHierarchyLayoutWorlds: [{
      color: '#000',
      colorPalette: '',
      displayName: 'World',
      groups: [],
      id: 'world-1',
      placements: [],
      sortOrder: 0
    }]
  })
  await renameFaProjectTagForRenderer({
    newName: 'Places',
    tagId: 'tag-heroes'
  })
  expect(getFaComponentTestingProjectContentOverrides()?.documentTagsByDocumentId?.['doc-1']).toEqual([
    {
      id: 'tag-places',
      name: 'Places'
    },
    {
      id: 'tag-keep',
      name: 'Keep'
    }
  ])

  setFaComponentTestingProjectContentOverrides({
    tagsByWorldId: {
      'world-1': [placesTag]
    }
  })
  await deleteFaProjectTagForRenderer({ tagId: 'tag-places' })
  expect(getFaComponentTestingProjectContentOverrides()?.tagsByWorldId?.['world-1']).toEqual([])
})
