import type Database from 'better-sqlite3'

import {
  FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS
} from '../functions/faProjectDbSchemaDdl'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import { moveFaProjectDocumentInHierarchy } from './faProjectHierarchyTreeDocumentsWiring'
import {
  FA_PROJECT_HIERARCHY_DOCUMENT_ENTITY_LABEL,
  faProjectHierarchyParentTargetContainsDocument,
  listFaProjectHierarchyDirectChildDocumentRows,
  listFaProjectHierarchyDocumentChildrenRows
} from './faProjectHierarchyTreeSqlWiring'

type T_deleteDocumentRow = {
  id: string
  tree_custom_sort_order: number
  tree_parent_document_id: string | null
  tree_placement_id: string | null
}

type T_directChildRow = ReturnType<typeof listFaProjectHierarchyDirectChildDocumentRows>[number]

/**
 * Reparents direct child documents into the deleted document's sibling bucket before delete.
 * Prevents ON DELETE CASCADE from removing nested rows when a parent document is deleted.
 */
export function promoteFaProjectDocumentChildrenBeforeDelete (
  db: Database,
  documentId: string
): void {
  const existingRow = db
    .prepare(
      `SELECT id, ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN}, ` +
      `${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN}, ` +
      `${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN} ` +
      `FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`
    )
    .get(documentId) as T_deleteDocumentRow | undefined
  if (existingRow === undefined) {
    throw new FaProjectContentNotFoundError(
      FA_PROJECT_HIERARCHY_DOCUMENT_ENTITY_LABEL,
      documentId
    )
  }
  if (existingRow.tree_placement_id === null) {
    reparentFaProjectDocumentChildrenBeforeUnplacedDelete(db, documentId)
    return
  }
  const childRows = listDirectChildRowsExceptSelf(db, documentId)
  if (childRows.length === 0) {
    return
  }
  const placementId = existingRow.tree_placement_id
  const samePlacementChildren = childRows.filter((row) => {
    return row.tree_placement_id === placementId
  })
  const outsidePlacementChildren = childRows.filter((row) => {
    return row.tree_placement_id !== placementId
  })
  if (samePlacementChildren.length > 0) {
    promoteSamePlacementChildrenIntoDeletedSlot(db, existingRow, samePlacementChildren)
  }
  if (outsidePlacementChildren.length > 0) {
    reparentDocumentChildRowsBeforeParentDelete(db, outsidePlacementChildren)
  }
}

function listDirectChildRowsExceptSelf (
  db: Database,
  documentId: string
): T_directChildRow[] {
  return listFaProjectHierarchyDirectChildDocumentRows(db, documentId)
    .filter((row) => row.id !== documentId)
}

function promoteSamePlacementChildrenIntoDeletedSlot (
  db: Database,
  existingRow: T_deleteDocumentRow,
  samePlacementChildren: T_directChildRow[]
): void {
  const placementId = existingRow.tree_placement_id
  if (placementId === null) {
    return
  }
  const documentId = existingRow.id
  const parentTargetContainsDocument = faProjectHierarchyParentTargetContainsDocument(
    db,
    documentId,
    existingRow.tree_parent_document_id
  )
  const targetParentDocumentId = parentTargetContainsDocument
    ? null
    : existingRow.tree_parent_document_id
  const deletedSortOrder = existingRow.tree_custom_sort_order
  const siblingRows = listFaProjectHierarchyDocumentChildrenRows(
    db,
    placementId,
    targetParentDocumentId
  )
  const maxSortOrder = siblingRows.reduce((max, row) => {
    return Math.max(max, row.tree_custom_sort_order)
  }, -1)

  const runPromote = db.transaction(() => {
    moveFaProjectDocumentInHierarchy(db, {
      documentId,
      targetParentDocumentId,
      targetSortOrder: maxSortOrder + 1
    })
    let insertSortOrder = deletedSortOrder
    for (const childRow of samePlacementChildren) {
      moveFaProjectDocumentInHierarchy(db, {
        documentId: childRow.id,
        targetParentDocumentId,
        targetSortOrder: insertSortOrder
      })
      insertSortOrder += 1
    }
  })
  runPromote()
}

function reparentFaProjectDocumentChildrenBeforeUnplacedDelete (
  db: Database,
  documentId: string
): void {
  const childRows = listDirectChildRowsExceptSelf(db, documentId)
  if (childRows.length === 0) {
    return
  }
  reparentDocumentChildRowsBeforeParentDelete(db, childRows)
}

function reparentDocumentChildRowsBeforeParentDelete (
  db: Database,
  childRows: T_directChildRow[]
): void {
  const clearParentStmt = db.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET ${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} = NULL, ` +
      'updated_at_ms = ? WHERE id = ?'
  )
  const runReparent = db.transaction(() => {
    for (const childRow of childRows) {
      const childPlacementId = childRow.tree_placement_id
      if (childPlacementId === null) {
        const nowMs = Date.now()
        clearParentStmt.run(nowMs, childRow.id)
        continue
      }
      const rootRows = listFaProjectHierarchyDocumentChildrenRows(db, childPlacementId, null)
      const maxSortOrder = rootRows.reduce((max, row) => {
        return Math.max(max, row.tree_custom_sort_order)
      }, -1)
      moveFaProjectDocumentInHierarchy(db, {
        documentId: childRow.id,
        targetParentDocumentId: null,
        targetSortOrder: maxSortOrder + 1
      })
    }
  })
  runReparent()
}
