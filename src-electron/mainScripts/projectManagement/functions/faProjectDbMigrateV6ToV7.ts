import type { I_faProjectDbMigrationExec } from 'app/types/I_faProjectDbSchemaDdl'

/**
 * Schema v7: optional per-world placement nickname on world_template_placements.
 */
export function migrateFaProjectSchemaV6ToV7 (
  db: I_faProjectDbMigrationExec,
  deps: {
    worldTemplatePlacementsTableName: string
  }
): void {
  db.exec(
    `ALTER TABLE ${deps.worldTemplatePlacementsTableName} ` +
      'ADD COLUMN nickname TEXT NOT NULL DEFAULT \'\''
  )
  db.pragma('user_version = 7')
}
