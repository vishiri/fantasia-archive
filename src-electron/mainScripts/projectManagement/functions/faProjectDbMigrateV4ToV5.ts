import type { I_faProjectDbExecWithPragma } from 'app/types/I_faProjectDbSchemaDdl'

/**
 * Schema v5: document_templates sort_order, world_appendix, and icon columns.
 */
export function migrateFaProjectSchemaV4ToV5 (db: I_faProjectDbExecWithPragma): void {
  db.exec(`
ALTER TABLE document_templates
  ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE document_templates
  ADD COLUMN world_appendix TEXT NOT NULL DEFAULT ''
  CHECK (length(world_appendix) <= 500);
ALTER TABLE document_templates
  ADD COLUMN icon TEXT NOT NULL DEFAULT ''
  CHECK (length(icon) <= 128);
CREATE INDEX IF NOT EXISTS idx_document_templates_sort_order
  ON document_templates(sort_order);
UPDATE document_templates
SET sort_order = (
  SELECT COUNT(*)
  FROM document_templates AS earlier
  WHERE earlier.created_at_ms < document_templates.created_at_ms
     OR (
       earlier.created_at_ms = document_templates.created_at_ms
       AND earlier.id < document_templates.id
     )
);
`)

  db.pragma('user_version = 5')
}
