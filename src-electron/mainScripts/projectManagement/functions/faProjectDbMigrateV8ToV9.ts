import type { I_faProjectDbExecWithPragma } from 'app/types/I_faProjectDbSchemaDdl'

/**
 * Schema v9: per-locale world display names and document template world appendix JSON.
 */
export function migrateFaProjectSchemaV8ToV9 (
  db: I_faProjectDbExecWithPragma,
  deps: {
    documentTemplatesTableName: string
    worldsTableName: string
  }
): void {
  db.exec(
    `ALTER TABLE ${deps.worldsTableName} ` +
      "ADD COLUMN display_name_translations_json TEXT NOT NULL DEFAULT '{}'"
  )
  db.exec(
    `UPDATE ${deps.worldsTableName} ` +
      "SET display_name_translations_json = json_object('en-US', display_name)"
  )
  db.exec(
    `ALTER TABLE ${deps.documentTemplatesTableName} ` +
      "ADD COLUMN world_appendix_translations_json TEXT NOT NULL DEFAULT '{}'"
  )
  db.exec(
    `UPDATE ${deps.documentTemplatesTableName} ` +
      'SET world_appendix_translations_json = CASE ' +
      "WHEN length(trim(world_appendix)) > 0 THEN json_object('en-US', world_appendix) " +
      "ELSE '{}' END"
  )
  db.pragma('user_version = 9')
}
