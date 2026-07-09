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
  listFaProjectHierarchyDirectChildDocumentRows,
  listFaProjectHierarchyDocumentChildrenRows
} from './faProjectHierarchyTreeSqlWiring'

type T_deleteDocumentRow = {
  id: string
  tree_custom_sort_order: number
  tree_parent_document_id: string | null
  tree_placement_id: string | null
}

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
    return
  }
  const childRows = listFaProjectHierarchyDirectChildDocumentRows(db, documentId)
  if (childRows.length === 0) {
    return
  }
  const placementId = existingRow.tree_placement_id
  const targetParentDocumentId = existingRow.tree_parent_document_id
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
    for (const childRow of childRows) {
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
