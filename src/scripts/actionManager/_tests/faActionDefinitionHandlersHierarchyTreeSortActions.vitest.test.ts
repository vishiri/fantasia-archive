import { afterEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import { createFaActionDefinitionHandlersHierarchyTreeSortActions } from '../faActionDefinitionHandlersHierarchyTreeSortActionsWiring'
import { setFaComponentTestingProjectContentOverrides } from 'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'

afterEach(() => {
  vi.unstubAllGlobals()
  setFaComponentTestingProjectContentOverrides(null)
})

function stubProjectContentApi (api: {
  listPlacementDocumentChildren?: unknown
  reindexDocumentSiblingsInHierarchy?: unknown
} | undefined): void {
  vi.stubGlobal('window', {
    faContentBridgeAPIs: api === undefined
      ? undefined
      : {
          projectContent: api
        }
  })
}

function seedHierarchySortDocuments (
  items: Array<{
    displayName: string
    id: string
    parentDocumentId?: string | null
    placementId?: string
    sortOrder: number
  }>
): void {
  setActivePinia(createPinia())
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const documents: I_faProjectDocument[] = items.map((item, index) => {
    return {
      createdAtMs: index,
      displayName: item.displayName,
      documentBackgroundColor: null,
      documentTextColor: null,
      extraClasses: '',
      id: item.id,
      isCategory: false,
      isDead: false,
      isFinished: false,
      isMinor: false,
      parentDocumentId: item.parentDocumentId ?? null,
      placementId: item.placementId ?? 'placement-1',
      sortOrder: item.sortOrder,
      templateId: 'tpl-1',
      treeOrderNumber: 1,
      updatedAtMs: index,
      worldId: 'world-1'
    }
  })
  S_FaProjectHierarchyTree().replaceDocumentIndexFromDocuments(documents)
}

test('handleSortHierarchyTreeDocuments reindexes document children then refreshes tree nodes', async () => {
  seedHierarchySortDocuments([
    {
      displayName: 'Beta',
      id: 'b',
      parentDocumentId: 'doc-1',
      sortOrder: 0
    },
    {
      displayName: 'Alpha',
      id: 'a',
      parentDocumentId: 'doc-1',
      sortOrder: 1
    }
  ])
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  stubProjectContentApi({
    listPlacementDocumentChildren: vi.fn(async () => ({ items: [] })),
    reindexDocumentSiblingsInHierarchy
  })
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes })
  })

  const continuation = await handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: 'doc-1',
    key: 'name',
    nodeKind: 'document',
    placementId: 'placement-1',
    scope: 'direct'
  })

  expect(reindexDocumentSiblingsInHierarchy).toHaveBeenCalledWith({
    movedDocumentId: 'a',
    orderedDocumentIds: ['a', 'b'],
    parentDocumentId: 'doc-1',
    placementId: 'placement-1'
  })
  expect(refreshHierarchyTreeNodes).toHaveBeenCalledWith(['doc-1'])
  expect(continuation).toEqual({ payloadPreview: 'direct:name:asc' })
})

test('handleSortHierarchyTreeDocuments runs a later sort of the same placement after the earlier reindex', async () => {
  seedHierarchySortDocuments([
    {
      displayName: 'Beta',
      id: 'b',
      parentDocumentId: 'doc-1',
      sortOrder: 0
    },
    {
      displayName: 'Alpha',
      id: 'a',
      parentDocumentId: 'doc-1',
      sortOrder: 1
    }
  ])
  let releaseFirstReindex: (() => void) | undefined
  const reindexDocumentSiblingsInHierarchy = vi.fn(() => {
    if (reindexDocumentSiblingsInHierarchy.mock.calls.length === 1) {
      return new Promise<void>((resolve) => {
        releaseFirstReindex = resolve
      })
    }
    return Promise.resolve()
  })
  stubProjectContentApi({
    listPlacementDocumentChildren: vi.fn(async () => ({ items: [] })),
    reindexDocumentSiblingsInHierarchy
  })
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes })
  })
  const sortPayload = {
    documentId: 'doc-1',
    key: 'name' as const,
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    scope: 'direct' as const
  }
  const firstSort = handleSortHierarchyTreeDocuments({
    ...sortPayload,
    direction: 'asc'
  })
  await vi.waitUntil(() => releaseFirstReindex !== undefined)
  const secondSort = handleSortHierarchyTreeDocuments({
    ...sortPayload,
    direction: 'desc'
  })
  await Promise.resolve()
  expect(reindexDocumentSiblingsInHierarchy).toHaveBeenCalledTimes(1)
  releaseFirstReindex?.()
  await firstSort
  await secondSort
  expect(reindexDocumentSiblingsInHierarchy).toHaveBeenCalledTimes(2)
})

