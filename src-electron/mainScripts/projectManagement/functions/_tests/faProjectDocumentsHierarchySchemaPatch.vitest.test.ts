import Database from 'better-sqlite3'
import { afterEach, expect, test } from 'vitest'

import { createApplyFaProjectDocumentsHierarchySchemaPatch } from '../faProjectDocumentsHierarchySchemaPatch'
import {
  applyFaProjectContentSchemaV1,
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS,
  FA_PROJECT_TABLE_WORLDS
} from '../faProjectDbSchemaDdl'

let db: Database | null = null

afterEach(() => {
  db?.close()
  db = null
})

function openLegacyDocumentsSchemaDb (): Database {
  const connection = new Database(':memory:')
  connection.exec(`
CREATE TABLE ${FA_PROJECT_TABLE_WORLDS} (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL,
  display_name_translations_json TEXT NOT NULL DEFAULT '{}',
  color TEXT NOT NULL DEFAULT '#808080',
  color_pallete TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);
CREATE TABLE ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL,
  title_translations_json TEXT NOT NULL DEFAULT '{}',
  title_singular_translations_json TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  world_appendix TEXT NOT NULL DEFAULT '',
  world_appendix_translations_json TEXT NOT NULL DEFAULT '{}',
  icon TEXT NOT NULL DEFAULT '',
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);
CREATE TABLE ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL,
  document_template_id TEXT NOT NULL,
  group_id TEXT,
  root_sort_order INTEGER,
  group_sort_order INTEGER,
  nickname TEXT NOT NULL DEFAULT '',
  nickname_translations_json TEXT NOT NULL DEFAULT '{}',
  nickname_singular_translations_json TEXT NOT NULL DEFAULT '{}',
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);
CREATE TABLE ${FA_PROJECT_TABLE_DOCUMENTS} (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL,
  template_id TEXT,
  display_name TEXT NOT NULL,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);
`)
  return connection
}

/**
 * applyFaProjectDocumentsHierarchySchemaPatch
 * Adds missing hierarchy columns and backfills placement_id from world+template join.
 */
test('Test that applyFaProjectDocumentsHierarchySchemaPatch backfills placement_id on legacy rows', () => {
  db = openLegacyDocumentsSchemaDb()
  const now = Date.now()
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_WORLDS} ` +
      '(id, display_name, created_at_ms, updated_at_ms) VALUES (?, ?, ?, ?)'
  ).run('world-1', 'Realm', now, now)
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} ` +
      '(id, display_name, created_at_ms, updated_at_ms) VALUES (?, ?, ?, ?)'
  ).run('tpl-1', 'Character', now, now)
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} ` +
      '(id, world_id, document_template_id, root_sort_order, created_at_ms, updated_at_ms) ' +
      'VALUES (?, ?, ?, ?, ?, ?)'
  ).run('place-1', 'world-1', 'tpl-1', 0, now, now)
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_DOCUMENTS} ` +
      '(id, world_id, template_id, display_name, created_at_ms, updated_at_ms) ' +
      'VALUES (?, ?, ?, ?, ?, ?)'
  ).run('doc-1', 'world-1', 'tpl-1', 'Hero', now, now)

  const applyFaProjectDocumentsHierarchySchemaPatch =
    createApplyFaProjectDocumentsHierarchySchemaPatch({
      documentsTableName: FA_PROJECT_TABLE_DOCUMENTS,
      placementsTableName: FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS
    })

  applyFaProjectDocumentsHierarchySchemaPatch(db)
  applyFaProjectDocumentsHierarchySchemaPatch(db)

  const row = db
    .prepare(
      `SELECT placement_id, parent_document_id, sort_order FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`
    )
    .get('doc-1') as {
    placement_id: string | null
    parent_document_id: string | null
    sort_order: number
  }
  expect(row.placement_id).toBe('place-1')
  expect(row.parent_document_id).toBeNull()
  expect(row.sort_order).toBe(0)
})

/**
 * applyFaProjectContentSchemaV1
 * Fresh bootstrap includes hierarchy columns on documents.
 */
test('Test that applyFaProjectContentSchemaV1 creates documents hierarchy columns', () => {
  db = new Database(':memory:')
  applyFaProjectContentSchemaV1(db)
  const columns = db.pragma(`table_info(${FA_PROJECT_TABLE_DOCUMENTS})`) as Array<{ name: string }>
  const names = columns.map((column) => column.name)
  expect(names).toContain('placement_id')
  expect(names).toContain('parent_document_id')
  expect(names).toContain('sort_order')
})
