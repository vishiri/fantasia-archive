import type { I_faProjectDbExecWithPragma } from 'app/types/I_faProjectDbSchemaDdl'

/**
 * Schema v3: restores world_document_templates for files that lost the junction at v2.
 */
export function migrateFaProjectSchemaV2ToV3 (db: I_faProjectDbExecWithPragma): void {
  db.exec(`
CREATE TABLE IF NOT EXISTS world_document_templates (
  world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  document_template_id TEXT NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  PRIMARY KEY (world_id, document_template_id)
);
CREATE INDEX IF NOT EXISTS idx_world_document_templates_document_template_id
  ON world_document_templates(document_template_id);
`)
  db.pragma('user_version = 3')
}