test('handleSortHierarchyTreeDocuments sorts template placement root bucket', async () => {
  seedHierarchySortDocuments([
    {
      displayName: 'Beta',
      id: 'b',
      parentDocumentId: null,
      sortOrder: 0
    },
    {
      displayName: 'Alpha',
      id: 'a',
      parentDocumentId: null,
      sortOrder: 1
    }
  ])
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  stubProjectContentApi({
    listPlacementDocumentChildren: vi.fn(async () => ({ items: [] })),
    reindexDocumentSiblingsInHierarchy
  })
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes })
  })

  await handleSortHierarchyTreeDocuments({
    direction: 'desc',
    documentId: null,
    key: 'customOrder',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    scope: 'direct'
  })

  expect(reindexDocumentSiblingsInHierarchy).toHaveBeenCalledWith({
    movedDocumentId: 'b',
    orderedDocumentIds: ['b', 'a'],
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  expect(refreshHierarchyTreeNodes).toHaveBeenCalledWith(['placement-1'])
})

test('handleSortHierarchyTreeDocuments no-ops when placement id empty', async () => {
  stubProjectContentApi(undefined)
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes })
  })

  await handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: 'doc-1',
    key: 'name',
    nodeKind: 'document',
    placementId: '   ',
    scope: 'direct'
  })

  expect(refreshHierarchyTreeNodes).not.toHaveBeenCalled()
})

test('handleSortHierarchyTreeDocuments no-ops when document id missing', async () => {
  stubProjectContentApi(undefined)
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes })
  })

  await handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: '   ',
    key: 'name',
    nodeKind: 'document',
    placementId: 'placement-1',
    scope: 'direct'
  })

  expect(refreshHierarchyTreeNodes).not.toHaveBeenCalled()
})

test('handleSortHierarchyTreeDocuments throws when project content bridge missing', async () => {
  stubProjectContentApi(undefined)
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes })
  })

  await expect(handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: 'doc-1',
    key: 'name',
    nodeKind: 'document',
    placementId: 'placement-1',
    scope: 'direct'
  })).rejects.toThrow('Project hierarchy sort bridge is unavailable')
  expect(refreshHierarchyTreeNodes).not.toHaveBeenCalled()
})

test('handleSortHierarchyTreeDocuments refreshes every recursive sort bucket parent', async () => {
  seedHierarchySortDocuments([
    {
      displayName: 'Parent',
      id: 'doc-parent',
      parentDocumentId: null,
      sortOrder: 0
    },
    {
      displayName: 'Beta',
      id: 'b',
      parentDocumentId: 'doc-parent',
      sortOrder: 0
    },
    {
      displayName: 'Alpha',
      id: 'a',
      parentDocumentId: 'doc-parent',
      sortOrder: 1
    }
  ])
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  stubProjectContentApi({
    listPlacementDocumentChildren: vi.fn(async () => ({ items: [] })),
    reindexDocumentSiblingsInHierarchy
  })
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes })
  })

  await handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: null,
    key: 'name',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    scope: 'recursive'
  })

  expect(refreshHierarchyTreeNodes).toHaveBeenCalledWith(['placement-1', 'doc-parent'])
})

test('handleSortHierarchyTreeDocuments refreshes completed buckets before rethrowing mid-run failure', async () => {
  seedHierarchySortDocuments([
    {
      displayName: 'Parent',
      id: 'doc-parent',
      parentDocumentId: null,
      sortOrder: 0
    },
    {
      displayName: 'Child',
      id: 'doc-child',
      parentDocumentId: 'doc-parent',
      sortOrder: 0
    }
  ])
  const reindexDocumentSiblingsInHierarchy = vi.fn(async (input: { parentDocumentId: string | null }) => {
    if (input.parentDocumentId === 'doc-parent') {
      throw new Error('reindex failed')
    }
  })
  stubProjectContentApi({
    listPlacementDocumentChildren: vi.fn(async () => ({ items: [] })),
    reindexDocumentSiblingsInHierarchy
  })
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes })
  })

  await expect(handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: null,
    key: 'name',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    scope: 'recursive'
  })).rejects.toThrow('reindex failed')

  expect(refreshHierarchyTreeNodes).toHaveBeenCalledWith(['placement-1'])
})

