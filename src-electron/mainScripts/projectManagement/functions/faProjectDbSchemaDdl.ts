import type { I_faProjectDbExec } from 'app/types/I_faProjectDbSchemaDdl'

export const FA_PROJECT_DATA_TABLE_NAME = 'project_data'
export const FA_PROJECT_TABLE_WORLDS = 'worlds'
export const FA_PROJECT_TABLE_DOCUMENTS = 'documents'
export const FA_PROJECT_TABLE_DOCUMENT_TEMPLATES = 'document_templates'
export const FA_PROJECT_TABLE_MEDIA = 'media'
export const FA_PROJECT_TABLE_DOCUMENT_MEDIA = 'document_media'
export const FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS = 'world_template_groups'
export const FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS = 'world_template_placements'
export const FA_PROJECT_TABLE_OPENED_DOCUMENTS = 'opened_documents'

/** documents tree anchor FK to world_template_placements.id */
export const FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN = 'tree_placement_id'

/** documents tree parent FK to documents.id (NULL = top-level under placement) */
export const FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN = 'tree_parent_document_id'

/** documents sibling order within placement + parent bucket */
export const FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN = 'tree_custom_sort_order'

/** documents optional text color (#RRGGBB) */
export const FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN = 'document_text_color'

/** documents optional background color (#RRGGBB) */
export const FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN = 'document_background_color'

/** Composite index on documents tree hierarchy columns */
export const FA_PROJECT_DOCUMENT_TREE_PLACEMENT_PARENT_SORT_INDEX =
  'idx_documents_tree_placement_parent_sort'

/** Legacy documents hierarchy column names (pre tree_* rename) */
export const FA_PROJECT_DOCUMENT_TREE_LEGACY_PLACEMENT_ID_COLUMN = 'placement_id'
export const FA_PROJECT_DOCUMENT_TREE_LEGACY_PARENT_DOCUMENT_ID_COLUMN = 'parent_document_id'
export const FA_PROJECT_DOCUMENT_TREE_LEGACY_SORT_ORDER_COLUMN = 'sort_order'

/** Legacy composite index name before tree_* column rename */
export const FA_PROJECT_DOCUMENT_TREE_LEGACY_PLACEMENT_PARENT_SORT_INDEX =
  'idx_documents_placement_parent_sort'

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

/** Max stored length for world_template_placements.nickname (matches FA_PROJECT_NAME_MAX_LEN). */
export const FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_MAX_LENGTH = 120

/** Default document_templates.world_appendix when inserting without an override. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_WORLD_APPENDIX = ''

/** Default document_templates.icon when inserting without an override. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_ICON = ''

/** Default document_templates.title_singular_translations_json for fresh rows. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_TITLE_SINGULAR_TRANSLATIONS_JSON = '{}'

/** Max stored JSON length for document_templates.title_singular_translations_json. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_SINGULAR_TRANSLATIONS_JSON_MAX_LENGTH = 4096

/** Default document_templates.title_translations_json for fresh rows. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_TITLE_TRANSLATIONS_JSON = '{}'

/** Max stored JSON length for document_templates.title_translations_json. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_TRANSLATIONS_JSON_MAX_LENGTH = 4096

/** Default worlds.display_name_translations_json for fresh rows. */
export const FA_PROJECT_WORLD_DEFAULT_DISPLAY_NAME_TRANSLATIONS_JSON = '{}'

/** Max stored JSON length for worlds.display_name_translations_json. */
export const FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH = 4096

/** Default document_templates.world_appendix_translations_json for fresh rows. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_WORLD_APPENDIX_TRANSLATIONS_JSON = '{}'

/** Max stored JSON length for document_templates.world_appendix_translations_json. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_TRANSLATIONS_JSON_MAX_LENGTH = 8192

/** Default world_template_groups.display_name_translations_json for fresh rows. */
export const FA_PROJECT_WORLD_TEMPLATE_GROUP_DEFAULT_DISPLAY_NAME_TRANSLATIONS_JSON = '{}'

/** Max stored JSON length for world_template_groups.display_name_translations_json. */
export const FA_PROJECT_WORLD_TEMPLATE_GROUP_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH = 4096

/** Default world_template_placements.nickname_singular_translations_json for fresh rows. */
export const FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_DEFAULT_NICKNAME_SINGULAR_TRANSLATIONS_JSON = '{}'

/** Max stored JSON length for world_template_placements.nickname_singular_translations_json. */
export const FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_SINGULAR_TRANSLATIONS_JSON_MAX_LENGTH = 4096

/** Default world_template_placements.nickname_translations_json for fresh rows. */
export const FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_DEFAULT_NICKNAME_TRANSLATIONS_JSON = '{}'

/** Max stored JSON length for world_template_placements.nickname_translations_json. */
export const FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_TRANSLATIONS_JSON_MAX_LENGTH = 4096

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
 * Creates worldbuilding content tables through media (schema version 1).
 */
