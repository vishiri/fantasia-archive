import { expect, test } from 'vitest'

import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'

import {
  buildFaProjectHierarchyDocumentIndexBucketKey,
  compareFaProjectHierarchyDocumentIndexOrder,
  createFaProjectHierarchyDocumentIndex,
  listFaProjectHierarchyDocumentIndexPlacementChildren,
  replaceFaProjectHierarchyDocumentIndexFromDocuments,
  upsertFaProjectHierarchyDocumentIndexDocument
} from '../faProjectHierarchyDocumentIndex'
import {
  applyFaProjectHierarchyDocumentIndexMove,
  applyFaProjectHierarchyDocumentIndexReindex,
  shiftFaProjectHierarchyDocumentIndexSiblingSortOrders
} from '../faProjectHierarchyDocumentIndexMutations'

function sampleDocument (
  overrides: Partial<I_faProjectDocument> & Pick<I_faProjectDocument, 'id' | 'displayName'>
): I_faProjectDocument {
  return {
    createdAtMs: 100,
    documentBackgroundColor: null,
    documentTextColor: null,
    extraClasses: '',
    isCategory: false,
    isDead: false,
    isFinished: false,
    isMinor: false,
    parentDocumentId: null,
    placementId: 'placement-1',
    sortOrder: 0,
    templateId: 'tpl-1',
    treeOrderNumber: 1,
    updatedAtMs: 100,
    worldId: 'world-1',
    ...overrides
  }
}

const documentIndexMutationDeps = {
  listPlacementChildren: listFaProjectHierarchyDocumentIndexPlacementChildren,
  upsertDocument: upsertFaProjectHierarchyDocumentIndexDocument
}

/**
 * buildFaProjectHierarchyDocumentIndexBucketKey
 * Matches the component-testing placement children map key.
 */
test('Test that buildFaProjectHierarchyDocumentIndexBucketKey matches component-testing keys', () => {
  expect(buildFaProjectHierarchyDocumentIndexBucketKey('placement-1', null)).toBe(
    'placement-1::__root__'
  )
  expect(buildFaProjectHierarchyDocumentIndexBucketKey('placement-1', 'doc-1')).toBe(
    'placement-1::doc-1'
  )
})

/**
 * replaceFaProjectHierarchyDocumentIndexFromDocuments + list
 * Derives hasChildren from parentDocumentId occupancy and skips null placement buckets.
 */
test('Test that document index lists sorted children and derives hasChildren', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      createdAtMs: 2,
      displayName: 'Beta',
      id: 'b',
      sortOrder: 0
    }),
    sampleDocument({
      createdAtMs: 1,
      displayName: 'Alpha',
      id: 'a',
      sortOrder: 0
    }),
    sampleDocument({
      displayName: 'Nested',
      id: 'nested',
      parentDocumentId: 'a',
      sortOrder: 0
    }),
    sampleDocument({
      displayName: 'Unplaced',
      id: 'unplaced',
      placementId: null
    })
  ])
  const root = listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  expect(root.map((item) => item.id)).toEqual(['a', 'b'])
  expect(root[0]?.hasChildren).toBe(true)
  expect(root[1]?.hasChildren).toBe(false)
  expect(listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: null,
    placementId: 'missing'
  })).toEqual([])
  const rootKey = buildFaProjectHierarchyDocumentIndexBucketKey('placement-1', null)
  index.bucketIdsByKey.get(rootKey)?.add('ghost-id')
  expect(listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: null,
    placementId: 'placement-1'
  }).map((item) => item.id)).toEqual(['a', 'b'])
})

/**
 * listFaProjectHierarchyDocumentIndexPlacementChildren
 * A child in another placement does not mark the parent as having children.
 */
test('Test that document index hasChildren ignores a cross-placement child', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      displayName: 'Parent',
      id: 'parent-only',
      sortOrder: 0
    }),
    sampleDocument({
      displayName: 'Other placement child',
      id: 'other-child',
      parentDocumentId: 'parent-only',
      placementId: 'placement-2',
      sortOrder: 0
    })
  ])
  const crossPlacementRoot = listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  expect(crossPlacementRoot.map((item) => item.id)).toEqual(['parent-only'])
  expect(crossPlacementRoot[0]?.hasChildren).toBe(false)
})

