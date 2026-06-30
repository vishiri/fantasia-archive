import type Database from 'better-sqlite3'

import { mapFaProjectWorldRow } from '../faProjectContentRowMap_manager'
import {
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS,
  FA_PROJECT_TABLE_WORLDS
} from '../functions/faProjectDbSchemaDdl'
import type { I_faProjectHierarchyTreeWorkspaceLayoutResult } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faSqlWorldRow } from 'app/types/I_faProjectContentRowMap'
import type {
  I_faSqlWorldTemplateGroupRow,
  I_faSqlWorldTemplatePlacementJoinRow
} from 'app/types/I_faProjectContentRowMap'

function readFaProjectPlacementHasTopLevelDocuments (
  db: Database,
  placementId: string
): boolean {
  const row = db
    .prepare(
      `SELECT 1 AS ok FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        'WHERE placement_id = ? AND parent_document_id IS NULL LIMIT 1'
    )
    .get(placementId) as { ok: number } | undefined
  return row !== undefined
}

function readFaProjectGroupHasPlacements (
  db: Database,
  groupId: string
): boolean {
  const row = db
    .prepare(
      `SELECT 1 AS ok FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} ` +
        'WHERE group_id = ? LIMIT 1'
    )
    .get(groupId) as { ok: number } | undefined
  return row !== undefined
}

/**
 * Lists all worlds with template layout skeleton rows and hasChildren flags for the sidebar tree.
 */
export function listFaProjectWorkspaceHierarchyLayout (
  db: Database
): I_faProjectHierarchyTreeWorkspaceLayoutResult {
  const worldRows = db
    .prepare(
      'SELECT id, display_name, display_name_translations_json, color, color_pallete, ' +
        'sort_order, created_at_ms, updated_at_ms ' +
        `FROM ${FA_PROJECT_TABLE_WORLDS} ORDER BY sort_order ASC, created_at_ms ASC, id ASC`
    )
    .all() as I_faSqlWorldRow[]

  const worlds = worldRows.map((worldRow) => {
    const world = mapFaProjectWorldRow(worldRow)
    const groupRows = db
      .prepare(
        'SELECT id, world_id, display_name, display_name_translations_json, root_sort_order, ' +
          'created_at_ms, updated_at_ms ' +
          `FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS} WHERE world_id = ? ` +
          'ORDER BY root_sort_order ASC, created_at_ms ASC, id ASC'
      )
      .all(world.id) as I_faSqlWorldTemplateGroupRow[]

    const placementRows = db
      .prepare(
        'SELECT p.id, p.world_id, p.document_template_id, p.group_id, p.root_sort_order, ' +
          'p.group_sort_order, p.nickname, p.nickname_translations_json, ' +
          'p.nickname_singular_translations_json, p.created_at_ms, p.updated_at_ms, ' +
          't.display_name, t.world_appendix, t.icon ' +
          `FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} p ` +
          `INNER JOIN ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} t ON t.id = p.document_template_id ` +
          'WHERE p.world_id = ? ' +
          'ORDER BY COALESCE(p.root_sort_order, p.group_sort_order) ASC, p.created_at_ms ASC, p.id ASC'
      )
      .all(world.id) as I_faSqlWorldTemplatePlacementJoinRow[]

    return {
      id: world.id,
      displayName: world.displayName,
      sortOrder: world.sortOrder,
      color: world.color,
      groups: groupRows.map((groupRow) => ({
        id: groupRow.id,
        worldId: groupRow.world_id,
        displayName: groupRow.display_name,
        rootSortOrder: groupRow.root_sort_order,
        hasChildren: readFaProjectGroupHasPlacements(db, groupRow.id)
      })),
      placements: placementRows.map((placementRow) => ({
        id: placementRow.id,
        worldId: placementRow.world_id,
        documentTemplateId: placementRow.document_template_id,
        groupId: placementRow.group_id,
        rootSortOrder: placementRow.root_sort_order,
        groupSortOrder: placementRow.group_sort_order,
        displayName: placementRow.display_name,
        nickname: placementRow.nickname,
        icon: placementRow.icon,
        hasChildren: readFaProjectPlacementHasTopLevelDocuments(db, placementRow.id)
      }))
    }
  })

  return { worlds }
}

/**
 * Returns document child count for a placement parent bucket (skeleton helper).
 */
export function readFaProjectPlacementDocumentChildCount (
  db: Database,
  placementId: string,
  parentDocumentId: string | null
): number {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS c FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        'WHERE placement_id = ? AND ' +
        '(parent_document_id IS ? OR (parent_document_id IS NULL AND ? IS NULL))'
    )
    .get(placementId, parentDocumentId, parentDocumentId) as { c: number } | undefined
  return row?.c ?? 0
}