function applyFaProjectContentSchemaV1CoreTables (db: I_faProjectDbExec): void {
  db.exec(`
CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_WORLDS} (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  display_name_translations_json TEXT NOT NULL DEFAULT '${FA_PROJECT_WORLD_DEFAULT_DISPLAY_NAME_TRANSLATIONS_JSON}'
  CHECK (length(display_name_translations_json) <= ${FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH}),
  color TEXT NOT NULL DEFAULT '${FA_PROJECT_WORLD_DEFAULT_COLOR}'
  CHECK (length(color) = 7 AND substr(color, 1, 1) = '#'),
  color_pallete TEXT NOT NULL DEFAULT '${FA_PROJECT_WORLD_DEFAULT_COLOR_PALETTE}'
  CHECK (length(color_pallete) <= ${FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH}),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  title_translations_json TEXT NOT NULL DEFAULT '${FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_TITLE_TRANSLATIONS_JSON}'
  CHECK (length(title_translations_json) <= ${FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_TRANSLATIONS_JSON_MAX_LENGTH}),
  title_singular_translations_json TEXT NOT NULL DEFAULT '${FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_TITLE_SINGULAR_TRANSLATIONS_JSON}'
  CHECK (length(title_singular_translations_json) <= ${FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_SINGULAR_TRANSLATIONS_JSON_MAX_LENGTH}),
  sort_order INTEGER NOT NULL DEFAULT 0,
  world_appendix TEXT NOT NULL DEFAULT '${FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_WORLD_APPENDIX}'
  CHECK (length(world_appendix) <= ${FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_MAX_LENGTH}),
  world_appendix_translations_json TEXT NOT NULL DEFAULT '${FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_WORLD_APPENDIX_TRANSLATIONS_JSON}'
  CHECK (length(world_appendix_translations_json) <= ${FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_TRANSLATIONS_JSON_MAX_LENGTH}),
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
`)
}

/**
 * Creates documents, layout, and content indexes for schema version 1.
 */
function applyFaProjectContentSchemaV1DocumentsAndIndexes (db: I_faProjectDbExec): void {
  db.exec(`
CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_DOCUMENTS} (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_WORLDS}(id) ON DELETE RESTRICT,
  template_id TEXT REFERENCES ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES}(id) ON DELETE RESTRICT,
  ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN} TEXT REFERENCES ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS}(id) ON DELETE RESTRICT,
  ${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} TEXT REFERENCES ${FA_PROJECT_TABLE_DOCUMENTS}(id) ON DELETE CASCADE,
  ${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN} INTEGER NOT NULL DEFAULT 0,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  ${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN} TEXT
  CHECK (${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN} IS NULL OR (
    length(${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN}) = 7 AND
    substr(${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN}, 1, 1) = '#'
  )),
  ${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN} TEXT
  CHECK (${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN} IS NULL OR (
    length(${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN}) = 7 AND
    substr(${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN}, 1, 1) = '#'
  )),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_DOCUMENT_MEDIA} (
  document_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_DOCUMENTS}(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_MEDIA}(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, media_id)
);

CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS} (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES ${FA_PROJECT_TABLE_WORLDS}(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  display_name_translations_json TEXT NOT NULL DEFAULT '${FA_PROJECT_WORLD_TEMPLATE_GROUP_DEFAULT_DISPLAY_NAME_TRANSLATIONS_JSON}'
  CHECK (length(display_name_translations_json) <= ${FA_PROJECT_WORLD_TEMPLATE_GROUP_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH}),
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
  nickname TEXT NOT NULL DEFAULT ''
  CHECK (length(nickname) <= ${FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_MAX_LENGTH}),
  nickname_translations_json TEXT NOT NULL DEFAULT '${FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_DEFAULT_NICKNAME_TRANSLATIONS_JSON}'
  CHECK (length(nickname_translations_json) <= ${FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_TRANSLATIONS_JSON_MAX_LENGTH}),
  nickname_singular_translations_json TEXT NOT NULL DEFAULT '${FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_DEFAULT_NICKNAME_SINGULAR_TRANSLATIONS_JSON}'
  CHECK (length(nickname_singular_translations_json) <= ${FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_SINGULAR_TRANSLATIONS_JSON_MAX_LENGTH}),
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
CREATE INDEX IF NOT EXISTS idx_documents_world_id ON ${FA_PROJECT_TABLE_DOCUMENTS}(world_id);
CREATE INDEX IF NOT EXISTS idx_documents_template_id ON ${FA_PROJECT_TABLE_DOCUMENTS}(template_id);
CREATE INDEX IF NOT EXISTS ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_PARENT_SORT_INDEX}
  ON ${FA_PROJECT_TABLE_DOCUMENTS}(${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN}, ${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN}, ${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN});
CREATE INDEX IF NOT EXISTS idx_document_media_media_id ON ${FA_PROJECT_TABLE_DOCUMENT_MEDIA}(media_id);
CREATE INDEX IF NOT EXISTS idx_worlds_sort_order ON ${FA_PROJECT_TABLE_WORLDS}(sort_order);
CREATE INDEX IF NOT EXISTS idx_document_templates_sort_order
  ON ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES}(sort_order);
`)
}

/**
 * Creates the opened_documents singleton snapshot table (schema version 1).
 */
export function applyFaProjectOpenedDocumentsSchemaV1 (db: I_faProjectDbExec): void {
  db.exec(`
CREATE TABLE IF NOT EXISTS ${FA_PROJECT_TABLE_OPENED_DOCUMENTS} (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  snapshot_json TEXT NOT NULL,
  updated_at_ms INTEGER NOT NULL
);
`)
}

/**
 * Creates worldbuilding content tables and indexes for schema version 1.
 * Idempotent when tables already exist.
 */
export function applyFaProjectContentSchemaV1 (db: I_faProjectDbExec): void {
  applyFaProjectContentSchemaV1CoreTables(db)
  applyFaProjectContentSchemaV1DocumentsAndIndexes(db)
  applyFaProjectOpenedDocumentsSchemaV1(db)
}
