import type { I_faProjectDbExecWithPragma } from 'app/types/I_faProjectDbSchemaDdl'

/**
 * Schema v11: per-locale singular document template titles and placement nicknames.
 */
export function migrateFaProjectSchemaV10ToV11 (
  db: I_faProjectDbExecWithPragma,
  deps: {
    documentTemplatesTableName: string
    worldTemplatePlacementsTableName: string
  }
): void {
  db.exec(
    `ALTER TABLE ${deps.documentTemplatesTableName} ` +
      "ADD COLUMN title_singular_translations_json TEXT NOT NULL DEFAULT '{}'"
  )
  db.exec(
    `ALTER TABLE ${deps.worldTemplatePlacementsTableName} ` +
      "ADD COLUMN nickname_singular_translations_json TEXT NOT NULL DEFAULT '{}'"
  )
  db.pragma('user_version = 11')
}
