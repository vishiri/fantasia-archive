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
  FA_PROJECT_HIERARCHY_DOCUMENT_ENTITY_LABEL,
  listFaProjectHierarchyDocumentChildrenRows,
  mapFaProjectHierarchyDocumentChildRow
} from './faProjectHierarchyTreeSqlWiring'
import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeReindexDocumentSiblingsInput
} from 'app/types/I_faProjectHierarchyTreeDomain'

type T_placementRow = {
  id: string
  world_id: string
  document_template_id: string
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

function compactFaProjectHierarchyDocumentSiblingSortOrders (
  db: Database,
  placementId: string,
  parentDocumentId: string | null
): void {
  const rows = listFaProjectHierarchyDocumentChildrenRows(db, placementId, parentDocumentId)
  const nowMs = Date.now()
  const updateStmt = db.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET ${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN} = ?, updated_at_ms = ? WHERE id = ?`
  )
  const runCompact = db.transaction(() => {
    rows.forEach((row, index) => {
      updateStmt.run(index, nowMs, row.id)
    })
  })
  runCompact()
}

/**
 * Applies full sibling bucket order from hierarchy tree drag-and-drop.
 */
export function reindexFaProjectHierarchyDocumentSiblings (
  db: Database,
  input: I_faProjectHierarchyTreeReindexDocumentSiblingsInput
): I_faProjectHierarchyTreeDocumentChild {
  readFaProjectPlacementRow(db, input.placementId)
  assertFaProjectHierarchySamePlacementParent(db, input.placementId, input.parentDocumentId)
  assertFaProjectHierarchyNoAncestorCycle(
    db,
    input.movedDocumentId,
    input.parentDocumentId
  )
  const existingRows = listFaProjectHierarchyDocumentChildrenRows(
    db,
    input.placementId,
    input.parentDocumentId
  )
  const existingIds = new Set(existingRows.map((row) => row.id))
  const orderedUniqueIds = input.orderedDocumentIds.filter((id, index, ids) => {
    return ids.indexOf(id) === index
  })
  if (orderedUniqueIds.length === 0) {
    throw new Error('orderedDocumentIds must include at least one document id')
  }
  for (const documentId of orderedUniqueIds) {
    if (!existingIds.has(documentId) && documentId !== input.movedDocumentId) {
      throw new FaProjectContentNotFoundError(
        FA_PROJECT_HIERARCHY_DOCUMENT_ENTITY_LABEL,
        documentId
      )
    }
  }
  const movedExistingRow = db
    .prepare(
      `SELECT id, ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN}, ` +
      `${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} ` +
      `FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`
    )
    .get(input.movedDocumentId) as {
      id: string
      tree_placement_id: string | null
      tree_parent_document_id: string | null
    } | undefined
  if (movedExistingRow === undefined) {
    throw new FaProjectContentNotFoundError(
      FA_PROJECT_HIERARCHY_DOCUMENT_ENTITY_LABEL,
      input.movedDocumentId
    )
  }
  if (movedExistingRow.tree_placement_id !== input.placementId) {
    throw new Error('Moved document must belong to the same template placement')
  }
  const previousParentDocumentId = movedExistingRow.tree_parent_document_id
  if (previousParentDocumentId === input.parentDocumentId) {
    for (const row of existingRows) {
      if (!orderedUniqueIds.includes(row.id)) {
        throw new Error('orderedDocumentIds must include every sibling in the parent bucket')
      }
    }
  }
  const nowMs = Date.now()
  const updateStmt = db.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET ${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN} = ?, ` +
      'updated_at_ms = ? WHERE id = ?'
  )
  const runReindex = db.transaction(() => {
    orderedUniqueIds.forEach((documentId, sortOrder) => {
      updateStmt.run(input.parentDocumentId, sortOrder, nowMs, documentId)
    })
  })
  runReindex()
  compactFaProjectHierarchyDocumentSiblingSortOrders(
    db,
    input.placementId,
    input.parentDocumentId
  )
  if (previousParentDocumentId !== input.parentDocumentId) {
    compactFaProjectHierarchyDocumentSiblingSortOrders(
      db,
      input.placementId,
      previousParentDocumentId
    )
  }
  const updatedRow = listFaProjectHierarchyDocumentChildrenRows(
    db,
    input.placementId,
    input.parentDocumentId
  ).find((row) => row.id === input.movedDocumentId)
  if (updatedRow === undefined) {
    throw new FaProjectContentNotFoundError(
      FA_PROJECT_HIERARCHY_DOCUMENT_ENTITY_LABEL,
      input.movedDocumentId
    )
  }
  return mapFaProjectHierarchyDocumentChildRow(db, updatedRow)
}
