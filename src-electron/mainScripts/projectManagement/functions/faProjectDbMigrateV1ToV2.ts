import type { I_faProjectDbExecWithPragma } from 'app/types/I_faProjectDbSchemaDdl'

/**
 * Schema v2: drops legacy world_media junction table; world_document_templates stays.
 */
export function migrateFaProjectSchemaV1ToV2 (db: I_faProjectDbExecWithPragma): void {
  db.exec('DROP TABLE IF EXISTS world_media;')
  db.pragma('user_version = 2')
}
