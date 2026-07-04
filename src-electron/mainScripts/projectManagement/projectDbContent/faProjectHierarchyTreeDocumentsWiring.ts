import type Database from 'better-sqlite3'

import {
  FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS
} from '../functions/faProjectDbSchemaDdl'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import {
  assertFaProjectHierarchyNoAncestorCycle,
  assertFaProjectHierarchySamePlacementParent,
  collectFaProjectHierarchyAncestorDocumentIds,
  FA_PROJECT_HIERARCHY_DOCUMENT_ENTITY_LABEL,
  listFaProjectHierarchyDocumentChildrenRows,
  mapFaProjectHierarchyDocumentChildRow,
  shiftFaProjectHierarchySiblingSortOrders
} from './faProjectHierarchyTreeSqlWiring'
import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeListPlacementChildrenInput,
  I_faProjectHierarchyTreeListPlacementChildrenResult,
  I_faProjectHierarchyTreeMoveDocumentInput,
  I_faProjectHierarchyTreeSearchHit,
  I_faProjectHierarchyTreeSearchResult
} from 'app/types/I_faProjectHierarchyTreeDomain'

type T_placementRow = {
  id: string
  world_id: string
  document_template_id: string
}

type T_moveExistingRow = {
  id: string
  tree_placement_id: string | null
  tree_parent_document_id: string | null
  tree_custom_sort_order: number
}

type T_searchRow = {
  id: string
  display_name: string
  tree_placement_id: string | null
  world_id: string
  tree_parent_document_id: string | null
}

function readFaProjectPlacementRow (
  db: Database,
  placementId: string
): T_placementRow {
  const row = db
    .prepare(
      `SELECT id, world_id, document_template_id FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} ` +
        'WHERE id = ?'
    )
    .get(placementId) as T_placementRow | undefined
  if (row === undefined) {
    throw new FaProjectContentNotFoundError('Template placement', placementId)
  }
  return row
}

/**
 * Lists direct child documents for a placement and optional parent document id.
 */
export function listFaProjectPlacementDocumentChildren (
  db: Database,
  input: I_faProjectHierarchyTreeListPlacementChildrenInput
): I_faProjectHierarchyTreeListPlacementChildrenResult {
  readFaProjectPlacementRow(db, input.placementId)
  const parentDocumentId = input.parentDocumentId ?? null
  assertFaProjectHierarchySamePlacementParent(db, input.placementId, parentDocumentId)
  const rows = listFaProjectHierarchyDocumentChildrenRows(db, input.placementId, parentDocumentId)
  const items = rows.map((row) => mapFaProjectHierarchyDocumentChildRow(db, row))
  return { items }
}

/**
 * Moves a document within the same template placement and reindexes sibling sort_order values.
 */
export function moveFaProjectDocumentInHierarchy (
  db: Database,
  input: I_faProjectHierarchyTreeMoveDocumentInput
): I_faProjectHierarchyTreeDocumentChild {
  const existingRow = db
    .prepare(
      `SELECT id, ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN}, ` +
      `${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN}, ` +
      `${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN} ` +
      `FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        'WHERE id = ?'
    )
    .get(input.documentId) as T_moveExistingRow | undefined
  if (existingRow === undefined) {
    throw new FaProjectContentNotFoundError(
      FA_PROJECT_HIERARCHY_DOCUMENT_ENTITY_LABEL,
      input.documentId
    )
  }
  if (existingRow.tree_placement_id === null) {
    throw new Error('Document is not anchored to a template placement')
  }
  const placementId = existingRow.tree_placement_id
  assertFaProjectHierarchySamePlacementParent(db, placementId, input.targetParentDocumentId)
  assertFaProjectHierarchyNoAncestorCycle(db, input.documentId, input.targetParentDocumentId)

  const runMove = db.transaction(() => {
    const oldParentId = existingRow.tree_parent_document_id
    const oldSortOrder = existingRow.tree_custom_sort_order
    shiftFaProjectHierarchySiblingSortOrders(
      db,
      placementId,
      oldParentId,
      oldSortOrder + 1,
      -1,
      input.documentId
    )
    shiftFaProjectHierarchySiblingSortOrders(
      db,
      placementId,
      input.targetParentDocumentId,
      input.targetSortOrder,
      1,
      input.documentId
    )
    const nowMs = Date.now()
    db.prepare(
      `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET ${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN} = ?, ` +
        'updated_at_ms = ? WHERE id = ?'
    ).run(
      input.targetParentDocumentId,
      input.targetSortOrder,
      nowMs,
      input.documentId
    )
  })
  runMove()

  const updatedRow = listFaProjectHierarchyDocumentChildrenRows(
    db,
    placementId,
    input.targetParentDocumentId
  ).find((row) => row.id === input.documentId)
  if (updatedRow === undefined) {
    throw new FaProjectContentNotFoundError(
      FA_PROJECT_HIERARCHY_DOCUMENT_ENTITY_LABEL,
      input.documentId
    )
  }
  return mapFaProjectHierarchyDocumentChildRow(db, updatedRow)
}

/**
 * Searches document display names and returns hits with ancestor document ids for reveal.
 */
export function searchFaProjectHierarchy (
  db: Database,
  query: string
): I_faProjectHierarchyTreeSearchResult {
  const trimmed = query.trim()
  if (trimmed.length === 0) {
    return {
      query: trimmed,
      hits: []
    }
  }
  const escaped = trimmed.replace(/[%_\\]/g, '\\$&')
  const pattern = `%${escaped}%`
  const rows = db
    .prepare(
      `SELECT id, display_name, ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN}, world_id, ` +
      `${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} ` +
        `FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        'WHERE display_name LIKE ? ESCAPE \'\\\' ' +
        `ORDER BY display_name COLLATE NOCASE ASC, ${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN} ASC, created_at_ms ASC, id ASC`
    )
    .all(pattern) as T_searchRow[]

  const hits: I_faProjectHierarchyTreeSearchHit[] = rows
    .filter((row) => row.tree_placement_id !== null)
    .map((row) => ({
      ancestorDocumentIds: collectFaProjectHierarchyAncestorDocumentIds(
        db,
        row.tree_parent_document_id
      ),
      displayName: row.display_name,
      documentId: row.id,
      placementId: row.tree_placement_id as string,
      worldId: row.world_id
    }))

  return {
    hits,
    query: trimmed
  }
}
