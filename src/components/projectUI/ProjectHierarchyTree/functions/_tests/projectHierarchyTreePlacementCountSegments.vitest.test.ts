import { expect, test } from 'vitest'

import { resolveProjectHierarchyTreePlacementCountSegments } from '../projectHierarchyTreePlacementCountSegments'

test('Test that placement count segments hide entirely when both sides disabled', () => {
  const result = resolveProjectHierarchyTreePlacementCountSegments({
    categoryCount: 3,
    disableCategoryCount: true,
    disableDocumentCounts: true,
    documentCount: 7,
    invertCategoryPosition: false
  })
  expect(result.shows).toBe(false)
  expect(result.segments).toEqual([])
})

test('Test that placement count segments show category only when document count hidden', () => {
  const result = resolveProjectHierarchyTreePlacementCountSegments({
    categoryCount: 2,
    disableCategoryCount: false,
    disableDocumentCounts: true,
    documentCount: 9,
    invertCategoryPosition: false
  })
  expect(result).toEqual({
    segments: [{
      kind: 'category',
      value: 2
    }],
    showDivider: false,
    shows: true
  })
})

test('Test that placement count segments show document only when category count hidden', () => {
  const result = resolveProjectHierarchyTreePlacementCountSegments({
    categoryCount: 4,
    disableCategoryCount: true,
    disableDocumentCounts: false,
    documentCount: 1,
    invertCategoryPosition: false
  })
  expect(result).toEqual({
    segments: [{
      kind: 'document',
      value: 1
    }],
    showDivider: false,
    shows: true
  })
})

test('Test that placement count segments keep zero values visible', () => {
  const result = resolveProjectHierarchyTreePlacementCountSegments({
    categoryCount: 0,
    disableCategoryCount: false,
    disableDocumentCounts: false,
    documentCount: 0,
    invertCategoryPosition: false
  })
  expect(result.shows).toBe(true)
  expect(result.showDivider).toBe(true)
  expect(result.segments).toEqual([
    {
      kind: 'document',
      value: 0
    },
    {
      kind: 'category',
      value: 0
    }
  ])
})

test('Test that placement count segments invert document and category order', () => {
  const result = resolveProjectHierarchyTreePlacementCountSegments({
    categoryCount: 3,
    disableCategoryCount: false,
    disableDocumentCounts: false,
    documentCount: 7,
    invertCategoryPosition: true
  })
  expect(result.segments).toEqual([
    {
      kind: 'category',
      value: 3
    },
    {
      kind: 'document',
      value: 7
    }
  ])
  expect(result.showDivider).toBe(true)
})
