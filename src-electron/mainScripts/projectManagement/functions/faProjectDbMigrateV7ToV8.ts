import type { I_faProjectDbExecWithPragma } from 'app/types/I_faProjectDbSchemaDdl'

/**
 * Schema v8: per-locale document template title translations JSON on document_templates.
 */
export function migrateFaProjectSchemaV7ToV8 (
  db: I_faProjectDbExecWithPragma,
  deps: {
    documentTemplatesTableName: string
  }
): void {
  db.exec(
    `ALTER TABLE ${deps.documentTemplatesTableName} ` +
      "ADD COLUMN title_translations_json TEXT NOT NULL DEFAULT '{}'"
  )
  db.exec(
    `UPDATE ${deps.documentTemplatesTableName} ` +
      "SET title_translations_json = json_object('en-US', display_name)"
  )
  db.pragma('user_version = 8')
}
