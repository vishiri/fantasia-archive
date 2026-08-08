import type Database from 'better-sqlite3'

import {
  FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN,
  FA_PROJECT_DOCUMENT_EXTRA_CLASSES_COLUMN,
  FA_PROJECT_DOCUMENT_IS_CATEGORY_COLUMN,
  FA_PROJECT_DOCUMENT_IS_DEAD_COLUMN,
  FA_PROJECT_DOCUMENT_IS_FINISHED_COLUMN,
  FA_PROJECT_DOCUMENT_IS_MINOR_COLUMN,
  FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_ORDER_NUMBER_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TAGS,
  FA_PROJECT_TABLE_TAGS
} from '../functions/faProjectDbSchemaDdl'
import {
  getFaProjectDocumentWorldIdForTags,
  getFaProjectTagRowById,
  mapFaProjectTagRow
} from './faProjectTagsSqlHelpersWiring'
import type {
  I_faProjectDocumentTagListResult,
  I_faProjectListDocumentsUnderTagResult,
  I_faProjectListTagsWithDocumentCountsForWorldResult,
  I_faProjectTag,
  I_faProjectTagDocumentChild,
  I_faProjectTagListResult
} from 'app/types/I_faProjectTagDomain'
import type { I_faSqlTagRow } from 'app/types/I_faProjectTagDomain'

interface I_faSqlDocumentTagRefRow {
  id: string
  name: string
}

interface I_faSqlTagDocumentChildRow {
  document_id: string
  display_name: string
  template_id: string | null
  is_category: number
  is_finished: number
  is_minor: number
  is_dead: number
  document_text_color: string
  document_background_color: string
  tree_order_number: number
  extra_classes: string
  sort_order: number
}

export function listFaProjectTagsForWorld (db: Database, worldId: string): I_faProjectTagListResult {
  const rows = db
    .prepare(
      `SELECT id, world_id, name, created_at_ms, updated_at_ms FROM ${FA_PROJECT_TABLE_TAGS} ` +
        'WHERE world_id = ? ORDER BY name COLLATE NOCASE ASC, created_at_ms ASC'
    )
    .all(worldId) as I_faSqlTagRow[]
  return { items: rows.map(mapFaProjectTagRow) }
}

export function listFaProjectTagsWithDocumentCountsForWorld (
  db: Database,
  worldId: string
): I_faProjectListTagsWithDocumentCountsForWorldResult {
  const rows = db
    .prepare(
      'SELECT t.id AS id, t.name AS name, ' +
        `SUM(CASE WHEN d.${FA_PROJECT_DOCUMENT_IS_CATEGORY_COLUMN} = 1 THEN 1 ELSE 0 END) AS category_count, ` +
        `SUM(CASE WHEN d.id IS NOT NULL AND IFNULL(d.${FA_PROJECT_DOCUMENT_IS_CATEGORY_COLUMN}, 0) = 0 THEN 1 ELSE 0 END) AS document_count ` +
        `FROM ${FA_PROJECT_TABLE_TAGS} t ` +
        `LEFT JOIN ${FA_PROJECT_TABLE_DOCUMENT_TAGS} dt ON dt.tag_id = t.id ` +
        `LEFT JOIN ${FA_PROJECT_TABLE_DOCUMENTS} d ON d.id = dt.document_id ` +
        'WHERE t.world_id = ? ' +
        'GROUP BY t.id ' +
        'ORDER BY t.name COLLATE NOCASE ASC, t.created_at_ms ASC'
    )
    .all(worldId) as Array<{
      id: string
      name: string
      category_count: number
      document_count: number
    }>
  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      categoryCount: Number(row.category_count) || 0,
      documentCount: Number(row.document_count) || 0
    }))
  }
}

export function listFaProjectDocumentTags (
  db: Database,
  documentId: string
): I_faProjectDocumentTagListResult {
  getFaProjectDocumentWorldIdForTags(db, documentId)
  const rows = db
    .prepare(
      `SELECT t.id AS id, t.name AS name FROM ${FA_PROJECT_TABLE_TAGS} t ` +
        `INNER JOIN ${FA_PROJECT_TABLE_DOCUMENT_TAGS} dt ON dt.tag_id = t.id ` +
        'WHERE dt.document_id = ? ' +
        'ORDER BY t.name COLLATE NOCASE ASC'
    )
    .all(documentId) as I_faSqlDocumentTagRefRow[]
  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name
    }))
  }
}

export function listFaProjectDocumentsUnderTag (
  db: Database,
  tagId: string
): I_faProjectListDocumentsUnderTagResult {
  getFaProjectTagRowById(db, tagId)
  const rows = db
    .prepare(
      'SELECT d.id AS document_id, d.display_name AS display_name, d.template_id AS template_id, ' +
        `d.${FA_PROJECT_DOCUMENT_IS_CATEGORY_COLUMN} AS is_category, ` +
        `d.${FA_PROJECT_DOCUMENT_IS_FINISHED_COLUMN} AS is_finished, ` +
        `d.${FA_PROJECT_DOCUMENT_IS_MINOR_COLUMN} AS is_minor, ` +
        `d.${FA_PROJECT_DOCUMENT_IS_DEAD_COLUMN} AS is_dead, ` +
        `d.${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN} AS document_text_color, ` +
        `d.${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN} AS document_background_color, ` +
        `d.${FA_PROJECT_DOCUMENT_TREE_ORDER_NUMBER_COLUMN} AS tree_order_number, ` +
        `d.${FA_PROJECT_DOCUMENT_EXTRA_CLASSES_COLUMN} AS extra_classes, ` +
        'dt.sort_order AS sort_order ' +
        `FROM ${FA_PROJECT_TABLE_DOCUMENT_TAGS} dt ` +
        `INNER JOIN ${FA_PROJECT_TABLE_DOCUMENTS} d ON d.id = dt.document_id ` +
        'WHERE dt.tag_id = ? ' +
        'ORDER BY dt.sort_order ASC, d.display_name COLLATE NOCASE ASC'
    )
    .all(tagId) as I_faSqlTagDocumentChildRow[]
  const items: I_faProjectTagDocumentChild[] = rows.map((row) => ({
    documentId: row.document_id,
    displayName: row.display_name,
    templateId: row.template_id,
    isCategory: row.is_category === 1,
    isFinished: row.is_finished === 1,
    isMinor: row.is_minor === 1,
    isDead: row.is_dead === 1,
    documentTextColor: row.document_text_color,
    documentBackgroundColor: row.document_background_color,
    treeOrderNumber: row.tree_order_number,
    extraClasses: row.extra_classes,
    sortOrder: row.sort_order
  }))
  return { items }
}

export function getFaProjectTagById (db: Database, tagId: string): I_faProjectTag {
  return mapFaProjectTagRow(getFaProjectTagRowById(db, tagId))
}
