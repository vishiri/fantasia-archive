import { expect, test } from 'vitest'

import {
  compareProjectHierarchyTreeShallowFirstLazyLoadRows,
  shouldContinueLatentExpandAfterStallRetry
} from '../projectHierarchyTreeLatentExpandOrder'

test('Test that compareProjectHierarchyTreeShallowFirstLazyLoadRows orders by depth then node id', () => {
  expect(compareProjectHierarchyTreeShallowFirstLazyLoadRows(
    {
      depth: 2,
      nodeId: 'b'
    },
    {
      depth: 1,
      nodeId: 'a'
    }
  )).toBeGreaterThan(0)
  expect(compareProjectHierarchyTreeShallowFirstLazyLoadRows(
    {
      depth: 1,
      nodeId: 'a'
    },
    {
      depth: 2,
      nodeId: 'b'
    }
  )).toBeLessThan(0)
  expect(compareProjectHierarchyTreeShallowFirstLazyLoadRows(
    {
      depth: 2,
      nodeId: 'doc-a'
    },
    {
      depth: 2,
      nodeId: 'doc-z'
    }
  )).toBeLessThan(0)
  expect(compareProjectHierarchyTreeShallowFirstLazyLoadRows(
    {
      depth: 2,
      nodeId: 'doc-z'
    },
    {
      depth: 2,
      nodeId: 'doc-a'
    }
  )).toBeGreaterThan(0)
})

test('Test that shouldContinueLatentExpandAfterStallRetry detects cleared stalls', () => {
  expect(shouldContinueLatentExpandAfterStallRetry('placement-1', '')).toBe(true)
  expect(shouldContinueLatentExpandAfterStallRetry('placement-1', 'placement-1')).toBe(false)
})
