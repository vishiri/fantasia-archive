import type Database from 'better-sqlite3'

import {
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLD_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLDS
} from '../functions/faProjectDbSchemaDdl'
import {
  mapFaProjectNamedEntityRow,
  mapFaProjectWorldRow
} from '../functions/faProjectContentRowMap'
import {
  assertFaProjectNamedEntityExists
} from './faProjectContentNamedEntitySqlWiring'
import type {
  I_faProjectDocumentTemplateWorldListResult,
  I_faProjectWorldDocumentTemplateListResult
} from 'app/types/I_faProjectContentLinksDomain'
import type {
  I_faSqlNamedEntityRow,
  I_faSqlWorldRow
} from 'app/types/I_faProjectContentRowMap'

const WORLD_SPEC = {
  entityLabel: 'World',
  tableName: FA_PROJECT_TABLE_WORLDS
}

const DOCUMENT_TEMPLATE_SPEC = {
  entityLabel: 'Document template',
  tableName: FA_PROJECT_TABLE_DOCUMENT_TEMPLATES
}

export function linkFaProjectWorldDocumentTemplate (
  db: Database,
  worldId: string,
  documentTemplateId: string
): void {
  assertFaProjectNamedEntityExists(db, WORLD_SPEC, worldId)
  assertFaProjectNamedEntityExists(db, DOCUMENT_TEMPLATE_SPEC, documentTemplateId)
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
      'SELECT t.id, t.display_name, t.created_at_ms, t.updated_at_ms ' +
        'FROM ' + FA_PROJECT_TABLE_DOCUMENT_TEMPLATES + ' t ' +
        'INNER JOIN ' + FA_PROJECT_TABLE_WORLD_DOCUMENT_TEMPLATES + ' wdt ' +
        'ON wdt.document_template_id = t.id ' +
        'WHERE wdt.world_id = ? ' +
        'ORDER BY t.display_name COLLATE NOCASE ASC, t.created_at_ms ASC'
    )
    .all(worldId) as I_faSqlNamedEntityRow[]
  return { items: rows.map(mapFaProjectNamedEntityRow) }
}

export function listFaProjectWorldsForDocumentTemplate (
  db: Database,
  documentTemplateId: string
): I_faProjectDocumentTemplateWorldListResult {
  assertFaProjectNamedEntityExists(db, DOCUMENT_TEMPLATE_SPEC, documentTemplateId)
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
