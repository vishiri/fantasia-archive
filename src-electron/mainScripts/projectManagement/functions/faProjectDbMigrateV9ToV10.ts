import type { I_faProjectDbExecWithPragma } from 'app/types/I_faProjectDbSchemaDdl'

/**
 * Schema v10: per-locale world template group display names and placement nickname JSON.
 */
export function migrateFaProjectSchemaV9ToV10 (
  db: I_faProjectDbExecWithPragma,
  deps: {
    worldTemplateGroupsTableName: string
    worldTemplatePlacementsTableName: string
  }
): void {
  db.exec(
    `ALTER TABLE ${deps.worldTemplateGroupsTableName} ` +
      "ADD COLUMN display_name_translations_json TEXT NOT NULL DEFAULT '{}'"
  )
  db.exec(
    `UPDATE ${deps.worldTemplateGroupsTableName} ` +
      "SET display_name_translations_json = json_object('en-US', display_name)"
  )
  db.exec(
    `ALTER TABLE ${deps.worldTemplatePlacementsTableName} ` +
      "ADD COLUMN nickname_translations_json TEXT NOT NULL DEFAULT '{}'"
  )
  db.exec(
    `UPDATE ${deps.worldTemplatePlacementsTableName} ` +
      'SET nickname_translations_json = CASE ' +
      "WHEN length(trim(nickname)) > 0 THEN json_object('en-US', nickname) " +
      "ELSE '{}' END"
  )
  db.pragma('user_version = 10')
}
