import type Database from 'better-sqlite3'

import {
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS
} from '../functions/faProjectDbSchemaDdl'

export function deleteFaProjectWorldTemplateGroupById (
  db: Database,
  groupId: string
): void {
  db.prepare(
    `DELETE FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS} WHERE id = ?`
  ).run(groupId)
}

export function deleteFaProjectWorldTemplatePlacementById (
  db: Database,
  placementId: string
): void {
  db.prepare(
    `DELETE FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} WHERE id = ?`
  ).run(placementId)
}

/**
 * Deletes all documents anchored to a template placement (before placement row removal).
 */
export function deleteFaProjectDocumentsForPlacementId (
  db: Database,
  placementId: string
): void {
  db.prepare(
    `DELETE FROM ${FA_PROJECT_TABLE_DOCUMENTS} WHERE placement_id = ?`
  ).run(placementId)
}

export function listFaProjectWorldTemplateGroupIdsForWorld (
  db: Database,
  worldId: string
): string[] {
  const rows = db
    .prepare(
      `SELECT id FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS} WHERE world_id = ?`
    )
    .all(worldId) as Array<{ id: string }>
  return rows.map((row) => row.id)
}

export function listFaProjectWorldTemplatePlacementIdsForWorld (
  db: Database,
  worldId: string
): string[] {
  const rows = db
    .prepare(
      `SELECT id FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} WHERE world_id = ?`
    )
    .all(worldId) as Array<{ id: string }>
  return rows.map((row) => row.id)
}

export function updateFaProjectWorldTemplateGroupRow (
  db: Database,
  fields: {
    displayName: string
    displayNameTranslationsJson: string
    id: string
    rootSortOrder: number
    updatedAtMs: number
  }
): void {
  db.prepare(
    `UPDATE ${FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS} ` +
      'SET display_name = ?, display_name_translations_json = ?, root_sort_order = ?, updated_at_ms = ? ' +
      'WHERE id = ?'
  ).run(
    fields.displayName,
    fields.displayNameTranslationsJson,
    fields.rootSortOrder,
    fields.updatedAtMs,
    fields.id
  )
}

export function updateFaProjectWorldTemplatePlacementRow (
  db: Database,
  fields: {
    documentTemplateId: string
    groupId: string | null
    groupSortOrder: number | null
    id: string
    nickname: string
    nicknamePluralTranslationsJson: string
    nicknameSingularTranslationsJson: string
    rootSortOrder: number | null
    updatedAtMs: number
  }
): void {
  db.prepare(
    `UPDATE ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} ` +
      'SET document_template_id = ?, group_id = ?, root_sort_order = ?, group_sort_order = ?, ' +
      'nickname = ?, nickname_translations_json = ?, nickname_singular_translations_json = ?, updated_at_ms = ? ' +
      'WHERE id = ?'
  ).run(
    fields.documentTemplateId,
    fields.groupId,
    fields.rootSortOrder,
    fields.groupSortOrder,
    fields.nickname,
    fields.nicknamePluralTranslationsJson,
    fields.nicknameSingularTranslationsJson,
    fields.updatedAtMs,
    fields.id
  )
}

export function insertFaProjectWorldTemplateGroupRow (
  db: Database,
  fields: {
    createdAtMs: number
    displayName: string
    displayNameTranslationsJson: string
    id: string
    rootSortOrder: number
    updatedAtMs: number
    worldId: string
  }
): void {
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS} ` +
      '(id, world_id, display_name, display_name_translations_json, root_sort_order, ' +
      'created_at_ms, updated_at_ms) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    fields.id,
    fields.worldId,
    fields.displayName,
    fields.displayNameTranslationsJson,
    fields.rootSortOrder,
    fields.createdAtMs,
    fields.updatedAtMs
  )
}

export function insertFaProjectWorldTemplatePlacementRow (
  db: Database,
  fields: {
    createdAtMs: number
    documentTemplateId: string
    groupId: string | null
    groupSortOrder: number | null
    id: string
    nickname: string
    nicknamePluralTranslationsJson: string
    nicknameSingularTranslationsJson: string
    rootSortOrder: number | null
    updatedAtMs: number
    worldId: string
  }
): void {
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} ` +
      '(id, world_id, document_template_id, group_id, root_sort_order, group_sort_order, ' +
      'nickname, nickname_translations_json, nickname_singular_translations_json, created_at_ms, updated_at_ms) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    fields.id,
    fields.worldId,
    fields.documentTemplateId,
    fields.groupId,
    fields.rootSortOrder,
    fields.groupSortOrder,
    fields.nickname,
    fields.nicknamePluralTranslationsJson,
    fields.nicknameSingularTranslationsJson,
    fields.createdAtMs,
    fields.updatedAtMs
  )
}