test('handleSortHierarchyTreeDocuments sorts documents under a tag via overrides', async () => {
  setFaComponentTestingProjectContentOverrides({
    documentsUnderTagByTagId: {
      'tag-1': [
        {
          documentBackgroundColor: '',
          documentId: 'doc-b',
          documentTextColor: '',
          displayName: 'Beta',
          extraClasses: '',
          isCategory: false,
          isDead: false,
          isFinished: false,
          isMinor: false,
          sortOrder: 0,
          templateId: null,
          treeOrderNumber: Number.MIN_SAFE_INTEGER
        },
        {
          documentBackgroundColor: '',
          documentId: 'doc-a',
          documentTextColor: '',
          displayName: 'Alpha',
          extraClasses: '',
          isCategory: false,
          isDead: false,
          isFinished: false,
          isMinor: false,
          sortOrder: 1,
          templateId: null,
          treeOrderNumber: Number.MIN_SAFE_INTEGER
        }
      ]
    }
  })
  stubProjectContentApi(undefined)
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes })
  })

  const continuation = await handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: null,
    key: 'name',
    nodeKind: 'tag',
    placementId: '',
    scope: 'direct',
    tagId: 'tag-1'
  })

  expect(refreshHierarchyTreeNodes).toHaveBeenCalledWith(['tag-1'])
  expect(continuation).toEqual({ payloadPreview: 'direct:name:asc:tag' })
})

test('handleSortHierarchyTreeDocuments under-tag no-ops and throws on missing bridge', async () => {
  stubProjectContentApi(undefined)
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes })
  })

  await expect(handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: null,
    key: 'name',
    nodeKind: 'tag',
    placementId: '',
    scope: 'recursive',
    tagId: 'tag-1'
  })).resolves.toBeUndefined()

  await expect(handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: null,
    key: 'name',
    nodeKind: 'tag',
    placementId: '',
    scope: 'direct',
    tagId: '   '
  })).resolves.toBeUndefined()

  await expect(handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: null,
    key: 'name',
    nodeKind: 'tag',
    placementId: '',
    scope: 'direct',
    tagId: 'tag-1'
  })).rejects.toThrow('Project hierarchy under-tag sort bridge is unavailable')

  setFaComponentTestingProjectContentOverrides({
    documentsUnderTagByTagId: {
      'tag-empty': []
    }
  })
  await expect(handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: null,
    key: 'name',
    nodeKind: 'tag',
    placementId: '',
    scope: 'direct',
    tagId: 'tag-empty'
  })).resolves.toEqual({
    payloadPreview: 'direct:name:asc:tag'
  })
  expect(refreshHierarchyTreeNodes).not.toHaveBeenCalled()
})

test('handleSortHierarchyTreeDocuments under-tag uses bridge APIs when present', async () => {
  const listDocumentsUnderTag = vi.fn(async () => ({
    items: [
      {
        documentBackgroundColor: '',
        documentId: 'doc-b',
        documentTextColor: '',
        displayName: 'Beta',
        extraClasses: '',
        isCategory: false,
        isDead: false,
        isFinished: false,
        isMinor: false,
        sortOrder: 0,
        templateId: null,
        treeOrderNumber: Number.MIN_SAFE_INTEGER
      },
      {
        documentBackgroundColor: '',
        documentId: 'doc-a',
        documentTextColor: '',
        displayName: 'Alpha',
        extraClasses: '',
        isCategory: false,
        isDead: false,
        isFinished: false,
        isMinor: false,
        sortOrder: 1,
        templateId: null,
        treeOrderNumber: Number.MIN_SAFE_INTEGER
      }
    ]
  }))
  const reorderDocumentsUnderTag = vi.fn(async () => undefined)
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        listDocumentsUnderTag,
        reorderDocumentsUnderTag
      }
    }
  })
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes })
  })

  await handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: null,
    key: 'name',
    nodeKind: 'tag',
    placementId: '',
    scope: 'direct',
    tagId: 'tag-1'
  })

  expect(reorderDocumentsUnderTag).toHaveBeenCalledWith({
    orderedDocumentIds: ['doc-a', 'doc-b'],
    tagId: 'tag-1'
  })
  expect(refreshHierarchyTreeNodes).toHaveBeenCalledWith(['tag-1'])
})

