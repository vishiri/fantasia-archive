import type { I_faProjectDbExec } from 'app/types/I_faProjectDbSchemaDdl'
import { FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY } from 'app/types/I_faDocumentTreeOrderNumber'

import {
  FA_PROJECT_DOCUMENT_TREE_ORDER_NUMBER_COLUMN,
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
 * Idempotent v4 patch: adds documents.tree_order_number when missing.
 */
export function applyFaProjectDocumentTreeOrderNumberSchemaPatch (db: I_faProjectDbExec): void {
  const columnNames = readFaProjectTableColumnNames(db, FA_PROJECT_TABLE_DOCUMENTS)
  addFaProjectDocumentsColumnIfMissing(
    db,
    columnNames,
    FA_PROJECT_DOCUMENT_TREE_ORDER_NUMBER_COLUMN,
    `${FA_PROJECT_DOCUMENT_TREE_ORDER_NUMBER_COLUMN} INTEGER NOT NULL DEFAULT ${FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY}`
  )
}
