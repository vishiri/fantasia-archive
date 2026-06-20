import type Database from 'better-sqlite3'

import {
  mapFaProjectWorldTemplateGroupRow,
  mapFaProjectWorldTemplatePlacementForProjectSettingsRow
} from '../functions/faProjectContentRowMap'
import {
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS
} from '../functions/faProjectDbSchemaDdl'
import type { I_faProjectWorldTemplateLayoutForProjectSettings } from 'app/types/I_faProjectWorldTemplateLayoutDomain'
import type {
  I_faSqlWorldTemplateGroupRow,
  I_faSqlWorldTemplatePlacementJoinRow
} from 'app/types/I_faProjectContentRowMap'

function listFaProjectWorldTemplateDocumentCounts (
  db: Database,
  worldId: string
): Record<string, number> {
  const rows = db
    .prepare(
      `SELECT template_id, COUNT(*) AS c FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        'WHERE world_id = ? AND template_id IS NOT NULL GROUP BY template_id'
    )
    .all(worldId) as Array<{ template_id: string, c: number }>
  const counts: Record<string, number> = {}
  for (const row of rows) {
    counts[row.template_id] = row.c
  }
  return counts
}

export function listFaProjectWorldTemplateLayoutForProjectSettings (
  db: Database,
  worldId: string
): I_faProjectWorldTemplateLayoutForProjectSettings {
  const groupRows = db
    .prepare(
      'SELECT id, world_id, display_name, root_sort_order, created_at_ms, updated_at_ms ' +
        `FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS} WHERE world_id = ? ` +
        'ORDER BY root_sort_order ASC, created_at_ms ASC, id ASC'
    )
    .all(worldId) as I_faSqlWorldTemplateGroupRow[]

  const placementRows = db
    .prepare(
      'SELECT p.id, p.world_id, p.document_template_id, p.group_id, p.root_sort_order, ' +
        'p.group_sort_order, p.nickname, p.created_at_ms, p.updated_at_ms, ' +
        't.display_name, t.world_appendix, t.icon ' +
        `FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} p ` +
        `INNER JOIN ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} t ON t.id = p.document_template_id ` +
        'WHERE p.world_id = ? ' +
        'ORDER BY COALESCE(p.root_sort_order, p.group_sort_order) ASC, p.created_at_ms ASC, p.id ASC'
    )
    .all(worldId) as I_faSqlWorldTemplatePlacementJoinRow[]

  const documentCounts = listFaProjectWorldTemplateDocumentCounts(db, worldId)

  return {
    groups: groupRows.map(mapFaProjectWorldTemplateGroupRow),
    placements: placementRows.map((row) => {
      return mapFaProjectWorldTemplatePlacementForProjectSettingsRow(
        row,
        documentCounts[row.document_template_id] ?? 0
      )
    })
  }
}
