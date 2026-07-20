import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeDocumentChild } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  compareProjectHierarchyTreeDocumentChildrenForSort,
  sortProjectHierarchyTreeDocumentChildren
} from '../projectHierarchyTreeDocumentSortRun'

const EMPTY = Number.MIN_SAFE_INTEGER

function child (input: {
  displayName: string
  id: string
  treeOrderNumber?: number | null | undefined
}): I_faProjectHierarchyTreeDocumentChild {
  return {
    displayName: input.displayName,
    hasChildren: false,
    id: input.id,
    parentDocumentId: null,
    placementId: 'placement-1',
    sortOrder: 0,
    treeOrderNumber: input.treeOrderNumber === null
      ? undefined
      : input.treeOrderNumber
  }
}

test('compareProjectHierarchyTreeDocumentChildrenForSort orders names A to Z and Z to A', () => {
  const alpha = child({
    displayName: 'Alpha',
    id: 'a'
  })
  const beta = child({
    displayName: 'Beta',
    id: 'b'
  })
  expect(compareProjectHierarchyTreeDocumentChildrenForSort(alpha, beta, 'name', 'asc')).toBeLessThan(0)
  expect(compareProjectHierarchyTreeDocumentChildrenForSort(alpha, beta, 'name', 'desc')).toBeGreaterThan(0)
})

test('compareProjectHierarchyTreeDocumentChildrenForSort breaks equal names by id', () => {
  const left = child({
    displayName: 'Same',
    id: 'a'
  })
  const right = child({
    displayName: 'Same',
    id: 'b'
  })
  expect(compareProjectHierarchyTreeDocumentChildrenForSort(left, right, 'name', 'asc')).toBeLessThan(0)
  expect(compareProjectHierarchyTreeDocumentChildrenForSort(right, left, 'name', 'asc')).toBeGreaterThan(0)
  expect(compareProjectHierarchyTreeDocumentChildrenForSort(left, left, 'name', 'asc')).toBe(0)
})

test('compareProjectHierarchyTreeDocumentChildrenForSort keeps empty Custom order last both ways', () => {
  const numbered = child({
    displayName: 'Zed',
    id: 'z',
    treeOrderNumber: 5
  })
  const empty = child({
    displayName: 'Alpha',
    id: 'a',
    treeOrderNumber: EMPTY
  })
  expect(compareProjectHierarchyTreeDocumentChildrenForSort(numbered, empty, 'customOrder', 'asc')).toBeLessThan(0)
  expect(compareProjectHierarchyTreeDocumentChildrenForSort(numbered, empty, 'customOrder', 'desc')).toBeLessThan(0)
  expect(compareProjectHierarchyTreeDocumentChildrenForSort(empty, numbered, 'customOrder', 'asc')).toBeGreaterThan(0)
})

test('compareProjectHierarchyTreeDocumentChildrenForSort orders Custom order numbers both ways', () => {
  const low = child({
    displayName: 'Low',
    id: 'l',
    treeOrderNumber: 1
  })
  const high = child({
    displayName: 'High',
    id: 'h',
    treeOrderNumber: 90
  })
  expect(compareProjectHierarchyTreeDocumentChildrenForSort(low, high, 'customOrder', 'asc')).toBeLessThan(0)
  expect(compareProjectHierarchyTreeDocumentChildrenForSort(low, high, 'customOrder', 'desc')).toBeGreaterThan(0)
})

test('compareProjectHierarchyTreeDocumentChildrenForSort breaks Custom order ties by name then id', () => {
  const alpha = child({
    displayName: 'Alpha',
    id: 'a',
    treeOrderNumber: 10
  })
  const beta = child({
    displayName: 'Beta',
    id: 'b',
    treeOrderNumber: 10
  })
  expect(compareProjectHierarchyTreeDocumentChildrenForSort(alpha, beta, 'customOrder', 'asc')).toBeLessThan(0)
  expect(compareProjectHierarchyTreeDocumentChildrenForSort(alpha, beta, 'customOrder', 'desc')).toBeGreaterThan(0)

  const sameNameLeft = child({
    displayName: 'Same',
    id: 'a',
    treeOrderNumber: 10
  })
  const sameNameRight = child({
    displayName: 'Same',
    id: 'b',
    treeOrderNumber: 10
  })
  expect(compareProjectHierarchyTreeDocumentChildrenForSort(sameNameLeft, sameNameRight, 'customOrder', 'asc')).toBeLessThan(0)
})

test('sortProjectHierarchyTreeDocumentChildren sorts Custom order ascending with empty last', () => {
  const items = [
    child({
      displayName: 'Empty',
      id: 'e'
    }),
    child({
      displayName: 'High',
      id: 'h',
      treeOrderNumber: 90
    }),
    child({
      displayName: 'Low',
      id: 'l',
      treeOrderNumber: 1
    })
  ]
  const ordered = sortProjectHierarchyTreeDocumentChildren(items, 'customOrder', 'asc')
  expect(ordered.map((item) => item.id)).toEqual(['l', 'h', 'e'])
})
