import { describe, expect, test } from 'vitest'

import {
  applyFaComponentTestingDocumentsByIdParentFromReindex,
  applyFaComponentTestingPlacementDocumentChildrenReindex,
  buildFaComponentTestingPlacementDocumentChildrenKey,
  reindexFaComponentTestingPlacementDocumentChildren
} from '../faComponentTestingPlacementDocumentChildren'
import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
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

  test('Test that applyFaComponentTestingPlacementDocumentChildrenReindex reorders a same-parent bucket', () => {
    const childrenByKey: Record<string, I_faProjectHierarchyTreeDocumentChild[]> = {
      'p1::__root__': [...sampleItems]
    }
    applyFaComponentTestingPlacementDocumentChildrenReindex(childrenByKey, {
      movedDocumentId: 'a',
      orderedDocumentIds: ['a', 'z'],
      parentDocumentId: null,
      placementId: 'p1'
    })
    expect(childrenByKey['p1::__root__']?.map((item) => item.id)).toEqual(['a', 'z'])
    expect(childrenByKey['p1::__root__']?.map((item) => item.sortOrder)).toEqual([0, 1])
  })

  test('Test that applyFaComponentTestingPlacementDocumentChildrenReindex empty order writes an empty target key', () => {
    const childrenByKey: Record<string, I_faProjectHierarchyTreeDocumentChild[]> = {
      'p1::__root__': [...sampleItems]
    }
    applyFaComponentTestingPlacementDocumentChildrenReindex(childrenByKey, {
      movedDocumentId: 'ghost',
      orderedDocumentIds: [],
      parentDocumentId: 'no-bucket',
      placementId: 'p1'
    })
    expect(childrenByKey['p1::no-bucket']).toEqual([])
    expect(childrenByKey['p1::__root__']?.map((item) => item.id)).toEqual(['z', 'a'])
  })

  test('Test that applyFaComponentTestingPlacementDocumentChildrenReindex nests a child and strips the old bucket', () => {
    const parent: I_faProjectHierarchyTreeDocumentChild = {
      displayName: 'Parent',
      hasChildren: false,
      id: 'parent',
      parentDocumentId: null,
      placementId: 'p1',
      sortOrder: 0
    }
    const leaf: I_faProjectHierarchyTreeDocumentChild = {
      displayName: 'Leaf',
      hasChildren: false,
      id: 'leaf',
      parentDocumentId: null,
      placementId: 'p1',
      sortOrder: 1
    }
    const childrenByKey: Record<string, I_faProjectHierarchyTreeDocumentChild[]> = {
      'p1::__root__': [parent, leaf],
      'p1::parent': []
    }
    applyFaComponentTestingPlacementDocumentChildrenReindex(childrenByKey, {
      movedDocumentId: 'leaf',
      orderedDocumentIds: ['leaf'],
      parentDocumentId: 'parent',
      placementId: 'p1'
    })
    expect(childrenByKey['p1::__root__']?.map((item) => item.id)).toEqual(['parent'])
    expect(childrenByKey['p1::__root__']?.[0]?.hasChildren).toBe(true)
    expect(childrenByKey['p1::parent']?.map((item) => item.id)).toEqual(['leaf'])
    expect(childrenByKey['p1::parent']?.[0]?.parentDocumentId).toBe('parent')
  })

  test('Test that applyFaComponentTestingPlacementDocumentChildrenReindex keeps omitted destination siblings', () => {
    const alpha: I_faProjectHierarchyTreeDocumentChild = {
      displayName: 'Alpha',
      hasChildren: false,
      id: 'alpha',
      parentDocumentId: 'parent',
      placementId: 'p1',
      sortOrder: 0
    }
    const middle: I_faProjectHierarchyTreeDocumentChild = {
      displayName: 'Middle',
      hasChildren: false,
      id: 'middle',
      parentDocumentId: 'parent',
      placementId: 'p1',
      sortOrder: 1
    }
    const beta: I_faProjectHierarchyTreeDocumentChild = {
      displayName: 'Beta',
      hasChildren: false,
      id: 'beta',
      parentDocumentId: 'parent',
      placementId: 'p1',
      sortOrder: 2
    }
    const moved: I_faProjectHierarchyTreeDocumentChild = {
      displayName: 'Moved',
      hasChildren: false,
      id: 'moved',
      parentDocumentId: null,
      placementId: 'p1',
      sortOrder: 1
    }
    const childrenByKey: Record<string, I_faProjectHierarchyTreeDocumentChild[]> = {
      'p1::__root__': [moved],
      'p1::parent': [alpha, middle, beta]
    }
    applyFaComponentTestingPlacementDocumentChildrenReindex(childrenByKey, {
      movedDocumentId: 'moved',
      orderedDocumentIds: ['alpha', 'moved', 'beta'],
      parentDocumentId: 'parent',
      placementId: 'p1'
    })
    expect(childrenByKey['p1::parent']?.map((item) => item.id)).toEqual([
      'alpha',
      'moved',
      'middle',
      'beta'
    ])
    expect(childrenByKey['p1::__root__']).toEqual([])
  })

  test('Test that applyFaComponentTestingPlacementDocumentChildrenReindex keeps an ordered id in its client slot', () => {
    const alpha: I_faProjectHierarchyTreeDocumentChild = {
      displayName: 'Alpha',
      hasChildren: false,
      id: 'alpha',
      parentDocumentId: 'parent',
      placementId: 'p1',
      sortOrder: 0
    }
    const middle: I_faProjectHierarchyTreeDocumentChild = {
      displayName: 'Middle',
      hasChildren: false,
      id: 'middle',
      parentDocumentId: 'parent',
      placementId: 'p1',
      sortOrder: 1
    }
    const beta: I_faProjectHierarchyTreeDocumentChild = {
      displayName: 'Beta',
      hasChildren: false,
      id: 'beta',
      parentDocumentId: 'parent',
      placementId: 'p1',
      sortOrder: 2
    }
    const moved: I_faProjectHierarchyTreeDocumentChild = {
      displayName: 'Moved',
      hasChildren: false,
      id: 'moved',
      parentDocumentId: null,
      placementId: 'p1',
      sortOrder: 1
    }
    const childrenByKey: Record<string, I_faProjectHierarchyTreeDocumentChild[]> = {
      'p1::__root__': [moved],
      'p1::parent': [alpha, middle, beta]
    }
    applyFaComponentTestingPlacementDocumentChildrenReindex(childrenByKey, {
      movedDocumentId: 'moved',
      orderedDocumentIds: ['beta', 'alpha', 'moved'],
      parentDocumentId: 'parent',
      placementId: 'p1'
    })
    expect(childrenByKey['p1::parent']?.map((item) => item.id)).toEqual([
      'middle',
      'beta',
      'alpha',
      'moved'
    ])
  })

  test('Test that applyFaComponentTestingPlacementDocumentChildrenReindex appends siblings after the last anchor', () => {
    const alpha: I_faProjectHierarchyTreeDocumentChild = {
      displayName: 'Alpha',
      hasChildren: false,
      id: 'alpha',
      parentDocumentId: 'parent',
      placementId: 'p1',
      sortOrder: 0
    }
    const tail: I_faProjectHierarchyTreeDocumentChild = {
      displayName: 'Tail',
      hasChildren: false,
      id: 'tail',
      parentDocumentId: 'parent',
      placementId: 'p1',
      sortOrder: 1
    }
    const moved: I_faProjectHierarchyTreeDocumentChild = {
      displayName: 'Moved',
      hasChildren: false,
      id: 'moved',
      parentDocumentId: null,
      placementId: 'p1',
      sortOrder: 1
    }
    const childrenByKey: Record<string, I_faProjectHierarchyTreeDocumentChild[]> = {
      'p1::__root__': [moved],
      'p1::parent': [alpha, tail]
    }
    applyFaComponentTestingPlacementDocumentChildrenReindex(childrenByKey, {
      movedDocumentId: 'moved',
      orderedDocumentIds: ['alpha', 'moved'],
      parentDocumentId: 'parent',
      placementId: 'p1'
    })
    expect(childrenByKey['p1::parent']?.map((item) => item.id)).toEqual([
      'alpha',
      'moved',
      'tail'
    ])
  })

  test('Test that applyFaComponentTestingDocumentsByIdParentFromReindex updates parent and sortOrder', () => {
    const documentsById: Record<string, I_faProjectDocument> = {
      leaf: {
        createdAtMs: 1,
        displayName: 'Leaf',
        documentBackgroundColor: null,
        documentTextColor: null,
        extraClasses: '',
        id: 'leaf',
        isCategory: false,
        isDead: false,
        isFinished: false,
        isMinor: false,
        parentDocumentId: null,
        placementId: 'p1',
        sortOrder: 1,
        templateId: 'tpl',
        treeOrderNumber: 1,
        updatedAtMs: 1,
        worldId: 'w1'
      }
    }
    applyFaComponentTestingDocumentsByIdParentFromReindex(documentsById, {
      movedDocumentId: 'leaf',
      orderedDocumentIds: ['leaf', 'leaf', 'missing'],
      parentDocumentId: 'parent',
      placementId: 'p1'
    })
    expect(documentsById.leaf?.parentDocumentId).toBe('parent')
    expect(documentsById.leaf?.sortOrder).toBe(0)
  })
})
