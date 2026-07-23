import { expect, test } from 'vitest'

import {
  resolveProjectHierarchyTreeWorldsLayoutExpandSnapshot,
  shouldPersistProjectHierarchyTreeRestoredExpandedNodeIds
} from '../projectHierarchyTreeWorldsLayoutExpandSnapshot'

/**
 * resolveProjectHierarchyTreeWorldsLayoutExpandSnapshot
 * Prefer live open ids when collect returns a non-empty snapshot.
 */
test('Test that worlds layout expand snapshot prefers live open ids', () => {
  expect(resolveProjectHierarchyTreeWorldsLayoutExpandSnapshot({
    liveExpandedSnapshot: ['world-1'],
    storeExpandedNodeIds: ['world-stale']
  })).toEqual(['world-1'])
})

/**
 * resolveProjectHierarchyTreeWorldsLayoutExpandSnapshot
 * Fall back to store ids when live collect is empty (tree/open race).
 */
test('Test that worlds layout expand snapshot falls back to store ids', () => {
  expect(resolveProjectHierarchyTreeWorldsLayoutExpandSnapshot({
    liveExpandedSnapshot: [],
    storeExpandedNodeIds: ['world-1', 'group-1']
  })).toEqual(['world-1', 'group-1'])
})

/**
 * resolveProjectHierarchyTreeWorldsLayoutExpandSnapshot
 * Return empty when both live collect and store ids are empty.
 */
test('Test that worlds layout expand snapshot returns empty when live and store are empty', () => {
  expect(resolveProjectHierarchyTreeWorldsLayoutExpandSnapshot({
    liveExpandedSnapshot: [],
    storeExpandedNodeIds: []
  })).toEqual([])
})

/**
 * shouldPersistProjectHierarchyTreeRestoredExpandedNodeIds
 * Skip persisting empty restore when intended ids existed but tree was empty.
 */
test('Test that restored expand persist skips empty wipe while tree is empty', () => {
  expect(shouldPersistProjectHierarchyTreeRestoredExpandedNodeIds({
    intendedExpandedNodeIds: ['world-1'],
    restoredExpandedNodeIds: [],
    treeNodeCount: 0
  })).toBe(false)
  expect(shouldPersistProjectHierarchyTreeRestoredExpandedNodeIds({
    intendedExpandedNodeIds: ['world-1'],
    restoredExpandedNodeIds: [],
    treeNodeCount: 1
  })).toBe(true)
  expect(shouldPersistProjectHierarchyTreeRestoredExpandedNodeIds({
    intendedExpandedNodeIds: [],
    restoredExpandedNodeIds: [],
    treeNodeCount: 0
  })).toBe(true)
  expect(shouldPersistProjectHierarchyTreeRestoredExpandedNodeIds({
    intendedExpandedNodeIds: ['world-1'],
    restoredExpandedNodeIds: ['world-1'],
    treeNodeCount: 0
  })).toBe(true)
})
