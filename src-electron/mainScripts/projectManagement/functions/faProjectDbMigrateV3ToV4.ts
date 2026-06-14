import type { I_faProjectDbExecWithPragma } from 'app/types/I_faProjectDbSchemaDdl'

/**
 * Schema v4: worlds.color_pallete — semicolon-separated #RRGGBB hex list (max 2000 chars).
 */
export function migrateFaProjectSchemaV3ToV4 (db: I_faProjectDbExecWithPragma): void {
  db.exec(`
ALTER TABLE worlds
  ADD COLUMN color_pallete TEXT NOT NULL DEFAULT ''
  CHECK (length(color_pallete) <= 2000);
`)
  db.pragma('user_version = 4')
}
