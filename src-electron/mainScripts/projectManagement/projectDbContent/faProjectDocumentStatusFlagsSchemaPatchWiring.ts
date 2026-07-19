import type { I_faProjectDbExec } from 'app/types/I_faProjectDbSchemaDdl'

import {
  FA_PROJECT_DOCUMENT_IS_DEAD_COLUMN,
  FA_PROJECT_DOCUMENT_IS_FINISHED_COLUMN,
  FA_PROJECT_DOCUMENT_IS_MINOR_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS
} from '../functions/faProjectDbSchemaDdl'

type T_tableInfoRow = {
  name: string
}

function readFaProjectTableColumnNames (
  db: I_faProjectDbExec,
  tableName: string
): Set<string> {
  const rows = (db.pragma(`table_info(${tableName})`) as T_tableInfoRow[] | undefined) ?? []
  return new Set(rows.map((row) => row.name))
}

function addFaProjectDocumentsColumnIfMissing (
  db: I_faProjectDbExec,
  columnNames: Set<string>,
  columnName: string,
  ddlFragment: string
): void {
  if (columnNames.has(columnName)) {
    return
  }
  db.exec(`ALTER TABLE ${FA_PROJECT_TABLE_DOCUMENTS} ADD COLUMN ${ddlFragment}`)
  columnNames.add(columnName)
}

/**
 * Idempotent v3 patch: adds documents status flag columns when missing.
 */
export function applyFaProjectDocumentStatusFlagsSchemaPatch (db: I_faProjectDbExec): void {
  const columnNames = readFaProjectTableColumnNames(db, FA_PROJECT_TABLE_DOCUMENTS)
  const booleanFlagDdl = (column: string): string => {
    return `${column} INTEGER NOT NULL DEFAULT 0 CHECK (${column} IN (0, 1))`
  }
  addFaProjectDocumentsColumnIfMissing(
    db,
    columnNames,
    FA_PROJECT_DOCUMENT_IS_FINISHED_COLUMN,
    booleanFlagDdl(FA_PROJECT_DOCUMENT_IS_FINISHED_COLUMN)
  )
  addFaProjectDocumentsColumnIfMissing(
    db,
    columnNames,
    FA_PROJECT_DOCUMENT_IS_MINOR_COLUMN,
    booleanFlagDdl(FA_PROJECT_DOCUMENT_IS_MINOR_COLUMN)
  )
  addFaProjectDocumentsColumnIfMissing(
    db,
    columnNames,
    FA_PROJECT_DOCUMENT_IS_DEAD_COLUMN,
    booleanFlagDdl(FA_PROJECT_DOCUMENT_IS_DEAD_COLUMN)
  )
}
