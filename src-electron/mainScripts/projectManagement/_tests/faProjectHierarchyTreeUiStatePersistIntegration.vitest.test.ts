import Database from 'better-sqlite3'
import { afterEach, expect, test } from 'vitest'

import { applyFaProjectContentSchemaV1, applyFaProjectProjectDataSchemaV1 } from '../functions/faProjectDbSchemaDdl'
import {
  readFaProjectHierarchyTreeUiState,
  upsertFaProjectHierarchyTreeUiStateKv
} from '../faProjectHierarchyTreeUiStatePersistWiring'
import { upsertFaProjectDataKv } from '../faProjectDataKvWiring'

let db: Database | null = null

afterEach(() => {
  db?.close()
  db = null
})

/**
 * readFaProjectHierarchyTreeUiState
 * Parses hierarchy_tree_ui_state JSON from project_data KV.
 */
test('Test that readFaProjectHierarchyTreeUiState reads persisted KV JSON', () => {
  db = new Database(':memory:')
  applyFaProjectContentSchemaV1(db)
  applyFaProjectProjectDataSchemaV1(db)
  upsertFaProjectDataKv(
    db,
    'hierarchy_tree_ui_state',
    '{"schemaVersion":1,"expandedNodeIds":["world-1"],"scrollTopPx":16}'
  )
  const state = readFaProjectHierarchyTreeUiState(db)
  expect(state.expandedNodeIds).toEqual(['world-1'])
  expect(state.scrollTopPx).toBe(16)
})

/**
 * upsertFaProjectHierarchyTreeUiStateKv
 * Merges expandedNodeIds into existing KV state on real SQLite.
 */
test('Test that upsertFaProjectHierarchyTreeUiStateKv merges expandedNodeIds on real db', () => {
  db = new Database(':memory:')
  applyFaProjectContentSchemaV1(db)
  applyFaProjectProjectDataSchemaV1(db)
  upsertFaProjectHierarchyTreeUiStateKv(db, { scrollTopPx: 4 })
  upsertFaProjectHierarchyTreeUiStateKv(db, { expandedNodeIds: ['placement-1'] })
  const state = readFaProjectHierarchyTreeUiState(db)
  expect(state.scrollTopPx).toBe(4)
  expect(state.expandedNodeIds).toEqual(['placement-1'])
})

/**
 * upsertFaProjectHierarchyTreeUiStateKv
 * Updates only expandedNodeIds while preserving scrollTopPx from KV.
 */
test('Test that upsertFaProjectHierarchyTreeUiStateKv merges expandedNodeIds only', () => {
  db = new Database(':memory:')
  applyFaProjectContentSchemaV1(db)
  applyFaProjectProjectDataSchemaV1(db)
  upsertFaProjectDataKv(
    db,
    'hierarchy_tree_ui_state',
    '{"schemaVersion":1,"expandedNodeIds":[],"scrollTopPx":9}'
  )
  upsertFaProjectHierarchyTreeUiStateKv(db, { expandedNodeIds: ['world-2'] })
  const state = readFaProjectHierarchyTreeUiState(db)
  expect(state.scrollTopPx).toBe(9)
  expect(state.expandedNodeIds).toEqual(['world-2'])
})
