import type Database from 'better-sqlite3'

import {
  FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN,
  FA_PROJECT_DOCUMENT_IS_CATEGORY_COLUMN,
  FA_PROJECT_DOCUMENT_IS_DEAD_COLUMN,
  FA_PROJECT_DOCUMENT_IS_FINISHED_COLUMN,
  FA_PROJECT_DOCUMENT_IS_MINOR_COLUMN,
  FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_ORDER_NUMBER_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS
} from '../functions/faProjectDbSchemaDdl'

export function buildFaProjectDocumentSelectSql (): string {
  return (
    `SELECT id, world_id, template_id, ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN}, ` +
    `${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN}, ` +
    `${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN}, ` +
    'display_name, ' +
    `${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN}, ` +
    `${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN}, ` +
    `${FA_PROJECT_DOCUMENT_IS_CATEGORY_COLUMN}, ` +
    `${FA_PROJECT_DOCUMENT_IS_FINISHED_COLUMN}, ` +
    `${FA_PROJECT_DOCUMENT_IS_MINOR_COLUMN}, ` +
    `${FA_PROJECT_DOCUMENT_IS_DEAD_COLUMN}, ` +
    `${FA_PROJECT_DOCUMENT_TREE_ORDER_NUMBER_COLUMN}, ` +
    'created_at_ms, updated_at_ms ' +
    `FROM ${FA_PROJECT_TABLE_DOCUMENTS}`
  )
}

export function readFaProjectDocumentSiblingMaxSortOrder (
  db: Database,
  placementId: string | null,
  parentDocumentId: string | null
): number | null {
  if (placementId === null) {
    return null
  }
  const row = db
    .prepare(
      `SELECT MAX(${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN}) AS max_sort FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        `WHERE ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN} = ? AND ` +
        `(${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} IS ? OR ` +
        `(${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} IS NULL AND ? IS NULL))`
    )
    .get(placementId, parentDocumentId, parentDocumentId) as { max_sort: number | null } | undefined
  return row?.max_sort ?? null
}
