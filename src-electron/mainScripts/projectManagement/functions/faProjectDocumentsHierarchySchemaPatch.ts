import type { I_faProjectDbExec } from 'app/types/I_faProjectDbSchemaDdl'

type T_tableInfoRow = {
  name: string
}

type T_faProjectDocumentsHierarchySchemaPatchDeps = {
  documentsTableName: string
  placementsTableName: string
}

function readFaProjectTableColumnNames (
  db: I_faProjectDbExec,
  tableName: string
): Set<string> {
  const rows = db.pragma(`table_info(${tableName})`) as T_tableInfoRow[]
  return new Set(rows.map((row) => row.name))
}

function addFaProjectDocumentsColumnIfMissing (
  db: I_faProjectDbExec,
  deps: T_faProjectDocumentsHierarchySchemaPatchDeps,
  columnNames: Set<string>,
  columnName: string,
  ddlFragment: string
): void {
  if (columnNames.has(columnName)) {
    return
  }
  db.exec(`ALTER TABLE ${deps.documentsTableName} ADD COLUMN ${ddlFragment}`)
  columnNames.add(columnName)
}

/**
 * Factory for idempotent v1 documents hierarchy column patch (level-1 pure wiring).
 */
export function createApplyFaProjectDocumentsHierarchySchemaPatch (
  deps: T_faProjectDocumentsHierarchySchemaPatchDeps
): (db: I_faProjectDbExec) => void {
  return function applyFaProjectDocumentsHierarchySchemaPatch (db: I_faProjectDbExec): void {
    const columnNames = readFaProjectTableColumnNames(db, deps.documentsTableName)

    addFaProjectDocumentsColumnIfMissing(
      db,
      deps,
      columnNames,
      'placement_id',
      `placement_id TEXT REFERENCES ${deps.placementsTableName}(id) ON DELETE RESTRICT`
    )
    addFaProjectDocumentsColumnIfMissing(
      db,
      deps,
      columnNames,
      'parent_document_id',
      `parent_document_id TEXT REFERENCES ${deps.documentsTableName}(id) ON DELETE CASCADE`
    )
    addFaProjectDocumentsColumnIfMissing(
      db,
      deps,
      columnNames,
      'sort_order',
      'sort_order INTEGER NOT NULL DEFAULT 0'
    )

    db.exec(
      `UPDATE ${deps.documentsTableName} SET placement_id = (` +
        `SELECT p.id FROM ${deps.placementsTableName} p ` +
        'WHERE p.world_id = documents.world_id ' +
        'AND p.document_template_id = documents.template_id' +
        ') WHERE placement_id IS NULL AND template_id IS NOT NULL'
    )

    db.exec(
      'WITH ranked AS (' +
        'SELECT id, ROW_NUMBER() OVER (' +
        'PARTITION BY placement_id, parent_document_id ' +
        'ORDER BY created_at_ms ASC, id ASC' +
        ') - 1 AS new_sort ' +
        `FROM ${deps.documentsTableName}` +
        ') ' +
        `UPDATE ${deps.documentsTableName} SET sort_order = (` +
        'SELECT new_sort FROM ranked WHERE ranked.id = documents.id' +
        ')'
    )

    db.exec(
      'CREATE INDEX IF NOT EXISTS idx_documents_placement_parent_sort ' +
        `ON ${deps.documentsTableName}(placement_id, parent_document_id, sort_order)`
    )
  }
}
