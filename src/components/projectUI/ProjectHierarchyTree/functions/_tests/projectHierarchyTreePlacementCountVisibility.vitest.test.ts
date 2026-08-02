import { expect, test } from 'vitest'

import { resolveProjectHierarchyTreePlacementCountVisibility } from '../projectHierarchyTreePlacementCountVisibility'

const defaults = {
  disableCategoryCount: false,
  disableDocumentCounts: false,
  doubleDashDocCount: false,
  invertCategoryPosition: false
}

test('Test that placement count visibility uses persisted settings when preview unset', () => {
  const result = resolveProjectHierarchyTreePlacementCountVisibility(
    {
      ...defaults,
      disableCategoryCount: true,
      disableDocumentCounts: false,
      doubleDashDocCount: true,
      invertCategoryPosition: true
    } as never,
    null,
    defaults
  )
  expect(result.disableCategoryCount).toBe(true)
  expect(result.invertCategoryPosition).toBe(true)
  expect(result.doubleDashDocCount).toBe(true)
})

test('Test that placement count visibility prefers app settings preview overrides', () => {
  const result = resolveProjectHierarchyTreePlacementCountVisibility(
    {
      ...defaults,
      disableCategoryCount: false,
      disableDocumentCounts: true,
      doubleDashDocCount: false,
      invertCategoryPosition: false
    } as never,
    {
      disableCategoryCount: true,
      disableDocumentCounts: false,
      doubleDashDocCount: true
    },
    defaults
  )
  expect(result.disableCategoryCount).toBe(true)
  expect(result.disableDocumentCounts).toBe(false)
  expect(result.doubleDashDocCount).toBe(true)
})

test('Test that placement count visibility falls back to defaults when settings missing', () => {
  const result = resolveProjectHierarchyTreePlacementCountVisibility(
    null,
    null,
    {
      disableCategoryCount: true,
      disableDocumentCounts: true,
      doubleDashDocCount: true,
      invertCategoryPosition: true
    }
  )
  expect(result).toEqual({
    disableCategoryCount: true,
    disableDocumentCounts: true,
    doubleDashDocCount: true,
    invertCategoryPosition: true
  })
})
