import type Database from 'better-sqlite3'

import { mapFaProjectWorldRow } from '../faProjectContentRowMap_manager'
import { parseFaProjectDocumentTemplateTitleSingularTranslationsJson } from 'app/src-electron/shared/faProjectDocumentTemplateTitleSingularTranslationsSchema'
import { parseFaProjectDocumentTemplateTitleTranslationsJson } from 'app/src-electron/shared/faProjectDocumentTemplateTitleTranslationsSchema'
import {
  FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS,
  FA_PROJECT_TABLE_WORLDS
} from '../functions/faProjectDbSchemaDdl'
import type {
  I_faProjectHierarchyTreeWorkspaceGroup,
  I_faProjectHierarchyTreeWorkspaceLayoutResult,
  I_faProjectHierarchyTreeWorkspacePlacement
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faSqlWorldRow } from 'app/types/I_faProjectContentRowMap'
import type {
  I_faSqlWorldTemplateGroupRow,
  I_faSqlWorldTemplatePlacementJoinRow
} from 'app/types/I_faProjectContentRowMap'
import { listFaProjectPlacementCategoryDocumentCounts } from './faProjectPlacementCategoryDocumentCountsWiring'

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

function mapFaProjectHierarchyTreeWorkspaceGroup (
  db: Database,
  groupRow: I_faSqlWorldTemplateGroupRow
): I_faProjectHierarchyTreeWorkspaceGroup {
  const id = groupRow.id
  const worldId = groupRow.world_id
  const displayName = groupRow.display_name
  const rootSortOrder = groupRow.root_sort_order
  const hasChildren = readFaProjectGroupHasPlacements(db, groupRow.id)
  return {
    id,
    worldId,
    displayName,
    rootSortOrder,
    hasChildren
  }
}

function mapFaProjectHierarchyTreeWorkspacePlacement (
  db: Database,
  placementRow: I_faSqlWorldTemplatePlacementJoinRow,
  placementCounts: ReturnType<typeof listFaProjectPlacementCategoryDocumentCounts>
): I_faProjectHierarchyTreeWorkspacePlacement {
  const counts = placementCounts.get(placementRow.id)
  const id = placementRow.id
  const worldId = placementRow.world_id
  const documentTemplateId = placementRow.document_template_id
  const groupId = placementRow.group_id
  const rootSortOrder = placementRow.root_sort_order
  const groupSortOrder = placementRow.group_sort_order
  const displayName = placementRow.display_name
  const nickname = placementRow.nickname
  const icon = placementRow.icon
  const documentCount = counts?.documentCount ?? 0
  const categoryCount = counts?.categoryCount ?? 0
  const titlePluralTranslations = parseFaProjectDocumentTemplateTitleTranslationsJson(
    placementRow.title_translations_json
  )
  const titleSingularTranslations = parseFaProjectDocumentTemplateTitleSingularTranslationsJson(
    placementRow.title_singular_translations_json
  )
  return {
    id,
    worldId,
    documentTemplateId,
    groupId,
    rootSortOrder,
    groupSortOrder,
    displayName,
    nickname,
    icon,
    hasChildren: true,
    documentCount,
    categoryCount,
    titlePluralTranslations,
    titleSingularTranslations
  }
}

/**
 * Lists all worlds with template layout skeleton rows and hasChildren flags for the sidebar tree.
 */
export function listFaProjectWorkspaceHierarchyLayout (
  db: Database
): I_faProjectHierarchyTreeWorkspaceLayoutResult {
  const worldRows = db
    .prepare(
      'SELECT id, display_name, display_name_translations_json, color, color_palette, ' +
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
          't.display_name, t.world_appendix, t.icon, t.title_translations_json, ' +
          't.title_singular_translations_json ' +
          `FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} p ` +
          `INNER JOIN ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} t ON t.id = p.document_template_id ` +
          'WHERE p.world_id = ? ' +
          'ORDER BY COALESCE(p.root_sort_order, p.group_sort_order) ASC, p.created_at_ms ASC, p.id ASC'
      )
      .all(world.id) as I_faSqlWorldTemplatePlacementJoinRow[]

    const placementCounts = listFaProjectPlacementCategoryDocumentCounts(db, world.id)
    const id = world.id
    const displayName = world.displayName
    const sortOrder = world.sortOrder
    const color = world.color
    const colorPalette = world.colorPalette
    const groups = groupRows.map((groupRow) => {
      return mapFaProjectHierarchyTreeWorkspaceGroup(db, groupRow)
    })
    const placements = placementRows.map((placementRow) => {
      return mapFaProjectHierarchyTreeWorkspacePlacement(db, placementRow, placementCounts)
    })
    return {
      id,
      displayName,
      sortOrder,
      color,
      colorPalette,
      groups,
      placements
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
        `WHERE ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN} = ? AND ` +
        `(${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} IS ? OR ` +
        `(${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} IS NULL AND ? IS NULL))`
    )
    .get(placementId, parentDocumentId, parentDocumentId) as { c: number } | undefined
  return row?.c ?? 0
}
