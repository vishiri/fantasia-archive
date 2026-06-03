import type Database from 'better-sqlite3'

import {
  FA_PROJECT_TABLE_MEDIA,
  FA_PROJECT_TABLE_WORLD_MEDIA,
  FA_PROJECT_TABLE_WORLDS
} from '../functions/faProjectDbSchemaDdl'
import { mapFaProjectNamedEntityRow } from '../functions/faProjectContentRowMap'
import {
  assertFaProjectNamedEntityExists
} from './faProjectContentNamedEntitySqlWiring'
import type { I_faProjectWorldMediaListResult } from 'app/types/I_faProjectContentLinksDomain'
import type { I_faSqlNamedEntityRow } from 'app/types/I_faProjectContentRowMap'

const WORLD_SPEC = {
  entityLabel: 'World',
  tableName: FA_PROJECT_TABLE_WORLDS
}

const MEDIA_SPEC = {
  entityLabel: 'Media',
  tableName: FA_PROJECT_TABLE_MEDIA
}

export function linkFaProjectWorldMedia (
  db: Database,
  worldId: string,
  mediaId: string
): void {
  assertFaProjectNamedEntityExists(db, WORLD_SPEC, worldId)
  assertFaProjectNamedEntityExists(db, MEDIA_SPEC, mediaId)
  db.prepare(
    `INSERT OR IGNORE INTO ${FA_PROJECT_TABLE_WORLD_MEDIA} (world_id, media_id) VALUES (?, ?)`
  ).run(
    worldId,
    mediaId
  )
}

export function unlinkFaProjectWorldMedia (
  db: Database,
  worldId: string,
  mediaId: string
): void {
  db.prepare(
    `DELETE FROM ${FA_PROJECT_TABLE_WORLD_MEDIA} WHERE world_id = ? AND media_id = ?`
  ).run(
    worldId,
    mediaId
  )
}

export function listFaProjectMediaForWorld (
  db: Database,
  worldId: string
): I_faProjectWorldMediaListResult {
  assertFaProjectNamedEntityExists(db, WORLD_SPEC, worldId)
  const rows = db
    .prepare(
      'SELECT m.id, m.display_name, m.created_at_ms, m.updated_at_ms ' +
        'FROM ' + FA_PROJECT_TABLE_MEDIA + ' m ' +
        'INNER JOIN ' + FA_PROJECT_TABLE_WORLD_MEDIA + ' wm ON wm.media_id = m.id ' +
        'WHERE wm.world_id = ? ' +
        'ORDER BY m.display_name COLLATE NOCASE ASC, m.created_at_ms ASC'
    )
    .all(worldId) as I_faSqlNamedEntityRow[]
  return { items: rows.map(mapFaProjectNamedEntityRow) }
}
