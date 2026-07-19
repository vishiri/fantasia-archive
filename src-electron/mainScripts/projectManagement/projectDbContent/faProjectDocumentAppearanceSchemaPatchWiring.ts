import type { I_faProjectDbExec } from 'app/types/I_faProjectDbSchemaDdl'

import { buildFaProjectOptionalHexColorCheckSql } from '../functions/faProjectOptionalHexColorCheckSql'
import {
  FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN,
  FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN,
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

const FA_PROJECT_DOCUMENT_NULLABLE_HEX_COLOR_CHECK = (columnName: string): string => {
  return (
    `${columnName} TEXT CHECK ${buildFaProjectOptionalHexColorCheckSql(columnName, true)}`
  )
}

/**
 * Idempotent v1 patch: adds nullable document appearance color columns when missing.
 */
export function applyFaProjectDocumentAppearanceSchemaPatch (db: I_faProjectDbExec): void {
  const columnNames = readFaProjectTableColumnNames(db, FA_PROJECT_TABLE_DOCUMENTS)
  addFaProjectDocumentsColumnIfMissing(
    db,
    columnNames,
    FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN,
    FA_PROJECT_DOCUMENT_NULLABLE_HEX_COLOR_CHECK(FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN)
  )
  addFaProjectDocumentsColumnIfMissing(
    db,
    columnNames,
    FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN,
    FA_PROJECT_DOCUMENT_NULLABLE_HEX_COLOR_CHECK(FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN)
  )
}
