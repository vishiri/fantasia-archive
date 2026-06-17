import type { I_faProjectDbExec } from 'app/types/I_faProjectDbSchemaDdl'

export const FA_PROJECT_DATA_TABLE_NAME = 'project_data'
export const FA_PROJECT_TABLE_WORLDS = 'worlds'
export const FA_PROJECT_TABLE_DOCUMENTS = 'documents'
export const FA_PROJECT_TABLE_DOCUMENT_TEMPLATES = 'document_templates'
export const FA_PROJECT_TABLE_MEDIA = 'media'
export const FA_PROJECT_TABLE_DOCUMENT_MEDIA = 'document_media'
export const FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS = 'world_template_groups'
export const FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS = 'world_template_placements'
export const FA_PROJECT_TABLE_WORLD_DOCUMENT_TEMPLATES = 'world_document_templates'

/** Default worlds.color hex when inserting worlds without an override. */
export const FA_PROJECT_WORLD_DEFAULT_COLOR = '#808080'

/** Max stored length for worlds.color_pallete (semicolon-separated #RRGGBB list). */
export const FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH = 2000

/** Default worlds.color_pallete when inserting worlds without an override. */
export const FA_PROJECT_WORLD_DEFAULT_COLOR_PALETTE = ''

/** Max stored length for document_templates.world_appendix. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_MAX_LENGTH = 500

/** Max stored length for document_templates.icon (icon name string). */
export const FA_PROJECT_DOCUMENT_TEMPLATE_ICON_MAX_LENGTH = 128

/** Default document_templates.world_appendix when inserting without an override. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_WORLD_APPENDIX = ''

/** Default document_templates.icon when inserting without an override. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_ICON = ''

/**
 * Creates world_template_groups and world_template_placements (schema v6).
 * Idempotent when tables already exist.
 */
export function applyFaProjectWorldTemplateLayoutSchemaV6 (db: I_faProjectDbExec): void {
  db.exec(`
CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS} (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_WORLDS}(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  root_sort_order INTEGER NOT NULL,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_WORLDS}(id) ON DELETE CASCADE,
  document_template_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES}(id) ON DELETE CASCADE,
  group_id TEXT REFERENCES ${FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS}(id) ON DELETE SET NULL,
  root_sort_order INTEGER,
  group_sort_order INTEGER,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  UNIQUE (world_id, document_template_id),
  CHECK (
    (group_id IS NULL AND root_sort_order IS NOT NULL AND group_sort_order IS NULL)
    OR
    (group_id IS NOT NULL AND group_sort_order IS NOT NULL AND root_sort_order IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_world_template_groups_world_root_sort
  ON ${FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS}(world_id, root_sort_order);
CREATE INDEX IF NOT EXISTS idx_world_template_placements_world_root_sort
  ON ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS}(world_id, root_sort_order);
CREATE INDEX IF NOT EXISTS idx_world_template_placements_group_sort
  ON ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS}(group_id, group_sort_order);
CREATE INDEX IF NOT EXISTS idx_world_template_placements_document_template_id
  ON ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS}(document_template_id);
`)
}

/**
 * Creates the project_data KV table (schema version 1). Idempotent when the table already exists.
 */
export function applyFaProjectProjectDataSchemaV1 (db: I_faProjectDbExec): void {
  db.exec(`
CREATE TABLE IF NOT EXISTS ${FA_PROJECT_DATA_TABLE_NAME} (
  option_id INTEGER PRIMARY KEY,
  option_name TEXT NOT NULL UNIQUE CHECK (length(option_name) BETWEEN 1 AND 255),
  option_value TEXT NOT NULL
);
`)
}

/**
 * Creates worldbuilding content tables and indexes for schema version 1.
 * Idempotent when tables already exist.
 */
export function applyFaProjectContentSchemaV1 (db: I_faProjectDbExec): void {
  db.exec(`
CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_WORLDS} (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  color TEXT NOT NULL DEFAULT '${FA_PROJECT_WORLD_DEFAULT_COLOR}'
  CHECK (length(color) = 7 AND substr(color, 1, 1) = '#'),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  world_appendix TEXT NOT NULL DEFAULT '${FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_WORLD_APPENDIX}'
  CHECK (length(world_appendix) <= ${FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_MAX_LENGTH}),
  icon TEXT NOT NULL DEFAULT '${FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_ICON}'
  CHECK (length(icon) <= ${FA_PROJECT_DOCUMENT_TEMPLATE_ICON_MAX_LENGTH}),
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

CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_DOCUMENT_MEDIA} (
  document_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_DOCUMENTS}(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_MEDIA}(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, media_id)
);
`)

  applyFaProjectWorldTemplateLayoutSchemaV6(db)

  db.exec(`
CREATE INDEX IF NOT EXISTS idx_documents_world_id ON ${FA_PROJECT_TABLE_DOCUMENTS}(world_id);
CREATE INDEX IF NOT EXISTS idx_documents_template_id ON ${FA_PROJECT_TABLE_DOCUMENTS}(template_id);
CREATE INDEX IF NOT EXISTS idx_document_media_media_id ON ${FA_PROJECT_TABLE_DOCUMENT_MEDIA}(media_id);
CREATE INDEX IF NOT EXISTS idx_worlds_sort_order ON ${FA_PROJECT_TABLE_WORLDS}(sort_order);
CREATE INDEX IF NOT EXISTS idx_document_templates_sort_order
  ON ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES}(sort_order);
`)
}
