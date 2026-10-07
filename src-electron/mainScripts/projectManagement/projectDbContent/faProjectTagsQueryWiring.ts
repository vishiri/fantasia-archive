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
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_TAGS
} from '../functions/faProjectDbSchemaDdl'
import {
  getFaProjectDocumentWorldIdForTags,
  getFaProjectTagRowById,
  mapFaProjectTagRow
} from './faProjectTagsSqlHelpersWiring'
import type {
  I_faProjectDocumentTagListResult,
  I_faProjectDocumentTagRef,
  I_faProjectListDocumentsUnderTagResult,
  I_faProjectListTagsWithDocumentCountsForWorldResult,
  I_faProjectTag,
  I_faProjectTagDocumentChild,
  I_faProjectTagListResult,
  I_faProjectTagWithDocumentCount
} from 'app/types/I_faProjectTagDomain'
import type { I_faSqlTagRow } from 'app/types/I_faProjectTagDomain'

interface I_faSqlTagCountRow {
  id: string
  name: string
  category_count: number
  document_count: number
}

function mapFaProjectTagWithDocumentCountsRow (
  row: I_faSqlTagCountRow
): I_faProjectTagWithDocumentCount {
  const id = row.id
  const name = row.name
  const categoryCount = Number(row.category_count) || 0
  const documentCount = Number(row.document_count) || 0
  return {
    id,
    name,
    categoryCount,
    documentCount
  }
}

interface I_faSqlDocumentTagRefRow {
  id: string
  name: string
}

function mapFaProjectDocumentTagRefRow (
  row: I_faSqlDocumentTagRefRow
): I_faProjectDocumentTagRef {
  const id = row.id
  const name = row.name
  return {
    id,
    name
  }
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
  created_at_ms: number
  template_icon: string | null
}

function mapFaProjectTagDocumentChildRow (
  row: I_faSqlTagDocumentChildRow
): I_faProjectTagDocumentChild {
  const documentId = row.document_id
  const displayName = row.display_name
  const templateId = row.template_id
  const isCategory = row.is_category === 1
  const isFinished = row.is_finished === 1
  const isMinor = row.is_minor === 1
  const isDead = row.is_dead === 1
  const documentTextColor = row.document_text_color
  const documentBackgroundColor = row.document_background_color
  const treeOrderNumber = row.tree_order_number
  const extraClasses = row.extra_classes
  const sortOrder = row.sort_order
  const createdAtMs = row.created_at_ms
  const templateIcon = row.template_icon ?? ''
  return {
    documentId,
    createdAtMs,
    displayName,
    templateId,
    isCategory,
    isFinished,
    isMinor,
    isDead,
    documentTextColor,
    documentBackgroundColor,
    treeOrderNumber,
    extraClasses,
    sortOrder,
    templateIcon
  }
}

export function listFaProjectTagsForWorld (db: Database, worldId: string): I_faProjectTagListResult {
  const rows = db
    .prepare(
      `SELECT id, world_id, name, created_at_ms, updated_at_ms FROM ${FA_PROJECT_TABLE_TAGS} ` +
        'WHERE world_id = ? ORDER BY name COLLATE NOCASE ASC, created_at_ms ASC'
    )
    .all(worldId) as I_faSqlTagRow[]
  const items = rows.map(mapFaProjectTagRow)
  return {
    items
  }
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
    .all(worldId) as I_faSqlTagCountRow[]
  const items = rows.map(mapFaProjectTagWithDocumentCountsRow)
  return {
    items
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
  const items = rows.map(mapFaProjectDocumentTagRefRow)
  return {
    items
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
        'dt.sort_order AS sort_order, d.created_at_ms AS created_at_ms, tpl.icon AS template_icon ' +
        `FROM ${FA_PROJECT_TABLE_DOCUMENT_TAGS} dt ` +
        `INNER JOIN ${FA_PROJECT_TABLE_DOCUMENTS} d ON d.id = dt.document_id ` +
        `LEFT JOIN ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} tpl ON tpl.id = d.template_id ` +
        'WHERE dt.tag_id = ? ' +
        'ORDER BY dt.sort_order ASC, d.display_name COLLATE NOCASE ASC, d.created_at_ms ASC, d.id ASC'
    )
    .all(tagId) as I_faSqlTagDocumentChildRow[]
  const items = rows.map(mapFaProjectTagDocumentChildRow)
  return { items }
}

export function getFaProjectTagById (db: Database, tagId: string): I_faProjectTag {
  return mapFaProjectTagRow(getFaProjectTagRowById(db, tagId))
}
