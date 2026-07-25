import type Database from 'better-sqlite3'

import {
  FA_PROJECT_DOCUMENT_IS_CATEGORY_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS
} from '../functions/faProjectDbSchemaDdl'

/**
 * Per-placement document vs category counts for a world (same split as workspace hierarchy tree).
 */
export function listFaProjectPlacementCategoryDocumentCounts (
  db: Database,
  worldId: string
): Map<string, { categoryCount: number, documentCount: number }> {
  const rows = db
    .prepare(
      `SELECT ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN} AS placement_id, ` +
        `${FA_PROJECT_DOCUMENT_IS_CATEGORY_COLUMN} AS is_category, COUNT(*) AS c ` +
        `FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        `WHERE world_id = ? AND ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN} IS NOT NULL ` +
        `GROUP BY ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN}, ${FA_PROJECT_DOCUMENT_IS_CATEGORY_COLUMN}`
    )
    .all(worldId) as Array<{
      placement_id: string
      is_category: number
      c: number
    }>

  const countsByPlacement = new Map<string, { categoryCount: number, documentCount: number }>()
  for (const row of rows) {
    const existing = countsByPlacement.get(row.placement_id) ?? {
      categoryCount: 0,
      documentCount: 0
    }
    if (row.is_category === 1) {
      existing.categoryCount = row.c
    } else {
      existing.documentCount = row.c
    }
    countsByPlacement.set(row.placement_id, existing)
  }
  return countsByPlacement
}
