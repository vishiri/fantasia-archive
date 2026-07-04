import type {
  I_faProjectDbExec,
  I_faProjectDocumentsHierarchySchemaPatchDeps
} from 'app/types/I_faProjectDbSchemaDdl'

type T_tableInfoRow = {
  name: string
}

function readFaProjectTableColumnNames (
  db: I_faProjectDbExec,
  tableName: string
): Set<string> {
  const rows = db.pragma(`table_info(${tableName})`) as T_tableInfoRow[]
  return new Set(rows.map((row) => row.name))
}

function renameFaProjectDocumentTreeLegacyColumnIfPresent (
  db: I_faProjectDbExec,
  deps: I_faProjectDocumentsHierarchySchemaPatchDeps,
  columnNames: Set<string>,
  legacyColumnName: string,
  nextColumnName: string
): void {
  if (!columnNames.has(legacyColumnName) || columnNames.has(nextColumnName)) {
    return
  }
  db.exec(
    `ALTER TABLE ${deps.documentsTableName} RENAME COLUMN ${legacyColumnName} TO ${nextColumnName}`
  )
  columnNames.delete(legacyColumnName)
  columnNames.add(nextColumnName)
}

function addFaProjectDocumentsColumnIfMissing (
  db: I_faProjectDbExec,
  deps: I_faProjectDocumentsHierarchySchemaPatchDeps,
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

function renameFaProjectDocumentTreeLegacyColumnsIfPresent (
  db: I_faProjectDbExec,
  deps: I_faProjectDocumentsHierarchySchemaPatchDeps,
  columnNames: Set<string>
): void {
  renameFaProjectDocumentTreeLegacyColumnIfPresent(
    db,
    deps,
    columnNames,
    deps.legacyPlacementIdColumn,
    deps.treePlacementIdColumn
  )
  renameFaProjectDocumentTreeLegacyColumnIfPresent(
    db,
    deps,
    columnNames,
    deps.legacyParentDocumentIdColumn,
    deps.treeParentDocumentIdColumn
  )
  renameFaProjectDocumentTreeLegacyColumnIfPresent(
    db,
    deps,
    columnNames,
    deps.legacySortOrderColumn,
    deps.treeCustomSortOrderColumn
  )
}

function readFaProjectDocumentTreeSortColumnExisted (
  deps: I_faProjectDocumentsHierarchySchemaPatchDeps,
  columnNames: Set<string>
): boolean {
  return columnNames.has(deps.treeCustomSortOrderColumn) ||
    columnNames.has(deps.legacySortOrderColumn)
}

/**
 * Factory for idempotent v1 documents hierarchy column patch (level-1 pure wiring).
 */
export function createApplyFaProjectDocumentsHierarchySchemaPatch (
  deps: I_faProjectDocumentsHierarchySchemaPatchDeps
): (db: I_faProjectDbExec) => void {
  return function applyFaProjectDocumentsHierarchySchemaPatch (db: I_faProjectDbExec): void {
    const columnNames = readFaProjectTableColumnNames(db, deps.documentsTableName)
    const sortOrderColumnExisted = readFaProjectDocumentTreeSortColumnExisted(deps, columnNames)

    renameFaProjectDocumentTreeLegacyColumnsIfPresent(db, deps, columnNames)

    addFaProjectDocumentsColumnIfMissing(
      db,
      deps,
      columnNames,
      deps.treePlacementIdColumn,
      `${deps.treePlacementIdColumn} TEXT REFERENCES ${deps.placementsTableName}(id) ON DELETE RESTRICT`
    )
    addFaProjectDocumentsColumnIfMissing(
      db,
      deps,
      columnNames,
      deps.treeParentDocumentIdColumn,
      `${deps.treeParentDocumentIdColumn} TEXT REFERENCES ${deps.documentsTableName}(id) ON DELETE CASCADE`
    )
    addFaProjectDocumentsColumnIfMissing(
      db,
      deps,
      columnNames,
      deps.treeCustomSortOrderColumn,
      `${deps.treeCustomSortOrderColumn} INTEGER NOT NULL DEFAULT 0`
    )

    const placementColumn = deps.treePlacementIdColumn
    const parentColumn = deps.treeParentDocumentIdColumn
    const sortColumn = deps.treeCustomSortOrderColumn

    db.exec(
      `UPDATE ${deps.documentsTableName} SET ${placementColumn} = (` +
        `SELECT p.id FROM ${deps.placementsTableName} p ` +
        'WHERE p.world_id = documents.world_id ' +
        'AND p.document_template_id = documents.template_id' +
        `) WHERE ${placementColumn} IS NULL AND template_id IS NOT NULL`
    )

    if (!sortOrderColumnExisted) {
      db.exec(
        'WITH ranked AS (' +
          'SELECT id, ROW_NUMBER() OVER (' +
          `PARTITION BY ${placementColumn}, ${parentColumn} ` +
          'ORDER BY created_at_ms ASC, id ASC' +
          ') - 1 AS new_sort ' +
          `FROM ${deps.documentsTableName}` +
          ') ' +
          `UPDATE ${deps.documentsTableName} SET ${sortColumn} = (` +
          'SELECT new_sort FROM ranked WHERE ranked.id = documents.id' +
          ')'
      )
    }

    db.exec(`DROP INDEX IF EXISTS ${deps.legacyPlacementParentSortIndex}`)
    db.exec(
      `CREATE INDEX IF NOT EXISTS ${deps.treePlacementParentSortIndex} ` +
        `ON ${deps.documentsTableName}(${placementColumn}, ${parentColumn}, ${sortColumn})`
    )
  }
}
