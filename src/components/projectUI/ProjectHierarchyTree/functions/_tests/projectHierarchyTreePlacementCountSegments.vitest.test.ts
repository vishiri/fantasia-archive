import { expect, test } from 'vitest'

import { resolveProjectHierarchyTreePlacementCountSegments } from '../projectHierarchyTreePlacementCountSegments'

test('Test that placement count segments hide entirely when both sides disabled', () => {
  const result = resolveProjectHierarchyTreePlacementCountSegments({
    categoryCount: 3,
    disableCategoryCount: true,
    disableDocumentCounts: true,
    documentCount: 7,
    doubleDashDocCount: false,
    invertCategoryPosition: false
  })
  expect(result.shows).toBe(false)
  expect(result.segments).toEqual([])
  expect(result.doubleDashDivider).toBe(false)
})

test('Test that placement count segments show category only when document count hidden', () => {
  const result = resolveProjectHierarchyTreePlacementCountSegments({
    categoryCount: 2,
    disableCategoryCount: false,
    disableDocumentCounts: true,
    documentCount: 9,
    doubleDashDocCount: false,
    invertCategoryPosition: false
  })
  expect(result).toEqual({
    doubleDashDivider: false,
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
    doubleDashDocCount: false,
    invertCategoryPosition: false
  })
  expect(result).toEqual({
    doubleDashDivider: false,
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
    doubleDashDocCount: false,
    invertCategoryPosition: false
  })
  expect(result.shows).toBe(true)
  expect(result.showDivider).toBe(true)
  expect(result.doubleDashDivider).toBe(false)
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
    doubleDashDocCount: false,
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
  expect(result.doubleDashDivider).toBe(false)
})

test('Test that placement count segments set doubleDashDivider when doubleDashDocCount is true', () => {
  const result = resolveProjectHierarchyTreePlacementCountSegments({
    categoryCount: 1,
    disableCategoryCount: false,
    disableDocumentCounts: false,
    documentCount: 2,
    doubleDashDocCount: true,
    invertCategoryPosition: false
  })
  expect(result.doubleDashDivider).toBe(true)
  expect(result.showDivider).toBe(true)
})