/**
 * compareFaProjectHierarchyDocumentIndexOrder
 * ASCII NOCASE fold only A-Z; id is the last tie-break.
 */
test('Test that document index sort folds ASCII case then ties on createdAtMs and id', () => {
  const earlier = sampleDocument({
    createdAtMs: 1,
    displayName: 'alpha',
    id: 'z',
    sortOrder: 0
  })
  const laterSameName = sampleDocument({
    createdAtMs: 2,
    displayName: 'ALPHA',
    id: 'a',
    sortOrder: 0
  })
  expect(compareFaProjectHierarchyDocumentIndexOrder(earlier, laterSameName)).toBeLessThan(0)
  const leftId = sampleDocument({
    createdAtMs: 1,
    displayName: 'Same',
    id: 'aaa',
    sortOrder: 0
  })
  const rightId = sampleDocument({
    createdAtMs: 1,
    displayName: 'Same',
    id: 'bbb',
    sortOrder: 0
  })
  expect(compareFaProjectHierarchyDocumentIndexOrder(leftId, rightId)).toBeLessThan(0)
  expect(compareFaProjectHierarchyDocumentIndexOrder(leftId, leftId)).toBe(0)
  const laterName = sampleDocument({
    displayName: 'Beta',
    id: 'beta',
    sortOrder: 0
  })
  const earlierName = sampleDocument({
    displayName: 'Alpha',
    id: 'alpha',
    sortOrder: 0
  })
  expect(compareFaProjectHierarchyDocumentIndexOrder(laterName, earlierName)).toBeGreaterThan(0)
  const higherSort = sampleDocument({
    displayName: 'A',
    id: 'high',
    sortOrder: 2
  })
  const lowerSort = sampleDocument({
    displayName: 'A',
    id: 'low',
    sortOrder: 1
  })
  expect(compareFaProjectHierarchyDocumentIndexOrder(higherSort, lowerSort)).toBeGreaterThan(0)
})

/**
 * upsertFaProjectHierarchyDocumentIndexDocument
 * Moves a document between buckets and updates parent occupancy.
 */
test('Test that upsert moves a document between parent buckets', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      displayName: 'Parent',
      id: 'parent'
    }),
    sampleDocument({
      displayName: 'Child',
      id: 'child',
      parentDocumentId: null,
      sortOrder: 1
    })
  ])
  upsertFaProjectHierarchyDocumentIndexDocument(index, sampleDocument({
    displayName: 'Child',
    id: 'child',
    parentDocumentId: 'parent',
    sortOrder: 0
  }))
  const root = listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  expect(root.map((item) => item.id)).toEqual(['parent'])
  expect(root[0]?.hasChildren).toBe(true)
  expect(listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: 'parent',
    placementId: 'placement-1'
  }).map((item) => item.id)).toEqual(['child'])
})

/**
 * applyFaProjectHierarchyDocumentIndexReindex
 * Assigns sequential sortOrder and compacts the previous parent bucket.
 */
test('Test that reindex assigns sequential sort orders and compacts the source bucket', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      displayName: 'Keep',
      id: 'keep',
      parentDocumentId: 'old',
      sortOrder: 0
    }),
    sampleDocument({
      displayName: 'Moved',
      id: 'moved',
      parentDocumentId: 'old',
      sortOrder: 1
    }),
    sampleDocument({
      displayName: 'Target',
      id: 'target',
      parentDocumentId: 'new',
      sortOrder: 0
    })
  ])
  applyFaProjectHierarchyDocumentIndexReindex(index, {
    movedDocumentId: 'moved',
    orderedDocumentIds: ['moved', 'target'],
    parentDocumentId: 'new',
    placementId: 'placement-1'
  }, documentIndexMutationDeps)
  const next = listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: 'new',
    placementId: 'placement-1'
  })
  expect(next.map((item) => item.id)).toEqual(['moved', 'target'])
  expect(next.map((item) => item.sortOrder)).toEqual([0, 1])
  const remaining = listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: 'old',
    placementId: 'placement-1'
  })
  expect(remaining.map((item) => item.id)).toEqual(['keep'])
  expect(remaining[0]?.sortOrder).toBe(0)
})

