import { expect, test } from 'vitest'

import { resolveProjectHierarchyTreeOpenIconExpanded } from '../projectHierarchyTreeOpenIconExpandedVisual'

test('Test that resolveProjectHierarchyTreeOpenIconExpanded uses stat open or persisted openNodeIds', () => {
  const expandedNodeIds = new Set(['group-1'])
  expect(resolveProjectHierarchyTreeOpenIconExpanded(expandedNodeIds, 'group-1', false)).toBe(true)
  expect(resolveProjectHierarchyTreeOpenIconExpanded(expandedNodeIds, 'group-2', true)).toBe(true)
  expect(resolveProjectHierarchyTreeOpenIconExpanded(expandedNodeIds, 'group-2', false)).toBe(false)
})
