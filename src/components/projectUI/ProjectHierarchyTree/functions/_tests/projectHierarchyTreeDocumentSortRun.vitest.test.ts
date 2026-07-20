import { expect, test, vi } from 'vitest'

import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeListPlacementChildrenInput
} from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  collectProjectHierarchyTreeDocumentSortBuckets,
  resolveProjectHierarchyTreeDocumentSortBucketTreeNodeId,
  runProjectHierarchyTreeDocumentSort
} from '../projectHierarchyTreeDocumentSortRun'

function child (input: {
  displayName: string
  hasChildren?: boolean
  id: string
  parentDocumentId?: string | null
  treeOrderNumber?: number
}): I_faProjectHierarchyTreeDocumentChild {
  return {
    displayName: input.displayName,
    hasChildren: input.hasChildren ?? false,
    id: input.id,
    parentDocumentId: input.parentDocumentId ?? null,
    placementId: 'placement-1',
    sortOrder: 0,
    treeOrderNumber: input.treeOrderNumber
  }
}

test('collectProjectHierarchyTreeDocumentSortBuckets returns only root for direct scope', async () => {
  const listPlacementDocumentChildren = vi.fn()
  const buckets = await collectProjectHierarchyTreeDocumentSortBuckets({
    listPlacementDocumentChildren,
    root: {
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    scope: 'direct'
  })
  expect(buckets).toEqual([{
    parentDocumentId: null,
    placementId: 'placement-1'
  }])
  expect(listPlacementDocumentChildren).not.toHaveBeenCalled()
})

test('collectProjectHierarchyTreeDocumentSortBuckets walks nested parents for recursive scope', async () => {
  const listPlacementDocumentChildren = vi.fn(
    async (input: I_faProjectHierarchyTreeListPlacementChildrenInput) => {
      if (input.parentDocumentId === null || input.parentDocumentId === undefined) {
        return {
          items: [
            child({
              displayName: 'Parent',
              hasChildren: true,
              id: 'doc-parent'
            }),
            child({
              displayName: 'Leaf',
              id: 'doc-leaf'
            })
          ]
        }
      }
      if (input.parentDocumentId === 'doc-parent') {
        return {
          items: [child({
            displayName: 'Nested',
            id: 'doc-nested',
            parentDocumentId: 'doc-parent'
          })]
        }
      }
      return { items: [] }
    }
  )

  const buckets = await collectProjectHierarchyTreeDocumentSortBuckets({
    listPlacementDocumentChildren,
    root: {
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    scope: 'recursive'
  })

  expect(buckets).toEqual([
    {
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    {
      parentDocumentId: 'doc-parent',
      placementId: 'placement-1'
    }
  ])
})

test('runProjectHierarchyTreeDocumentSort reindexes each bucket in name order', async () => {
  const listPlacementDocumentChildren = vi.fn(async () => {
    return {
      items: [
        child({
          displayName: 'Beta',
          id: 'b'
        }),
        child({
          displayName: 'Alpha',
          id: 'a'
        })
      ]
    }
  })
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)

  await runProjectHierarchyTreeDocumentSort({
    direction: 'asc',
    key: 'name',
    listPlacementDocumentChildren,
    reindexDocumentSiblingsInHierarchy,
    root: {
      parentDocumentId: 'doc-root',
      placementId: 'placement-1'
    },
    scope: 'direct'
  })

  expect(reindexDocumentSiblingsInHierarchy).toHaveBeenCalledWith({
    movedDocumentId: 'a',
    orderedDocumentIds: ['a', 'b'],
    parentDocumentId: 'doc-root',
    placementId: 'placement-1'
  })
})

test('resolveProjectHierarchyTreeDocumentSortBucketTreeNodeId maps parent or placement', () => {
  expect(resolveProjectHierarchyTreeDocumentSortBucketTreeNodeId({
    parentDocumentId: 'doc-1',
    placementId: 'placement-1'
  })).toBe('doc-1')
  expect(resolveProjectHierarchyTreeDocumentSortBucketTreeNodeId({
    parentDocumentId: null,
    placementId: 'placement-1'
  })).toBe('placement-1')
})

test('runProjectHierarchyTreeDocumentSort returns buckets for tree refresh', async () => {
  const listPlacementDocumentChildren = vi.fn(async () => {
    return { items: [] }
  })
  const buckets = await runProjectHierarchyTreeDocumentSort({
    direction: 'asc',
    key: 'name',
    listPlacementDocumentChildren,
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    root: {
      parentDocumentId: 'doc-root',
      placementId: 'placement-1'
    },
    scope: 'direct'
  })
  expect(buckets).toEqual([{
    parentDocumentId: 'doc-root',
    placementId: 'placement-1'
  }])
})

test('runProjectHierarchyTreeDocumentSort no-ops when sibling bucket is empty', async () => {
  const listPlacementDocumentChildren = vi.fn(async () => {
    return { items: [] }
  })
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)

  await runProjectHierarchyTreeDocumentSort({
    direction: 'asc',
    key: 'name',
    listPlacementDocumentChildren,
    reindexDocumentSiblingsInHierarchy,
    root: {
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    scope: 'direct'
  })

  expect(reindexDocumentSiblingsInHierarchy).not.toHaveBeenCalled()
})

test('runProjectHierarchyTreeDocumentSort attaches completedBuckets when a later bucket fails', async () => {
  const listPlacementDocumentChildren = vi.fn(
    async (input: I_faProjectHierarchyTreeListPlacementChildrenInput) => {
      if (input.parentDocumentId === null || input.parentDocumentId === undefined) {
        return {
          items: [
            child({
              displayName: 'Parent',
              hasChildren: true,
              id: 'doc-parent'
            })
          ]
        }
      }
      return {
        items: [
          child({
            displayName: 'Child',
            id: 'doc-child',
            parentDocumentId: 'doc-parent'
          })
        ]
      }
    }
  )
  const reindexDocumentSiblingsInHierarchy = vi.fn(async (input) => {
    if (input.parentDocumentId === 'doc-parent') {
      throw new Error('reindex failed')
    }
  })

  await expect(runProjectHierarchyTreeDocumentSort({
    direction: 'asc',
    key: 'name',
    listPlacementDocumentChildren,
    reindexDocumentSiblingsInHierarchy,
    root: {
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    scope: 'recursive'
  })).rejects.toMatchObject({
    completedBuckets: [{
      parentDocumentId: null,
      placementId: 'placement-1'
    }],
    message: 'reindex failed'
  })
})

test('collectProjectHierarchyTreeDocumentSortBuckets skips already-visited parents', async () => {
  const listPlacementDocumentChildren = vi.fn(
    async (input: I_faProjectHierarchyTreeListPlacementChildrenInput) => {
      if (input.parentDocumentId === null || input.parentDocumentId === undefined) {
        return {
          items: [
            child({
              displayName: 'Parent',
              hasChildren: true,
              id: 'doc-parent'
            }),
            child({
              displayName: 'Parent Duplicate',
              hasChildren: true,
              id: 'doc-parent'
            })
          ]
        }
      }
      return { items: [] }
    }
  )

  const buckets = await collectProjectHierarchyTreeDocumentSortBuckets({
    listPlacementDocumentChildren,
    root: {
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    scope: 'recursive'
  })

  expect(buckets).toEqual([
    {
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    {
      parentDocumentId: 'doc-parent',
      placementId: 'placement-1'
    }
  ])
})
