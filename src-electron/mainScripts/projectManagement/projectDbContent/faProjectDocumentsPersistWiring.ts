import type Database from 'better-sqlite3'

import {
  FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN,
  FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS,
  FA_PROJECT_TABLE_WORLDS
} from '../functions/faProjectDbSchemaDdl'
import {
  resolveFaProjectDocumentAppearanceColorsForCreate,
  resolveFaProjectDocumentAppearanceColorsForUpdate
} from './faProjectDocumentAppearanceColorPersistWiring'
import { FaProjectContentNotFoundError } from './faProjectContentNotFoundError'
import {
  assertFaProjectNamedEntityExists
} from './faProjectContentNamedEntitySqlWiring'
import {
  buildFaProjectDocumentSelectSql,
  readFaProjectDocumentSiblingMaxSortOrder
} from './faProjectDocumentsSqlWiring'
import { getFaProjectDocumentById } from './faProjectDocumentsQueryWiring'
import { promoteFaProjectDocumentChildrenBeforeDelete } from './faProjectDocumentDeleteWiring'
import {
  resolveFaProjectDocumentIdForCreate,
  validateDocumentParentForeignKey
} from './faProjectDocumentCreateWiring'
import type {
  I_faProjectDocument,
  I_faProjectDocumentCreateInput,
  I_faProjectDocumentPatch
} from 'app/types/I_faProjectDocumentDomain'
import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'

const DOCUMENT_ENTITY_LABEL = 'Document'

const WORLD_SPEC = {
  entityLabel: 'World',
  tableName: FA_PROJECT_TABLE_WORLDS
}

const TEMPLATE_SPEC = {
  entityLabel: 'Document template',
  tableName: FA_PROJECT_TABLE_DOCUMENT_TEMPLATES
}

function assertDocumentRow (
  row: I_faSqlProjectDocumentRow | undefined,
  id: string
): I_faSqlProjectDocumentRow {
  if (row === undefined) {
    throw new FaProjectContentNotFoundError(DOCUMENT_ENTITY_LABEL, id)
  }
  return row
}

function validateDocumentForeignKeys (
  db: Database,
  worldId: string,
  templateId: string | null | undefined
): void {
  assertFaProjectNamedEntityExists(db, WORLD_SPEC, worldId)
  if (templateId !== undefined && templateId !== null) {
    assertFaProjectNamedEntityExists(db, TEMPLATE_SPEC, templateId)
  }
}

function resolveFaProjectDocumentPlacementId (
  db: Database,
  worldId: string,
  templateId: string | null,
  placementId: string | null | undefined
): string | null {
  if (placementId !== undefined && placementId !== null) {
    return placementId
  }
  if (templateId === null) {
    return null
  }
  const row = db
    .prepare(
      `SELECT id FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} ` +
        'WHERE world_id = ? AND document_template_id = ?'
    )
    .get(worldId, templateId) as { id: string } | undefined
  return row?.id ?? null
}

function resolveFaProjectDocumentSortOrderForCreate (
  db: Database,
  placementId: string | null,
  parentDocumentId: string | null,
  sortOrder: number | undefined
): number {
  if (sortOrder !== undefined) {
    return sortOrder
  }
  const maxSort = readFaProjectDocumentSiblingMaxSortOrder(db, placementId, parentDocumentId)
  return maxSort === null ? 0 : maxSort + 1
}

export function createFaProjectDocument (
  db: Database,
  input: I_faProjectDocumentCreateInput
): I_faProjectDocument {
  const templateId = input.templateId ?? null
  validateDocumentForeignKeys(db, input.worldId, templateId)
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
      'created_at_ms, updated_at_ms) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
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
  validateDocumentForeignKeys(db, nextWorldId, nextTemplateId)
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
  const nowMs = Date.now()
  db.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET world_id = ?, template_id = ?, ` +
      `${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN} = ?, ` +
      'display_name = ?, ' +
      `${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN} = ?, ` +
      `${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN} = ?, ` +
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
