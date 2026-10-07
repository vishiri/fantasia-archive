import { expect, test } from 'vitest'

import {
  beginProjectHierarchyTreeSuppressEmit,
  endProjectHierarchyTreeSuppressEmit
} from '../projectHierarchyTreeSuppressEmitDepth'

test('Test that project hierarchy tree suppress stays set until every overlapping publish ends', () => {
  const suppressTreeEmit = { value: false }
  beginProjectHierarchyTreeSuppressEmit(suppressTreeEmit)
  beginProjectHierarchyTreeSuppressEmit(suppressTreeEmit)
  endProjectHierarchyTreeSuppressEmit(suppressTreeEmit)
  expect(suppressTreeEmit.value).toBe(true)
  endProjectHierarchyTreeSuppressEmit(suppressTreeEmit)
  expect(suppressTreeEmit.value).toBe(false)
})

test('Test that project hierarchy tree suppress end without a begin stays clear', () => {
  const suppressTreeEmit = { value: true }
  endProjectHierarchyTreeSuppressEmit(suppressTreeEmit)
  endProjectHierarchyTreeSuppressEmit(suppressTreeEmit)
  expect(suppressTreeEmit.value).toBe(false)
})