test('handleSortHierarchyTreeDocuments does not reindex after the project changes', async () => {
  seedHierarchySortDocuments([
    {
      displayName: 'Beta',
      id: 'b',
      parentDocumentId: 'doc-1',
      sortOrder: 0
    },
    {
      displayName: 'Alpha',
      id: 'a',
      parentDocumentId: 'doc-1',
      sortOrder: 1
    }
  ])
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  stubProjectContentApi({
    listPlacementDocumentChildren: vi.fn(async () => ({ items: [] })),
    reindexDocumentSiblingsInHierarchy
  })
  let releaseEnsure: (() => void) | undefined
  vi.spyOn(S_FaProjectHierarchyTree(), 'ensureDocumentIndexLoaded').mockImplementation(() => {
    return new Promise((resolve) => {
      releaseEnsure = () => {
        resolve()
      }
    })
  })
  const refreshHierarchyTreeNodes = vi.fn()
  let epoch = 1
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes }),
    readProjectContentEpoch: () => epoch
  })
  const pending = handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: 'doc-1',
    key: 'name',
    nodeKind: 'document',
    placementId: 'placement-1',
    scope: 'direct'
  })
  await Promise.resolve()
  await Promise.resolve()
  if (releaseEnsure === undefined) {
    throw new Error('missing index load')
  }
  epoch = 2
  releaseEnsure()
  await pending
  expect(reindexDocumentSiblingsInHierarchy).not.toHaveBeenCalled()
  expect(refreshHierarchyTreeNodes).not.toHaveBeenCalled()
})

test('handleSortHierarchyTreeDocuments does not reindex while a project open is in flight', async () => {
  seedHierarchySortDocuments([
    {
      displayName: 'Beta',
      id: 'b',
      parentDocumentId: 'doc-1',
      sortOrder: 0
    },
    {
      displayName: 'Alpha',
      id: 'a',
      parentDocumentId: 'doc-1',
      sortOrder: 1
    }
  ])
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  stubProjectContentApi({
    listPlacementDocumentChildren: vi.fn(async () => ({ items: [] })),
    reindexDocumentSiblingsInHierarchy
  })
  let releaseEnsure: (() => void) | undefined
  vi.spyOn(S_FaProjectHierarchyTree(), 'ensureDocumentIndexLoaded').mockImplementation(() => {
    return new Promise((resolve) => {
      releaseEnsure = () => {
        resolve()
      }
    })
  })
  const refreshHierarchyTreeNodes = vi.fn()
  let inFlight = false
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes }),
    isProjectReplacementInFlight: () => inFlight,
    readProjectContentEpoch: () => 1
  })
  const pending = handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: 'doc-1',
    key: 'name',
    nodeKind: 'document',
    placementId: 'placement-1',
    scope: 'direct'
  })
  await Promise.resolve()
  await Promise.resolve()
  if (releaseEnsure === undefined) {
    throw new Error('missing index load')
  }
  inFlight = true
  releaseEnsure()
  await pending
  expect(reindexDocumentSiblingsInHierarchy).not.toHaveBeenCalled()
  expect(refreshHierarchyTreeNodes).not.toHaveBeenCalled()
})

test('handleSortHierarchyTreeDocuments does not reorder a tag after the project changes', async () => {
  let releaseList: ((value: { items: [] }) => void) | undefined
  const listDocumentsUnderTag = vi.fn(() => {
    return new Promise<{ items: [] }>((resolve) => {
      releaseList = resolve
    })
  })
  const reorderDocumentsUnderTag = vi.fn(async () => undefined)
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        listDocumentsUnderTag,
        reorderDocumentsUnderTag
      }
    }
  })
  const refreshHierarchyTreeNodes = vi.fn()
  let epoch = 1
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes }),
    readProjectContentEpoch: () => epoch
  })
  const pending = handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: null,
    key: 'name',
    nodeKind: 'tag',
    placementId: '',
    scope: 'direct',
    tagId: 'tag-1'
  })
  await Promise.resolve()
  await Promise.resolve()
  if (releaseList === undefined) {
    throw new Error('missing tag list')
  }
  epoch = 2
  releaseList({ items: [] })
  await pending
  expect(reorderDocumentsUnderTag).not.toHaveBeenCalled()
  expect(refreshHierarchyTreeNodes).not.toHaveBeenCalled()
})

