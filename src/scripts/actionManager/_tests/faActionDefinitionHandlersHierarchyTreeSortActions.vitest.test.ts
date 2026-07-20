import { afterEach, expect, test, vi } from 'vitest'

import { createFaActionDefinitionHandlersHierarchyTreeSortActions } from '../faActionDefinitionHandlersHierarchyTreeSortActions'

afterEach(() => {
  vi.unstubAllGlobals()
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

test('handleSortHierarchyTreeDocuments reindexes document children then refreshes tree nodes', async () => {
  const listPlacementDocumentChildren = vi.fn(async () => {
    return {
      items: [
        {
          displayName: 'Beta',
          hasChildren: false,
          id: 'b',
          parentDocumentId: 'doc-1',
          placementId: 'placement-1',
          sortOrder: 0
        },
        {
          displayName: 'Alpha',
          hasChildren: false,
          id: 'a',
          parentDocumentId: 'doc-1',
          placementId: 'placement-1',
          sortOrder: 1
        }
      ]
    }
  })
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  stubProjectContentApi({
    listPlacementDocumentChildren,
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

test('handleSortHierarchyTreeDocuments sorts template placement root bucket', async () => {
  const listPlacementDocumentChildren = vi.fn(async () => {
    return {
      items: [
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
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  stubProjectContentApi({
    listPlacementDocumentChildren,
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
  const listPlacementDocumentChildren = vi.fn(async (input: {
    parentDocumentId: string | null
    placementId: string
  }) => {
    if (input.parentDocumentId === null) {
      return {
        items: [
          {
            displayName: 'Parent',
            hasChildren: true,
            id: 'doc-parent',
            parentDocumentId: null,
            placementId: 'placement-1',
            sortOrder: 0
          }
        ]
      }
    }
    return {
      items: [
        {
          displayName: 'Beta',
          hasChildren: false,
          id: 'b',
          parentDocumentId: 'doc-parent',
          placementId: 'placement-1',
          sortOrder: 0
        },
        {
          displayName: 'Alpha',
          hasChildren: false,
          id: 'a',
          parentDocumentId: 'doc-parent',
          placementId: 'placement-1',
          sortOrder: 1
        }
      ]
    }
  })
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  stubProjectContentApi({
    listPlacementDocumentChildren,
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
  const listPlacementDocumentChildren = vi.fn(
    async (input: { parentDocumentId: string | null }) => {
      if (input.parentDocumentId === null) {
        return {
          items: [
            {
              displayName: 'Parent',
              hasChildren: true,
              id: 'doc-parent',
              parentDocumentId: null,
              placementId: 'placement-1',
              sortOrder: 0
            }
          ]
        }
      }
      return {
        items: [
          {
            displayName: 'Child',
            hasChildren: false,
            id: 'doc-child',
            parentDocumentId: 'doc-parent',
            placementId: 'placement-1',
            sortOrder: 0
          }
        ]
      }
    }
  )
  const reindexDocumentSiblingsInHierarchy = vi.fn(async (input: { parentDocumentId: string | null }) => {
    if (input.parentDocumentId === 'doc-parent') {
      throw new Error('reindex failed')
    }
  })
  stubProjectContentApi({
    listPlacementDocumentChildren,
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
