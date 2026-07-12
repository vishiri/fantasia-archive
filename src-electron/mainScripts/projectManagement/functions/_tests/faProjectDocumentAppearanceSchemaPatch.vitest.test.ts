import Database from 'better-sqlite3'
import { afterEach, expect, test } from 'vitest'

import { applyFaProjectDocumentAppearanceSchemaPatch } from '../../projectDbContent/faProjectDocumentAppearanceSchemaPatchWiring'
import {
  applyFaProjectContentSchemaV1,
  FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN,
  FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS
} from '../faProjectDbSchemaDdl'

let db: Database | null = null

afterEach(() => {
  db?.close()
  db = null
})

/**
 * applyFaProjectDocumentAppearanceSchemaPatch
 * Adds nullable appearance color columns on legacy documents tables.
 */
test('Test that applyFaProjectDocumentAppearanceSchemaPatch adds color columns idempotently', () => {
  db = new Database(':memory:')
  db.exec(`
CREATE TABLE ${FA_PROJECT_TABLE_DOCUMENTS} (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL,
  template_id TEXT,
  display_name TEXT NOT NULL,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);
`)
  applyFaProjectDocumentAppearanceSchemaPatch(db)
  applyFaProjectDocumentAppearanceSchemaPatch(db)

  const columns = db.pragma(`table_info(${FA_PROJECT_TABLE_DOCUMENTS})`) as Array<{ name: string }>
  const names = columns.map((column) => column.name)
  expect(names).toContain(FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN)
  expect(names).toContain(FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN)
})

/**
 * applyFaProjectContentSchemaV1
 * Fresh bootstrap includes document appearance color columns.
 */
test('Test that applyFaProjectContentSchemaV1 creates document appearance color columns', () => {
  db = new Database(':memory:')
  applyFaProjectContentSchemaV1(db)
  const columns = db.pragma(`table_info(${FA_PROJECT_TABLE_DOCUMENTS})`) as Array<{ name: string }>
  const names = columns.map((column) => column.name)
  expect(names).toContain(FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN)
  expect(names).toContain(FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN)
})
