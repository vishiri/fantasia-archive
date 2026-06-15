import type Database from 'better-sqlite3'

import {
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLD_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLDS
} from '../functions/faProjectDbSchemaDdl'
import {
  mapFaProjectDocumentTemplateRow,
  mapFaProjectWorldRow
} from '../functions/faProjectContentRowMap'
import {
  assertFaProjectDocumentTemplateExists
} from './faProjectDocumentTemplatesSqlWiring'
import {
  assertFaProjectNamedEntityExists
} from './faProjectContentNamedEntitySqlWiring'
import type {
  I_faProjectDocumentTemplateWorldListResult,
  I_faProjectWorldDocumentTemplateListResult
} from 'app/types/I_faProjectContentLinksDomain'
import type {
  I_faSqlDocumentTemplateRow,
  I_faSqlWorldRow
} from 'app/types/I_faProjectContentRowMap'

const WORLD_SPEC = {
  entityLabel: 'World',
  tableName: FA_PROJECT_TABLE_WORLDS
}

const SQL_SELECT_DOCUMENT_TEMPLATE_COLUMNS =
  't.id, t.display_name, t.sort_order, t.world_appendix, t.icon, t.created_at_ms, t.updated_at_ms'

export function linkFaProjectWorldDocumentTemplate (
  db: Database,
  worldId: string,
  documentTemplateId: string
): void {
  assertFaProjectNamedEntityExists(db, WORLD_SPEC, worldId)
  assertFaProjectDocumentTemplateExists(db, documentTemplateId)
  db.prepare(
    'INSERT OR IGNORE INTO ' + FA_PROJECT_TABLE_WORLD_DOCUMENT_TEMPLATES +
      ' (world_id, document_template_id) VALUES (?, ?)'
  ).run(
    worldId,
    documentTemplateId
  )
}

export function unlinkFaProjectWorldDocumentTemplate (
  db: Database,
  worldId: string,
  documentTemplateId: string
): void {
  db.prepare(
    'DELETE FROM ' + FA_PROJECT_TABLE_WORLD_DOCUMENT_TEMPLATES +
      ' WHERE world_id = ? AND document_template_id = ?'
  ).run(
    worldId,
    documentTemplateId
  )
}

export function listFaProjectDocumentTemplatesForWorld (
  db: Database,
  worldId: string
): I_faProjectWorldDocumentTemplateListResult {
  assertFaProjectNamedEntityExists(db, WORLD_SPEC, worldId)
  const rows = db
    .prepare(
      'SELECT ' + SQL_SELECT_DOCUMENT_TEMPLATE_COLUMNS + ' ' +
        'FROM ' + FA_PROJECT_TABLE_DOCUMENT_TEMPLATES + ' t ' +
        'INNER JOIN ' + FA_PROJECT_TABLE_WORLD_DOCUMENT_TEMPLATES + ' wdt ' +
        'ON wdt.document_template_id = t.id ' +
        'WHERE wdt.world_id = ? ' +
        'ORDER BY t.sort_order ASC, t.created_at_ms ASC, t.id ASC'
    )
    .all(worldId) as I_faSqlDocumentTemplateRow[]
  return { items: rows.map(mapFaProjectDocumentTemplateRow) }
}

export function listFaProjectWorldsForDocumentTemplate (
  db: Database,
  documentTemplateId: string
): I_faProjectDocumentTemplateWorldListResult {
  assertFaProjectDocumentTemplateExists(db, documentTemplateId)
  const rows = db
    .prepare(
      'SELECT w.id, w.display_name, w.color, w.color_pallete, w.sort_order, w.created_at_ms, w.updated_at_ms ' +
        'FROM ' + FA_PROJECT_TABLE_WORLDS + ' w ' +
        'INNER JOIN ' + FA_PROJECT_TABLE_WORLD_DOCUMENT_TEMPLATES + ' wdt ' +
        'ON wdt.world_id = w.id ' +
        'WHERE wdt.document_template_id = ? ' +
        'ORDER BY w.sort_order ASC, w.created_at_ms ASC, w.id ASC'
    )
    .all(documentTemplateId) as I_faSqlWorldRow[]
  return { items: rows.map(mapFaProjectWorldRow) }
}
