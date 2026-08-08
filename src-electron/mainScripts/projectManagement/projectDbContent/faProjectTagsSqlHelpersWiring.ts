import type Database from 'better-sqlite3'

import {
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TAGS,
  FA_PROJECT_TABLE_TAGS
} from '../functions/faProjectDbSchemaDdl'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import type { I_faProjectTag, I_faSqlTagRow } from 'app/types/I_faProjectTagDomain'

export const FA_PROJECT_TAG_ENTITY_LABEL = 'Tag'
export const FA_PROJECT_TAG_DOCUMENT_ENTITY_LABEL = 'Document'

export function mapFaProjectTagRow (row: I_faSqlTagRow): I_faProjectTag {
  return {
    id: row.id,
    worldId: row.world_id,
    name: row.name,
    createdAtMs: row.created_at_ms,
    updatedAtMs: row.updated_at_ms
  }
}

export function getFaProjectTagRowById (db: Database, tagId: string): I_faSqlTagRow {
  const row = db
    .prepare(
      `SELECT id, world_id, name, created_at_ms, updated_at_ms FROM ${FA_PROJECT_TABLE_TAGS} WHERE id = ?`
    )
    .get(tagId) as I_faSqlTagRow | undefined
  if (row === undefined) {
    throw new FaProjectContentNotFoundError(FA_PROJECT_TAG_ENTITY_LABEL, tagId)
  }
  return row
}

export function getFaProjectDocumentWorldIdForTags (db: Database, documentId: string): string {
  const row = db
    .prepare(`SELECT world_id FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`)
    .get(documentId) as { world_id: string } | undefined
  if (row === undefined) {
    throw new FaProjectContentNotFoundError(FA_PROJECT_TAG_DOCUMENT_ENTITY_LABEL, documentId)
  }
  return row.world_id
}

/**
 * Deletes tag rows that have zero document_tags memberships.
 */
export function deleteFaProjectEmptyTagsByIds (db: Database, tagIds: string[]): void {
  if (tagIds.length === 0) {
    return
  }
  const countStmt = db.prepare(
    `SELECT COUNT(*) AS c FROM ${FA_PROJECT_TABLE_DOCUMENT_TAGS} WHERE tag_id = ?`
  )
  const deleteStmt = db.prepare(`DELETE FROM ${FA_PROJECT_TABLE_TAGS} WHERE id = ?`)
  for (const tagId of tagIds) {
    const countRow = countStmt.get(tagId) as { c: number }
    if (countRow.c === 0) {
      deleteStmt.run(tagId)
    }
  }
}

/**
 * Lists tag ids currently linked to a document (before delete CASCADE).
 */
export function listFaProjectTagIdsForDocument (db: Database, documentId: string): string[] {
  const rows = db
    .prepare(`SELECT tag_id AS id FROM ${FA_PROJECT_TABLE_DOCUMENT_TAGS} WHERE document_id = ?`)
    .all(documentId) as Array<{ id: string }>
  return rows.map((row) => row.id)
}

export function deleteFaProjectTag (db: Database, tagId: string): void {
  getFaProjectTagRowById(db, tagId)
  db.prepare(`DELETE FROM ${FA_PROJECT_TABLE_DOCUMENT_TAGS} WHERE tag_id = ?`).run(tagId)
  db.prepare(`DELETE FROM ${FA_PROJECT_TABLE_TAGS} WHERE id = ?`).run(tagId)
}

export function findFaProjectTagIdByWorldAndNameNocase (
  db: Database,
  worldId: string,
  name: string
): string | null {
  const row = db
    .prepare(
      `SELECT id FROM ${FA_PROJECT_TABLE_TAGS} WHERE world_id = ? AND name = ? COLLATE NOCASE`
    )
    .get(worldId, name) as { id: string } | undefined
  return row?.id ?? null
}