/**
 * applyFaProjectHierarchyDocumentIndexMove
 * Shifts old and new sibling buckets then updates the moved row.
 */
test('Test that move shifts sibling sort orders then updates parent', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      displayName: 'A',
      id: 'a',
      parentDocumentId: null,
      sortOrder: 0
    }),
    sampleDocument({
      displayName: 'B',
      id: 'b',
      parentDocumentId: null,
      sortOrder: 1
    }),
    sampleDocument({
      displayName: 'C',
      id: 'c',
      parentDocumentId: 'a',
      sortOrder: 0
    })
  ])
  applyFaProjectHierarchyDocumentIndexMove(index, {
    documentId: 'b',
    targetParentDocumentId: 'a',
    targetSortOrder: 0
  }, documentIndexMutationDeps)
  const root = listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  expect(root.map((item) => item.id)).toEqual(['a'])
  const nested = listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: 'a',
    placementId: 'placement-1'
  })
  expect(nested.map((item) => item.id)).toEqual(['b', 'c'])
  expect(nested.map((item) => item.sortOrder)).toEqual([0, 1])
})

/**
 * shiftFaProjectHierarchyDocumentIndexSiblingSortOrders
 * No-ops when delta is zero; skips the excluded id.
 */
test('Test that sibling sort shift no-ops on zero delta and excludes the moved id', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      displayName: 'A',
      id: 'a',
      sortOrder: 0
    }),
    sampleDocument({
      displayName: 'B',
      id: 'b',
      sortOrder: 1
    })
  ])
  shiftFaProjectHierarchyDocumentIndexSiblingSortOrders(index, 'placement-1', null, 0, 0, 'a')
  expect(index.byId.get('b')?.sortOrder).toBe(1)
  shiftFaProjectHierarchyDocumentIndexSiblingSortOrders(index, 'placement-1', null, 0, 1, 'a')
  expect(index.byId.get('a')?.sortOrder).toBe(0)
  expect(index.byId.get('b')?.sortOrder).toBe(2)
})

/**
 * applyFaProjectHierarchyDocumentIndexMove
 * No-ops when the document is missing or has a null placement.
 */
test('Test that move no-ops for missing or unplaced documents', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      displayName: 'Unplaced',
      id: 'unplaced',
      placementId: null
    })
  ])
  applyFaProjectHierarchyDocumentIndexMove(index, {
    documentId: 'missing',
    targetParentDocumentId: null,
    targetSortOrder: 0
  }, documentIndexMutationDeps)
  applyFaProjectHierarchyDocumentIndexMove(index, {
    documentId: 'unplaced',
    targetParentDocumentId: null,
    targetSortOrder: 3
  }, documentIndexMutationDeps)
  expect(index.byId.get('unplaced')?.sortOrder).toBe(0)
})

/**
 * applyFaProjectHierarchyDocumentIndexReindex
 * Null root parent is a real bucket, not a missing parent.
 */
test('Test that reindex compacts the root bucket after a document leaves it', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      displayName: 'A',
      id: 'a',
      parentDocumentId: null,
      sortOrder: 0
    }),
    sampleDocument({
      displayName: 'B',
      id: 'b',
      parentDocumentId: null,
      sortOrder: 1
    }),
    sampleDocument({
      displayName: 'C',
      id: 'c',
      parentDocumentId: null,
      sortOrder: 2
    })
  ])
  applyFaProjectHierarchyDocumentIndexReindex(index, {
    movedDocumentId: 'b',
    orderedDocumentIds: ['b'],
    parentDocumentId: 'a',
    placementId: 'placement-1'
  }, documentIndexMutationDeps)
  const root = listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  expect(root.map((item) => item.id)).toEqual(['a', 'c'])
  expect(root.map((item) => item.sortOrder)).toEqual([0, 1])
})

