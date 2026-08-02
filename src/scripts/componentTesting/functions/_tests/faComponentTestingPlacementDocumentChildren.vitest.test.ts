import { describe, expect, test } from 'vitest'

import {
  buildFaComponentTestingPlacementDocumentChildrenKey,
  reindexFaComponentTestingPlacementDocumentChildren
} from '../faComponentTestingPlacementDocumentChildren'
import type { I_faProjectHierarchyTreeDocumentChild } from 'app/types/I_faProjectHierarchyTreeDomain'

const sampleItems: I_faProjectHierarchyTreeDocumentChild[] = [
  {
    displayName: 'Zebra',
    hasChildren: false,
    id: 'z',
    parentDocumentId: null,
    placementId: 'p1',
    sortOrder: 0
  },
  {
    displayName: 'Alpha',
    hasChildren: false,
    id: 'a',
    parentDocumentId: null,
    placementId: 'p1',
    sortOrder: 1
  }
]

describe('faComponentTestingPlacementDocumentChildren', () => {
  test('Test that buildFaComponentTestingPlacementDocumentChildrenKey uses __root__ for null parent', () => {
    expect(buildFaComponentTestingPlacementDocumentChildrenKey('p1', null)).toBe('p1::__root__')
    expect(buildFaComponentTestingPlacementDocumentChildrenKey('p1', 'doc-1')).toBe('p1::doc-1')
  })

  test('Test that reindexFaComponentTestingPlacementDocumentChildren follows ordered ids', () => {
    const reindexed = reindexFaComponentTestingPlacementDocumentChildren(sampleItems, ['a', 'z'])
    expect(reindexed.map((item) => item.id)).toEqual(['a', 'z'])
    expect(reindexed.map((item) => item.sortOrder)).toEqual([0, 1])
  })

  test('Test that reindexFaComponentTestingPlacementDocumentChildren drops unknown ids', () => {
    const reindexed = reindexFaComponentTestingPlacementDocumentChildren(
      sampleItems,
      ['a', 'missing', 'z']
    )
    expect(reindexed.map((item) => item.id)).toEqual(['a', 'z'])
    expect(reindexed.map((item) => item.sortOrder)).toEqual([0, 1])
  })
})
