import type { I_faProjectDbExec } from 'app/types/I_faProjectDbSchemaDdl'

export const FA_PROJECT_TABLE_WORLDS = 'worlds'
export const FA_PROJECT_TABLE_DOCUMENTS = 'documents'
export const FA_PROJECT_TABLE_DOCUMENT_TEMPLATES = 'document_templates'
export const FA_PROJECT_TABLE_MEDIA = 'media'
export const FA_PROJECT_TABLE_WORLD_MEDIA = 'world_media'
export const FA_PROJECT_TABLE_DOCUMENT_MEDIA = 'document_media'

/**
 * Creates v4 worldbuilding content tables and indexes. Idempotent when tables already exist.
 */
export function applyFaProjectContentSchemaV4 (db: I_faProjectDbExec): void {
  db.exec(`
CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_WORLDS} (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_MEDIA} (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_DOCUMENTS} (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_WORLDS}(id) ON DELETE RESTRICT,
  template_id TEXT REFERENCES ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES}(id) ON DELETE RESTRICT,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_WORLD_MEDIA} (
  world_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_WORLDS}(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_MEDIA}(id) ON DELETE CASCADE,
  PRIMARY KEY (world_id, media_id)
);

CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_DOCUMENT_MEDIA} (
  document_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_DOCUMENTS}(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_MEDIA}(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, media_id)
);

CREATE INDEX IF NOT EXISTS idx_documents_world_id ON ${FA_PROJECT_TABLE_DOCUMENTS}(world_id);
CREATE INDEX IF NOT EXISTS idx_documents_template_id ON ${FA_PROJECT_TABLE_DOCUMENTS}(template_id);
CREATE INDEX IF NOT EXISTS idx_world_media_media_id ON ${FA_PROJECT_TABLE_WORLD_MEDIA}(media_id);
CREATE INDEX IF NOT EXISTS idx_document_media_media_id ON ${FA_PROJECT_TABLE_DOCUMENT_MEDIA}(media_id);
`)
}