/**
 * applyFaProjectHierarchyDocumentIndexReindex
 * A partial cross-parent order must keep destination siblings the tree did not list.
 */
test('Test that reindex keeps unloaded destination siblings when nesting one document', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      displayName: 'Alpha',
      id: 'alpha',
      parentDocumentId: 'parent',
      sortOrder: 0
    }),
    sampleDocument({
      displayName: 'Middle',
      id: 'middle',
      parentDocumentId: 'parent',
      sortOrder: 1
    }),
    sampleDocument({
      displayName: 'Beta',
      id: 'beta',
      parentDocumentId: 'parent',
      sortOrder: 2
    }),
    sampleDocument({
      displayName: 'Moved',
      id: 'moved',
      parentDocumentId: null,
      sortOrder: 0
    })
  ])
  applyFaProjectHierarchyDocumentIndexReindex(index, {
    movedDocumentId: 'moved',
    orderedDocumentIds: ['alpha', 'moved', 'beta'],
    parentDocumentId: 'parent',
    placementId: 'placement-1'
  }, documentIndexMutationDeps)
  const nested = listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: 'parent',
    placementId: 'placement-1'
  })
  expect(nested.map((item) => item.id)).toEqual(['alpha', 'moved', 'middle', 'beta'])
  expect(nested.map((item) => item.sortOrder)).toEqual([0, 1, 2, 3])
})

test('Test that reindex fills destination gaps before the first ordered anchor', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      displayName: 'Alpha',
      id: 'alpha',
      parentDocumentId: 'parent',
      sortOrder: 0
    }),
    sampleDocument({
      displayName: 'Middle',
      id: 'middle',
      parentDocumentId: 'parent',
      sortOrder: 1
    }),
    sampleDocument({
      displayName: 'Beta',
      id: 'beta',
      parentDocumentId: 'parent',
      sortOrder: 2
    }),
    sampleDocument({
      displayName: 'Moved',
      id: 'moved',
      parentDocumentId: null,
      sortOrder: 0
    })
  ])
  applyFaProjectHierarchyDocumentIndexReindex(index, {
    movedDocumentId: 'moved',
    orderedDocumentIds: ['beta', 'alpha', 'moved'],
    parentDocumentId: 'parent',
    placementId: 'placement-1'
  }, documentIndexMutationDeps)
  const nested = listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: 'parent',
    placementId: 'placement-1'
  })
  expect(nested.map((item) => item.id)).toEqual(['middle', 'beta', 'alpha', 'moved'])
})

test('Test that reindex appends destination siblings after the last ordered anchor', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      displayName: 'Alpha',
      id: 'alpha',
      parentDocumentId: 'parent',
      sortOrder: 0
    }),
    sampleDocument({
      displayName: 'Tail',
      id: 'tail',
      parentDocumentId: 'parent',
      sortOrder: 1
    }),
    sampleDocument({
      displayName: 'Moved',
      id: 'moved',
      parentDocumentId: null,
      sortOrder: 0
    })
  ])
  applyFaProjectHierarchyDocumentIndexReindex(index, {
    movedDocumentId: 'moved',
    orderedDocumentIds: ['alpha', 'moved'],
    parentDocumentId: 'parent',
    placementId: 'placement-1'
  }, documentIndexMutationDeps)
  const nested = listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: 'parent',
    placementId: 'placement-1'
  })
  expect(nested.map((item) => item.id)).toEqual(['alpha', 'moved', 'tail'])
})

/**
 * applyFaProjectHierarchyDocumentIndexReindex
 * Skips unknown ids and same-parent compact of the source bucket.
 */
