import type Database from 'better-sqlite3'

import { FA_PROJECT_TABLE_DOCUMENT_TAGS } from '../functions/faProjectDbSchemaDdl'

/**
 * Inserts document↔tag rows. Keeps prior under-tag sort_order for existing links;
 * new links append after MAX(sort_order) for that tag.
 */
export function insertFaProjectDocumentTagMemberships (input: {
  db: Database
  documentId: string
  previousOrder: Map<string, number>
  resolvedIds: readonly string[]
}): Array<{
  previousSortOrder: number | null
  tagId: string
  writtenSortOrder: number
}> {
  const insertStmt = input.db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_DOCUMENT_TAGS} (document_id, tag_id, sort_order) VALUES (?, ?, ?)`
  )
  const maxOrderUnderTagStmt = input.db.prepare(
    `SELECT COALESCE(MAX(sort_order), -1) AS m FROM ${FA_PROJECT_TABLE_DOCUMENT_TAGS} WHERE tag_id = ?`
  )
  const writtenPairs: Array<{
    previousSortOrder: number | null
    tagId: string
    writtenSortOrder: number
  }> = []
  for (const tagId of input.resolvedIds) {
    const previousSortOrder = input.previousOrder.get(tagId)
    let writtenSortOrder: number
    if (previousSortOrder !== undefined) {
      writtenSortOrder = previousSortOrder
    } else {
      const maxRow = maxOrderUnderTagStmt.get(tagId) as { m: number }
      writtenSortOrder = maxRow.m + 1
    }
    insertStmt.run(input.documentId, tagId, writtenSortOrder)
    writtenPairs.push({
      tagId,
      writtenSortOrder,
      previousSortOrder: previousSortOrder ?? null
    })
  }
  return writtenPairs
}
