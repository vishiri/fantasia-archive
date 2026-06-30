import { expect, test, vi } from 'vitest'

import {
  readFaProjectHierarchyTreeUiState,
  upsertFaProjectHierarchyTreeUiStateKv
} from '../faProjectHierarchyTreeUiStatePersistWiring'

/**
 * readFaProjectHierarchyTreeUiState
 * Returns defaults when KV row is missing.
 */
test('Test that readFaProjectHierarchyTreeUiState returns defaults when KV is absent', () => {
  const db = {
    prepare: vi.fn(() => ({
      get: vi.fn(() => undefined)
    }))
  }
  const state = readFaProjectHierarchyTreeUiState(db as never)
  expect(state.expandedNodeIds).toEqual([])
  expect(state.scrollTopPx).toBe(0)
})

/**
 * readFaProjectHierarchyTreeUiState
 * Parses stored JSON when KV row is present.
 */
test('Test that readFaProjectHierarchyTreeUiState parses stored KV JSON', () => {
  const db = {
    prepare: vi.fn(() => ({
      get: vi.fn(() => ({
        v: JSON.stringify({
          schemaVersion: 1,
          expandedNodeIds: ['world-1'],
          scrollTopPx: 3
        })
      }))
    }))
  }
  const state = readFaProjectHierarchyTreeUiState(db as never)
  expect(state.expandedNodeIds).toEqual(['world-1'])
  expect(state.scrollTopPx).toBe(3)
})

/**
 * upsertFaProjectHierarchyTreeUiStateKv
 * Merges expandedNodeIds and scrollTopPx into hierarchy_tree_ui_state JSON.
 */
test('Test that upsertFaProjectHierarchyTreeUiStateKv writes merged JSON patch', () => {
  const runs: Array<{ name: string, value: string }> = []
  const db = {
    prepare: vi.fn((sql: string) => ({
      get: vi.fn((optionName: string) => {
        if (optionName === 'hierarchy_tree_ui_state') {
          return {
            v: JSON.stringify({
              schemaVersion: 1,
              expandedNodeIds: ['world-1'],
              scrollTopPx: 12
            })
          }
        }
        return undefined
      }),
      run: vi.fn((payload: { name: string, value: string }) => {
        if (sql.includes('INSERT') || sql.includes('UPDATE')) {
          runs.push(payload)
        }
      })
    }))
  }
  upsertFaProjectHierarchyTreeUiStateKv(db as never, {
    scrollTopPx: 48
  })
  expect(runs.length).toBeGreaterThan(0)
  const last = runs[runs.length - 1]
  expect(last?.name).toBe('hierarchy_tree_ui_state')
  const parsed = JSON.parse(last?.value ?? '{}') as {
    expandedNodeIds: string[]
    scrollTopPx: number
  }
  expect(parsed.expandedNodeIds).toEqual(['world-1'])
  expect(parsed.scrollTopPx).toBe(48)
})

/**
 * upsertFaProjectHierarchyTreeUiStateKv
 * No-ops when patch has no recognized fields.
 */
test('Test that upsertFaProjectHierarchyTreeUiStateKv no-ops on empty patch', () => {
  const db = {
    prepare: vi.fn()
  }
  upsertFaProjectHierarchyTreeUiStateKv(db as never, {})
  expect(db.prepare).not.toHaveBeenCalled()
})
