import type Database from 'better-sqlite3'

import {
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TAGS,
  FA_PROJECT_TABLE_TAGS,
  FA_PROJECT_TABLE_WORLDS
} from '../functions/faProjectDbSchemaDdl'

/**
 * Creates tags / document_tags tables and indexes when missing (bootstrap + v7 migrate).
 */
export function applyFaProjectTagsSchemaPatch (db: Database): void {
  db.exec(`
CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_TAGS} (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_WORLDS}(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) > 0),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_DOCUMENT_TAGS} (
  document_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_DOCUMENTS}(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_TAGS}(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (document_id, tag_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_world_id_name_nocase
  ON ${FA_PROJECT_TABLE_TAGS}(world_id, name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_tags_world_id ON ${FA_PROJECT_TABLE_TAGS}(world_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_tag_id_sort
  ON ${FA_PROJECT_TABLE_DOCUMENT_TAGS}(tag_id, sort_order);
`)
}
