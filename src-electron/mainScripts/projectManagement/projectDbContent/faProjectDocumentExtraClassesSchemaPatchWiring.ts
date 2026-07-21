import type { I_faProjectDbExec } from 'app/types/I_faProjectDbSchemaDdl'

import {
  FA_PROJECT_DOCUMENT_EXTRA_CLASSES_COLUMN,
  FA_PROJECT_DOCUMENT_EXTRA_CLASSES_MAX_LENGTH,
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
 * Idempotent v5 patch: adds documents.extra_classes when missing.
 */
export function applyFaProjectDocumentExtraClassesSchemaPatch (db: I_faProjectDbExec): void {
  const columnNames = readFaProjectTableColumnNames(db, FA_PROJECT_TABLE_DOCUMENTS)
  addFaProjectDocumentsColumnIfMissing(
    db,
    columnNames,
    FA_PROJECT_DOCUMENT_EXTRA_CLASSES_COLUMN,
    `${FA_PROJECT_DOCUMENT_EXTRA_CLASSES_COLUMN} TEXT NOT NULL DEFAULT '' ` +
    `CHECK (length(${FA_PROJECT_DOCUMENT_EXTRA_CLASSES_COLUMN}) <= ${FA_PROJECT_DOCUMENT_EXTRA_CLASSES_MAX_LENGTH})`
  )
}
