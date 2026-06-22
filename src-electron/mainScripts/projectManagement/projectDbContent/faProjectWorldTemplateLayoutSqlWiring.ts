import type Database from 'better-sqlite3'

import {
  FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS
} from '../functions/faProjectDbSchemaDdl'

export function deleteFaProjectWorldTemplateGroupsForWorld (
  db: Database,
  worldId: string
): void {
  db.prepare(
    `DELETE FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS} WHERE world_id = ?`
  ).run(worldId)
}

export function deleteFaProjectWorldTemplatePlacementsForWorld (
  db: Database,
  worldId: string
): void {
  db.prepare(
    `DELETE FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} WHERE world_id = ?`
  ).run(worldId)
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
