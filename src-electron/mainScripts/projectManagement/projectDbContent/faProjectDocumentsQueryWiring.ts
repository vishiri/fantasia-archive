import type Database from 'better-sqlite3'

import { mapFaProjectDocumentRow } from '../functions/faProjectContentRowMap'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import {
  buildFaProjectDocumentSelectSql
} from './faProjectDocumentsSqlWiring'
import { FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN } from '../functions/faProjectDbSchemaDdl'
import type {
  I_faProjectDocument,
  I_faProjectDocumentListFilter,
  I_faProjectDocumentListResult
} from 'app/types/I_faProjectDocumentDomain'
import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'

const DOCUMENT_ENTITY_LABEL = 'Document'

function assertDocumentRow (
  row: I_faSqlProjectDocumentRow | undefined,
  id: string
): I_faSqlProjectDocumentRow {
  if (row === undefined) {
    throw new FaProjectContentNotFoundError(DOCUMENT_ENTITY_LABEL, id)
  }
  return row
}

export function getFaProjectDocumentById (
  db: Database,
  id: string
): I_faProjectDocument {
  const row = db
    .prepare(`${buildFaProjectDocumentSelectSql()} WHERE id = ?`)
    .get(id) as I_faSqlProjectDocumentRow | undefined
  return mapFaProjectDocumentRow(assertDocumentRow(row, id))
}

export function listFaProjectDocuments (
  db: Database,
  filter?: I_faProjectDocumentListFilter
): I_faProjectDocumentListResult {
  const worldId = filter?.worldId
  const orderSql =
    `ORDER BY ${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN} ASC, ` +
    'display_name COLLATE NOCASE ASC, created_at_ms ASC'
  let rows: I_faSqlProjectDocumentRow[]
  if (worldId !== undefined) {
    rows = db
      .prepare(`${buildFaProjectDocumentSelectSql()} WHERE world_id = ? ${orderSql}`)
      .all(worldId) as I_faSqlProjectDocumentRow[]
  } else {
    rows = db
      .prepare(`${buildFaProjectDocumentSelectSql()} ${orderSql}`)
      .all() as I_faSqlProjectDocumentRow[]
  }
  return { items: rows.map(mapFaProjectDocumentRow) }
}
