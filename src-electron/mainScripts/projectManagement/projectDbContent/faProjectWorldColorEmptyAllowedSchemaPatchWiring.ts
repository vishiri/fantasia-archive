import type { I_faProjectDbExec } from 'app/types/I_faProjectDbSchemaDdl'

import {
  FA_PROJECT_TABLE_WORLDS,
  FA_PROJECT_WORLD_COLOR_CHECK_SQL,
  FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
  FA_PROJECT_WORLD_DEFAULT_COLOR,
  FA_PROJECT_WORLD_DEFAULT_COLOR_PALETTE,
  FA_PROJECT_WORLD_DEFAULT_DISPLAY_NAME_TRANSLATIONS_JSON,
  FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH
} from '../functions/faProjectDbSchemaDdl'

const WORLDS_REBUILD_TABLE_NAME = `${FA_PROJECT_TABLE_WORLDS}__fa_color_empty`

function readFaProjectWorldsTableSql (db: I_faProjectDbExec): string | null {
  if (typeof db.prepare !== 'function') {
    return null
  }
  const statement = db.prepare(
    'SELECT sql AS sql FROM sqlite_master WHERE type = ? AND name = ?'
  )
  if (statement == null || typeof statement.get !== 'function') {
    return null
  }
  const row = statement.get('table', FA_PROJECT_TABLE_WORLDS) as { sql?: string } | undefined
  const sql = row?.sql
  if (typeof sql !== 'string' || sql.trim().length === 0) {
    return null
  }
  return sql
}

function faProjectWorldsColorCheckAllowsEmpty (tableSql: string): boolean {
  return /color\s*=\s*''\s*OR/i.test(tableSql)
}

function faProjectWorldsColorCheckRequiresStrictHex (tableSql: string): boolean {
  return (
    /length\s*\(\s*color\s*\)\s*=\s*7/i.test(tableSql) &&
    !faProjectWorldsColorCheckAllowsEmpty(tableSql)
  )
}

function rebuildFaProjectWorldsTableAllowingEmptyColor (db: I_faProjectDbExec): void {
  db.exec(`
PRAGMA foreign_keys=OFF;
DROP TABLE IF EXISTS ${WORLDS_REBUILD_TABLE_NAME};
CREATE TABLE ${WORLDS_REBUILD_TABLE_NAME} (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  display_name_translations_json TEXT NOT NULL DEFAULT '${FA_PROJECT_WORLD_DEFAULT_DISPLAY_NAME_TRANSLATIONS_JSON}'
  CHECK (length(display_name_translations_json) <= ${FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH}),
  color TEXT NOT NULL DEFAULT '${FA_PROJECT_WORLD_DEFAULT_COLOR}'
  CHECK ${FA_PROJECT_WORLD_COLOR_CHECK_SQL},
  color_pallete TEXT NOT NULL DEFAULT '${FA_PROJECT_WORLD_DEFAULT_COLOR_PALETTE}'
  CHECK (length(color_pallete) <= ${FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH}),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);
INSERT INTO ${WORLDS_REBUILD_TABLE_NAME} (
  id,
  display_name,
  display_name_translations_json,
  color,
  color_pallete,
  sort_order,
  created_at_ms,
  updated_at_ms
)
SELECT
  id,
  display_name,
  display_name_translations_json,
  color,
  color_pallete,
  sort_order,
  created_at_ms,
  updated_at_ms
FROM ${FA_PROJECT_TABLE_WORLDS};
DROP TABLE ${FA_PROJECT_TABLE_WORLDS};
ALTER TABLE ${WORLDS_REBUILD_TABLE_NAME} RENAME TO ${FA_PROJECT_TABLE_WORLDS};
CREATE INDEX IF NOT EXISTS idx_worlds_sort_order ON ${FA_PROJECT_TABLE_WORLDS}(sort_order);
PRAGMA foreign_keys=ON;
`)
}

/**
 * Idempotent patch: rebuilds worlds when color CHECK still requires strict #RRGGBB
 * so empty optional color can persist.
 */
export function applyFaProjectWorldColorEmptyAllowedSchemaPatch (db: I_faProjectDbExec): void {
  const tableSql = readFaProjectWorldsTableSql(db)
  if (tableSql === null) {
    return
  }
  if (!faProjectWorldsColorCheckRequiresStrictHex(tableSql)) {
    return
  }
  rebuildFaProjectWorldsTableAllowingEmptyColor(db)
}
