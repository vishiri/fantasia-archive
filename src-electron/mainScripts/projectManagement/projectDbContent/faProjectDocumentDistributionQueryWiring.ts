import type Database from 'better-sqlite3'

import {
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLDS,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS
} from '../functions/faProjectDbSchemaDdl'
import type {
  I_faProjectDocumentDistributionCountCell,
  I_faProjectDocumentDistributionResult,
  I_faProjectDocumentDistributionTemplateCategory,
  I_faProjectDocumentDistributionWorldSeries
} from 'app/types/I_faProjectDocumentLastOpenedDomain'

interface I_faSqlDistributionTemplateRow {
  template_id: string
  title_plural_translations_json: string
  icon: string
  sort_order: number
}

interface I_faSqlDistributionWorldRow {
  world_id: string
  display_name_translations_json: string
  color: string
  sort_order: number
}

interface I_faSqlDistributionCountRow {
  template_id: string
  world_id: string
  document_count: number
}

function mapFaProjectDocumentDistributionTemplateRow (
  row: I_faSqlDistributionTemplateRow
): I_faProjectDocumentDistributionTemplateCategory {
  const templateId = row.template_id
  const titlePluralTranslationsJson = row.title_plural_translations_json
  const icon = row.icon
  const sortOrder = row.sort_order
  return {
    templateId,
    titlePluralTranslationsJson,
    icon,
    sortOrder
  }
}

function mapFaProjectDocumentDistributionWorldRow (
  row: I_faSqlDistributionWorldRow
): I_faProjectDocumentDistributionWorldSeries {
  const worldId = row.world_id
  const displayNameTranslationsJson = row.display_name_translations_json
  const color = row.color
  const sortOrder = row.sort_order
  return {
    worldId,
    displayNameTranslationsJson,
    color,
    sortOrder
  }
}

function mapFaProjectDocumentDistributionCountRow (
  row: I_faSqlDistributionCountRow
): I_faProjectDocumentDistributionCountCell {
  const templateId = row.template_id
  const worldId = row.world_id
  const documentCount = Number(row.document_count)
  return {
    templateId,
    worldId,
    documentCount
  }
}

/**
 * Aggregates template/world document counts for Project overview stacked chart.
 */
export function listFaProjectDocumentDistribution (
  db: Database
): I_faProjectDocumentDistributionResult {
  const templateRows = db
    .prepare(
      'SELECT DISTINCT dt.id AS template_id, ' +
        'dt.title_translations_json AS title_plural_translations_json, ' +
        'dt.icon AS icon, ' +
        'dt.sort_order AS sort_order ' +
        `FROM ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} dt ` +
        `INNER JOIN ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} wtp ` +
        'ON wtp.document_template_id = dt.id ' +
        'ORDER BY dt.sort_order ASC, dt.created_at_ms ASC, dt.id ASC'
    )
    .all() as I_faSqlDistributionTemplateRow[]

  const worldRows = db
    .prepare(
      'SELECT id AS world_id, ' +
        'display_name_translations_json AS display_name_translations_json, ' +
        'color AS color, sort_order AS sort_order ' +
        `FROM ${FA_PROJECT_TABLE_WORLDS} ` +
        'ORDER BY sort_order ASC, created_at_ms ASC, id ASC'
    )
    .all() as I_faSqlDistributionWorldRow[]

  const countRows = db
    .prepare(
      'SELECT template_id AS template_id, world_id AS world_id, ' +
        'COUNT(*) AS document_count ' +
        `FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        'WHERE template_id IS NOT NULL ' +
        'GROUP BY template_id, world_id'
    )
    .all() as I_faSqlDistributionCountRow[]

  const totalRow = db
    .prepare(`SELECT COUNT(*) AS total_count FROM ${FA_PROJECT_TABLE_DOCUMENTS}`)
    .get() as { total_count: number }

  const documentTemplateTotalRow = db
    .prepare(
      `SELECT COUNT(*) AS template_count FROM ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES}`
    )
    .get() as { template_count: number }

  const templates = templateRows.map(mapFaProjectDocumentDistributionTemplateRow)
  const worlds = worldRows.map(mapFaProjectDocumentDistributionWorldRow)
  const counts = countRows.map(mapFaProjectDocumentDistributionCountRow)
  const totalDocumentCount = Number(totalRow.total_count)
  const documentTemplateTotalCount = Number(documentTemplateTotalRow.template_count)

  return {
    counts,
    documentTemplateTotalCount,
    templates,
    totalDocumentCount,
    worlds
  }
}
