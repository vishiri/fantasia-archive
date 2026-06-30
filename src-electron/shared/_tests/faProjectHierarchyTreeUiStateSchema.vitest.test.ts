import { expect, test } from 'vitest'

import {
  parseFaProjectHierarchyTreeUiStateJson,
  parseFaProjectHierarchyTreeUiStatePatch,
  serializeFaProjectHierarchyTreeUiStateJson
} from '../faProjectHierarchyTreeUiStateSchema'

/**
 * parseFaProjectHierarchyTreeUiStateJson
 * Falls back to empty defaults when JSON is invalid.
 */
test('Test that parseFaProjectHierarchyTreeUiStateJson falls back on invalid JSON', () => {
  const parsed = parseFaProjectHierarchyTreeUiStateJson('{not-json')
  expect(parsed.expandedNodeIds).toEqual([])
  expect(parsed.scrollTopPx).toBe(0)
})

/**
 * serializeFaProjectHierarchyTreeUiStateJson
 * Round-trips valid hierarchy UI state objects.
 */
test('Test that serializeFaProjectHierarchyTreeUiStateJson round trips state', () => {
  const raw = serializeFaProjectHierarchyTreeUiStateJson({
    schemaVersion: 1,
    expandedNodeIds: ['world-1'],
    scrollTopPx: 24
  })
  const parsed = parseFaProjectHierarchyTreeUiStateJson(raw)
  expect(parsed.expandedNodeIds).toEqual(['world-1'])
  expect(parsed.scrollTopPx).toBe(24)
})

/**
 * parseFaProjectHierarchyTreeUiStatePatch
 * Accepts partial patch objects from renderer IPC.
 */
test('Test that parseFaProjectHierarchyTreeUiStatePatch accepts scrollTopPx patch', () => {
  const patch = parseFaProjectHierarchyTreeUiStatePatch({ scrollTopPx: 10 })
  expect(patch.scrollTopPx).toBe(10)
})

/**
 * parseFaProjectHierarchyTreeUiStatePatch
 * Throws when patch is not a plain object.
 */
test('Test that parseFaProjectHierarchyTreeUiStatePatch rejects non-object patch', () => {
  expect(() => parseFaProjectHierarchyTreeUiStatePatch(null)).toThrow(
    'Hierarchy tree UI state patch must be a plain object'
  )
})