test('handleSortHierarchyTreeDocuments does not reorder a tag while a project open is in flight', async () => {
  let releaseList: ((value: { items: [] }) => void) | undefined
  const listDocumentsUnderTag = vi.fn(() => {
    return new Promise<{ items: [] }>((resolve) => {
      releaseList = resolve
    })
  })
  const reorderDocumentsUnderTag = vi.fn(async () => undefined)
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        listDocumentsUnderTag,
        reorderDocumentsUnderTag
      }
    }
  })
  const refreshHierarchyTreeNodes = vi.fn()
  let inFlight = false
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes }),
    isProjectReplacementInFlight: () => inFlight,
    readProjectContentEpoch: () => 1
  })
  const pending = handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: null,
    key: 'name',
    nodeKind: 'tag',
    placementId: '',
    scope: 'direct',
    tagId: 'tag-1'
  })
  await Promise.resolve()
  await Promise.resolve()
  if (releaseList === undefined) {
    throw new Error('missing tag list')
  }
  inFlight = true
  releaseList({ items: [] })
  await pending
  expect(reorderDocumentsUnderTag).not.toHaveBeenCalled()
  expect(refreshHierarchyTreeNodes).not.toHaveBeenCalled()
})

function tagSortItem (documentId: string): {
  documentBackgroundColor: string
  documentId: string
  documentTextColor: string
  displayName: string
  extraClasses: string
  isCategory: boolean
  isDead: boolean
  isFinished: boolean
  isMinor: boolean
  sortOrder: number
  templateId: null
  treeOrderNumber: number
} {
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
    sortOrder: 0,
    templateId: null,
    treeOrderNumber: Number.MIN_SAFE_INTEGER
  }
}

test('handleSortHierarchyTreeDocuments skips a tag reorder when the project changes after the list', async () => {
  let epochReads = 0
  const listDocumentsUnderTag = vi.fn(async () => ({
    items: [tagSortItem('doc-b'), tagSortItem('doc-a')]
  }))
  const reorderDocumentsUnderTag = vi.fn(async () => undefined)
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        listDocumentsUnderTag,
        reorderDocumentsUnderTag
      }
    }
  })
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes }),
    readProjectContentEpoch: () => {
      epochReads += 1
      return epochReads >= 4 ? 2 : 1
    }
  })
  await handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: null,
    key: 'name',
    nodeKind: 'tag',
    placementId: '',
    scope: 'direct',
    tagId: 'tag-1'
  })
  expect(reorderDocumentsUnderTag).not.toHaveBeenCalled()
  expect(refreshHierarchyTreeNodes).not.toHaveBeenCalled()
})

test('handleSortHierarchyTreeDocuments skips a tag refresh when the project changes after reorder', async () => {
  let epochReads = 0
  const listDocumentsUnderTag = vi.fn(async () => ({
    items: [tagSortItem('doc-b'), tagSortItem('doc-a')]
  }))
  const reorderDocumentsUnderTag = vi.fn(async () => undefined)
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        listDocumentsUnderTag,
        reorderDocumentsUnderTag
      }
    }
  })
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes }),
    readProjectContentEpoch: () => {
      epochReads += 1
      return epochReads >= 5 ? 2 : 1
    }
  })
  await handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: null,
    key: 'name',
    nodeKind: 'tag',
    placementId: '',
    scope: 'direct',
    tagId: 'tag-1'
  })
  expect(reorderDocumentsUnderTag).toHaveBeenCalledOnce()
  expect(refreshHierarchyTreeNodes).not.toHaveBeenCalled()
})

test('handleSortHierarchyTreeDocuments skips the tree refresh when the project changes after a document sort', async () => {
  seedHierarchySortDocuments([
    {
      displayName: 'Beta',
      id: 'b',
      parentDocumentId: 'doc-1',
      sortOrder: 0
    },
    {
      displayName: 'Alpha',
      id: 'a',
      parentDocumentId: 'doc-1',
      sortOrder: 1
    }
  ])
  let epochReads = 0
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  stubProjectContentApi({
    listPlacementDocumentChildren: vi.fn(async () => ({ items: [] })),
    reindexDocumentSiblingsInHierarchy
  })
  const refreshHierarchyTreeNodes = vi.fn()
  const { handleSortHierarchyTreeDocuments } = createFaActionDefinitionHandlersHierarchyTreeSortActions({
    S_FaProjectHierarchyTree: () => ({ refreshHierarchyTreeNodes }),
    readProjectContentEpoch: () => {
      epochReads += 1
      return epochReads >= 6 ? 2 : 1
    }
  })
  await handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: 'doc-1',
    key: 'name',
    nodeKind: 'document',
    placementId: 'placement-1',
    scope: 'direct'
  })
  expect(reindexDocumentSiblingsInHierarchy).toHaveBeenCalled()
  expect(refreshHierarchyTreeNodes).not.toHaveBeenCalled()
})