test('Test that reindex skips unknown ids and same-parent buckets', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      displayName: 'B',
      id: 'b',
      sortOrder: 0
    }),
    sampleDocument({
      displayName: 'A',
      id: 'a',
      sortOrder: 1
    })
  ])
  applyFaProjectHierarchyDocumentIndexReindex(index, {
    movedDocumentId: 'a',
    orderedDocumentIds: ['a', 'a', 'ghost', 'b'],
    parentDocumentId: null,
    placementId: 'placement-1'
  }, documentIndexMutationDeps)
  expect(listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: null,
    placementId: 'placement-1'
  }).map((item) => item.id)).toEqual(['a', 'b'])
})

/**
 * compareFaProjectHierarchyDocumentIndexOrder
 * Returns greater-than when the left id sorts after the right id.
 */
test('Test that document index sort returns greater-than for later ids', () => {
  const left = sampleDocument({
    createdAtMs: 1,
    displayName: 'Same',
    id: 'bbb',
    sortOrder: 0
  })
  const right = sampleDocument({
    createdAtMs: 1,
    displayName: 'Same',
    id: 'aaa',
    sortOrder: 0
  })
  expect(compareFaProjectHierarchyDocumentIndexOrder(left, right)).toBeGreaterThan(0)
})

/**
 * shiftFaProjectHierarchyDocumentIndexSiblingSortOrders
 * Skips documents in other placements or parents and sort orders below the from-index.
 */
test('Test that sibling sort shift skips other buckets and lower sort orders', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      displayName: 'Keep low',
      id: 'low',
      sortOrder: 0
    }),
    sampleDocument({
      displayName: 'Shift me',
      id: 'mid',
      sortOrder: 2
    }),
    sampleDocument({
      displayName: 'Other placement',
      id: 'other-place',
      placementId: 'placement-2',
      sortOrder: 2
    }),
    sampleDocument({
      displayName: 'Other parent',
      id: 'other-parent',
      parentDocumentId: 'p',
      sortOrder: 2
    }),
    sampleDocument({
      displayName: 'Excluded',
      id: 'exclude',
      sortOrder: 4
    })
  ])
  shiftFaProjectHierarchyDocumentIndexSiblingSortOrders(index, 'placement-1', null, 2, 1, 'exclude')
  expect(index.byId.get('low')?.sortOrder).toBe(0)
  expect(index.byId.get('mid')?.sortOrder).toBe(3)
  expect(index.byId.get('other-place')?.sortOrder).toBe(2)
  expect(index.byId.get('other-parent')?.sortOrder).toBe(2)
  expect(index.byId.get('exclude')?.sortOrder).toBe(4)
})

/**
 * upsertFaProjectHierarchyDocumentIndexDocument
 * Keeps hasChildren true when a parent still has remaining children.
 */
test('Test that upsert keeps parent occupancy when siblings remain', () => {
  const index = createFaProjectHierarchyDocumentIndex()
  replaceFaProjectHierarchyDocumentIndexFromDocuments(index, [
    sampleDocument({
      displayName: 'Parent',
      id: 'parent'
    }),
    sampleDocument({
      displayName: 'One',
      id: 'one',
      parentDocumentId: 'parent',
      sortOrder: 0
    }),
    sampleDocument({
      displayName: 'Two',
      id: 'two',
      parentDocumentId: 'parent',
      sortOrder: 1
    })
  ])
  upsertFaProjectHierarchyDocumentIndexDocument(index, sampleDocument({
    displayName: 'One',
    id: 'one',
    parentDocumentId: null,
    sortOrder: 1
  }))
  const root = listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  expect(root.find((item) => item.id === 'parent')?.hasChildren).toBe(true)
  upsertFaProjectHierarchyDocumentIndexDocument(index, sampleDocument({
    displayName: 'Two',
    id: 'two',
    parentDocumentId: null,
    sortOrder: 2
  }))
  expect(listFaProjectHierarchyDocumentIndexPlacementChildren(index, {
    parentDocumentId: null,
    placementId: 'placement-1'
  }).find((item) => item.id === 'parent')?.hasChildren).toBe(false)
})
