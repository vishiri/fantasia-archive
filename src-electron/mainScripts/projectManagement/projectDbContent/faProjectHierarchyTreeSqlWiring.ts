import type Database from 'better-sqlite3'

import { FA_PROJECT_TABLE_DOCUMENTS } from '../functions/faProjectDbSchemaDdl'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import type { I_faProjectHierarchyTreeDocumentChild } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'

export const FA_PROJECT_HIERARCHY_DOCUMENT_ENTITY_LABEL = 'Document'

export function readFaProjectDocumentHasChildren (
  db: Database,
  documentId: string
): boolean {
  const row = db
    .prepare(
      `SELECT 1 AS ok FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        'WHERE parent_document_id = ? LIMIT 1'
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
      'SELECT id, world_id, template_id, placement_id, parent_document_id, sort_order, ' +
        'display_name, created_at_ms, updated_at_ms ' +
        `FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        'WHERE placement_id = ? AND ' +
        '(parent_document_id IS ? OR (parent_document_id IS NULL AND ? IS NULL)) ' +
        'ORDER BY sort_order ASC, display_name COLLATE NOCASE ASC, created_at_ms ASC, id ASC'
    )
    .all(placementId, parentDocumentId, parentDocumentId) as I_faSqlProjectDocumentRow[]
}

export function mapFaProjectHierarchyDocumentChildRow (
  db: Database,
  row: I_faSqlProjectDocumentRow
): I_faProjectHierarchyTreeDocumentChild {
  return {
    id: row.id,
    displayName: row.display_name,
    placementId: row.placement_id ?? '',
    parentDocumentId: row.parent_document_id,
    sortOrder: row.sort_order,
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
      `SELECT placement_id FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`
    )
    .get(parentDocumentId) as { placement_id: string | null } | undefined
  if (parentRow === undefined) {
    throw new FaProjectContentNotFoundError(
      FA_PROJECT_HIERARCHY_DOCUMENT_ENTITY_LABEL,
      parentDocumentId
    )
  }
  if (parentRow.placement_id !== placementId) {
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
      .prepare(`SELECT parent_document_id FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`)
      .get(cursor) as { parent_document_id: string | null } | undefined
    if (row === undefined) {
      break
    }
    cursor = row.parent_document_id
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
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET sort_order = sort_order + ?, updated_at_ms = ? ` +
      'WHERE placement_id = ? AND ' +
      '(parent_document_id IS ? OR (parent_document_id IS NULL AND ? IS NULL)) AND ' +
      'sort_order >= ?' +
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
      .prepare(`SELECT parent_document_id FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`)
      .get(cursor) as { parent_document_id: string | null } | undefined
    if (row === undefined) {
      break
    }
    cursor = row.parent_document_id
  }
  return ancestors
}
