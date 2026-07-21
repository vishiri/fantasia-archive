import type Database from 'better-sqlite3'

import {
  FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN,
  FA_PROJECT_DOCUMENT_EXTRA_CLASSES_COLUMN,
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
import {
  resolveFaProjectDocumentBooleanFlagsForCreateInput,
  resolveFaProjectDocumentBooleanFlagsForUpdate
} from '../functions/faProjectDocumentBooleanFlagsSql'
import {
  resolveFaProjectDocumentTreeOrderNumberForCreateInput,
  resolveFaProjectDocumentTreeOrderNumberForUpdate
} from '../functions/faProjectDocumentTreeOrderNumberSql'
import {
  resolveFaProjectDocumentExtraClassesForCreateInput,
  resolveFaProjectDocumentExtraClassesForUpdate
} from '../functions/faProjectDocumentExtraClassesSql'
import {
  resolveFaProjectDocumentAppearanceColorsForCreate,
  resolveFaProjectDocumentAppearanceColorsForUpdate
} from './faProjectDocumentAppearanceColorPersistWiring'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import {
  resolveFaProjectDocumentPlacementId,
  resolveFaProjectDocumentSortOrderForCreate,
  validateFaProjectDocumentForeignKeys
} from './faProjectDocumentCreateResolveWiring'
import { getFaProjectDocumentById } from './faProjectDocumentsQueryWiring'
import { promoteFaProjectDocumentChildrenBeforeDelete } from './faProjectDocumentDeleteWiring'
import {
  resolveFaProjectDocumentIdForCreate,
  validateDocumentParentForeignKey
} from './faProjectDocumentCreateWiring'
import { buildFaProjectDocumentSelectSql } from './faProjectDocumentsSqlWiring'
import type {
  I_faProjectDocument,
  I_faProjectDocumentCreateInput,
  I_faProjectDocumentPatch
} from 'app/types/I_faProjectDocumentDomain'
import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'

const DOCUMENT_ENTITY_LABEL = 'Document'

function assertDocumentRow (
  row: I_faSqlProjectDocumentRow | undefined,
  id: string
): I_faSqlProjectDocumentRow {
  if (row === undefined) {
    throw new FaProjectContentNotFoundError(DOCUMENT_ENTITY_LABEL, id)
  }
  return row
}

export function createFaProjectDocument (
  db: Database,
  input: I_faProjectDocumentCreateInput
): I_faProjectDocument {
  const templateId = input.templateId ?? null
  validateFaProjectDocumentForeignKeys(db, input.worldId, templateId)
  const parentDocumentId = input.parentDocumentId ?? null
  validateDocumentParentForeignKey(db, parentDocumentId)
  const placementId = resolveFaProjectDocumentPlacementId(
    db,
    input.worldId,
    templateId,
    input.placementId
  )
  const sortOrder = resolveFaProjectDocumentSortOrderForCreate(
    db,
    placementId,
    parentDocumentId,
    input.sortOrder
  )
  const { documentBackgroundColor, documentTextColor } =
    resolveFaProjectDocumentAppearanceColorsForCreate(input)
  const {
    isCategory,
    isDead,
    isFinished,
    isMinor
  } = resolveFaProjectDocumentBooleanFlagsForCreateInput(input)
  const treeOrderNumber = resolveFaProjectDocumentTreeOrderNumberForCreateInput(input)
  const extraClasses = resolveFaProjectDocumentExtraClassesForCreateInput(input)
  const nowMs = Date.now()
  const id = resolveFaProjectDocumentIdForCreate(db, input.id)
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_DOCUMENTS} ` +
      `(id, world_id, template_id, ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN}, ` +
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
      `${FA_PROJECT_DOCUMENT_EXTRA_CLASSES_COLUMN}, ` +
      'created_at_ms, updated_at_ms) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    id,
    input.worldId,
    templateId,
    placementId,
    parentDocumentId,
    sortOrder,
    input.displayName,
    documentTextColor,
    documentBackgroundColor,
    isCategory,
    isFinished,
    isMinor,
    isDead,
    treeOrderNumber,
    extraClasses,
    nowMs,
    nowMs
  )
  return getFaProjectDocumentById(db, id)
}

export function updateFaProjectDocument (
  db: Database,
  id: string,
  patch: I_faProjectDocumentPatch
): I_faProjectDocument {
  const existingRow = assertDocumentRow(
    db
      .prepare(`${buildFaProjectDocumentSelectSql()} WHERE id = ?`)
      .get(id) as I_faSqlProjectDocumentRow | undefined,
    id
  )
  const nextWorldId = patch.worldId ?? existingRow.world_id
  const nextTemplateId = patch.templateId !== undefined
    ? patch.templateId
    : existingRow.template_id
  validateFaProjectDocumentForeignKeys(db, nextWorldId, nextTemplateId)
  const nextPlacementId = patch.placementId !== undefined
    ? patch.placementId
    : resolveFaProjectDocumentPlacementId(
      db,
      nextWorldId,
      nextTemplateId,
      existingRow.tree_placement_id
    )
  const nextParentDocumentId = patch.parentDocumentId !== undefined
    ? patch.parentDocumentId
    : existingRow.tree_parent_document_id
  const nextSortOrder = patch.sortOrder ?? existingRow.tree_custom_sort_order
  const nextDisplayName = patch.displayName ?? existingRow.display_name
  const { documentBackgroundColor: nextDocumentBackgroundColor, documentTextColor: nextDocumentTextColor } =
    resolveFaProjectDocumentAppearanceColorsForUpdate(patch, existingRow)
  const {
    isCategory: nextIsCategory,
    isDead: nextIsDead,
    isFinished: nextIsFinished,
    isMinor: nextIsMinor
  } = resolveFaProjectDocumentBooleanFlagsForUpdate(patch, existingRow)
  const nextTreeOrderNumber = resolveFaProjectDocumentTreeOrderNumberForUpdate(patch, existingRow)
  const nextExtraClasses = resolveFaProjectDocumentExtraClassesForUpdate(patch, existingRow)
  const nowMs = Date.now()
  db.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET world_id = ?, template_id = ?, ` +
      `${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN} = ?, ` +
      'display_name = ?, ' +
      `${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_IS_CATEGORY_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_IS_FINISHED_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_IS_MINOR_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_IS_DEAD_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_TREE_ORDER_NUMBER_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_EXTRA_CLASSES_COLUMN} = ?, ` +
      'updated_at_ms = ? WHERE id = ?'
  ).run(
    nextWorldId,
    nextTemplateId,
    nextPlacementId,
    nextParentDocumentId,
    nextSortOrder,
    nextDisplayName,
    nextDocumentTextColor,
    nextDocumentBackgroundColor,
    nextIsCategory,
    nextIsFinished,
    nextIsMinor,
    nextIsDead,
    nextTreeOrderNumber,
    nextExtraClasses,
    nowMs,
    id
  )
  return getFaProjectDocumentById(db, id)
}

export function deleteFaProjectDocument (db: Database, id: string): void {
  promoteFaProjectDocumentChildrenBeforeDelete(db, id)
  const result = db
    .prepare(`DELETE FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE id = ?`)
    .run(id)
  if (result.changes === 0) {
    throw new FaProjectContentNotFoundError(DOCUMENT_ENTITY_LABEL, id)
  }
}

export function setFaProjectDocumentWorld (
  db: Database,
  documentId: string,
  worldId: string
): I_faProjectDocument {
  return updateFaProjectDocument(db, documentId, { worldId })
}

export function setFaProjectDocumentTemplate (
  db: Database,
  documentId: string,
  templateId: string | null
): I_faProjectDocument {
  return updateFaProjectDocument(db, documentId, { templateId })
}

export { getFaProjectDocumentById, listFaProjectDocuments } from './faProjectDocumentsQueryWiring'
