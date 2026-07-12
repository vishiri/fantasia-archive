import type Database from 'better-sqlite3'

import {
  FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN,
  FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS
} from '../functions/faProjectDbSchemaDdl'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import type { I_faProjectHierarchyTreeDocumentChild } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'

export const FA_PROJECT_HIERARCHY_DOCUMENT_ENTITY_LABEL = 'Document'

const placementColumn = FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN
const parentColumn = FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN
const sortColumn = FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN

export function readFaProjectDocumentHasChildren (
  db: Database,
  documentId: string
): boolean {
  const row = db
    .prepare(
      `SELECT 1 AS ok FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        `WHERE ${parentColumn} = ? LIMIT 1`
    )
    .get(documentId) as { ok: number } | undefined
  return row !== undefined
}

export function listFaProjectHierarchyDocumentChildrenRows (
  db: Database,
  placementId: string,
  parentDocumentId: string | null
): I_faSqlProjectDocumentRow[] {
  return db
    .prepare(
      `SELECT id, world_id, template_id, ${placementColumn}, ${parentColumn}, ${sortColumn}, ` +
        `display_name, ${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN}, ` +
        `${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN}, created_at_ms, updated_at_ms ` +
        `FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        `WHERE ${placementColumn} = ? AND ` +
        `(${parentColumn} IS ? OR (${parentColumn} IS NULL AND ? IS NULL)) ` +
        `ORDER BY ${sortColumn} ASC, display_name COLLATE NOCASE ASC, created_at_ms ASC, id ASC`
    )
    .all(placementId, parentDocumentId, parentDocumentId) as I_faSqlProjectDocumentRow[]
}

export function listFaProjectHierarchyDirectChildDocumentRows (
  db: Database,
  parentDocumentId: string
): I_faSqlProjectDocumentRow[] {
  return db
    .prepare(
      `SELECT id, world_id, template_id, ${placementColumn}, ${parentColumn}, ${sortColumn}, ` +
        `display_name, ${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN}, ` +
        `${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN}, created_at_ms, updated_at_ms ` +
        `FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        `WHERE ${parentColumn} = ? ` +
        `ORDER BY ${sortColumn} ASC, display_name COLLATE NOCASE ASC, created_at_ms ASC, id ASC`
    )
    .all(parentDocumentId) as I_faSqlProjectDocumentRow[]
}

export function mapFaProjectHierarchyDocumentChildRow (
  db: Database,
  row: I_faSqlProjectDocumentRow
): I_faProjectHierarchyTreeDocumentChild {
  return {
    documentBackgroundColor: row.document_background_color,
    documentTextColor: row.document_text_color,
    id: row.id,
    displayName: row.display_name,
    placementId: row.tree_placement_id ?? '',
    parentDocumentId: row.tree_parent_document_id,
    sortOrder: row.tree_custom_sort_order,
    hasChildren: readFaProjectDocumentHasChildren(db, row.id)
  }
}

export function assertFaProjectHierarchySamePlacementParent (
  db: Database,
  placementId: string,
  parentDocumentId: string | null
): void {
  if (parentDocumentId === null) {
    return
  }
  const parentRow = db
    .prepare(
      `SELECT ${placementColumn} FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`
    )
    .get(parentDocumentId) as { [key: string]: string | null } | undefined
  if (parentRow === undefined) {
    throw new FaProjectContentNotFoundError(
      FA_PROJECT_HIERARCHY_DOCUMENT_ENTITY_LABEL,
      parentDocumentId
    )
  }
  if (parentRow[placementColumn] !== placementId) {
    throw new Error('Parent document must belong to the same template placement')
  }
}

export function assertFaProjectHierarchyNoAncestorCycle (
  db: Database,
  documentId: string,
  candidateParentId: string | null
): void {
  if (candidateParentId === null) {
    return
  }
  let cursor: string | null = candidateParentId
  while (cursor !== null) {
    if (cursor === documentId) {
      throw new Error('Document cannot be moved under its own descendant')
    }
    const row = db
      .prepare(`SELECT ${parentColumn} FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`)
      .get(cursor) as { [key: string]: string | null } | undefined
    if (row === undefined) {
      break
    }
    cursor = row[parentColumn] ?? null
  }
}

export function shiftFaProjectHierarchySiblingSortOrders (
  db: Database,
  placementId: string,
  parentDocumentId: string | null,
  fromSortOrder: number,
  delta: number,
  excludeDocumentId?: string
): void {
  if (delta === 0) {
    return
  }
  const stmt = db.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET ${sortColumn} = ${sortColumn} + ?, updated_at_ms = ? ` +
      `WHERE ${placementColumn} = ? AND ` +
      `(${parentColumn} IS ? OR (${parentColumn} IS NULL AND ? IS NULL)) AND ` +
      `${sortColumn} >= ?` +
      (excludeDocumentId === undefined ? '' : ' AND id <> ?')
  )
  const nowMs = Date.now()
  if (excludeDocumentId === undefined) {
    stmt.run(delta, nowMs, placementId, parentDocumentId, parentDocumentId, fromSortOrder)
    return
  }
  stmt.run(
    delta,
    nowMs,
    placementId,
    parentDocumentId,
    parentDocumentId,
    fromSortOrder,
    excludeDocumentId
  )
}

export function collectFaProjectHierarchyAncestorDocumentIds (
  db: Database,
  parentDocumentId: string | null
): string[] {
  const ancestors: string[] = []
  let cursor = parentDocumentId
  while (cursor !== null) {
    ancestors.unshift(cursor)
    const row = db
      .prepare(`SELECT ${parentColumn} FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`)
      .get(cursor) as { [key: string]: string | null } | undefined
    if (row === undefined) {
      break
    }
    cursor = row[parentColumn] ?? null
  }
  return ancestors
}
