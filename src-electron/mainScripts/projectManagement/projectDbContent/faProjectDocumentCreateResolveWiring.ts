import type Database from 'better-sqlite3'

import {
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS,
  FA_PROJECT_TABLE_WORLDS
} from '../functions/faProjectDbSchemaDdl'
import { assertFaProjectNamedEntityExists } from './faProjectContentNamedEntitySqlWiring'
import { readFaProjectDocumentSiblingMaxSortOrder } from './faProjectDocumentsSqlWiring'

const WORLD_SPEC = {
  entityLabel: 'World',
  tableName: FA_PROJECT_TABLE_WORLDS
}

const TEMPLATE_SPEC = {
  entityLabel: 'Document template',
  tableName: FA_PROJECT_TABLE_DOCUMENT_TEMPLATES
}

export function validateFaProjectDocumentForeignKeys (
  db: Database,
  worldId: string,
  templateId: string | null | undefined
): void {
  assertFaProjectNamedEntityExists(db, WORLD_SPEC, worldId)
  if (templateId !== undefined && templateId !== null) {
    assertFaProjectNamedEntityExists(db, TEMPLATE_SPEC, templateId)
  }
}

export function resolveFaProjectDocumentPlacementId (
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

export function resolveFaProjectDocumentSortOrderForCreate (
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
