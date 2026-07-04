import type Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'

import {
  FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS
} from '../functions/faProjectDbSchemaDdl'
import {
  buildFaProjectHierarchyTestDocumentSeedNamePattern,
  planFaProjectHierarchyTestDocumentInserts
} from './functions/seedFaProjectHierarchyTestDocumentsForPlacements'

function escapeFaProjectHierarchyTestDocumentRegex (value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Enabled in non-production builds unless FA_ENABLE_HIERARCHY_TEST_DOCUMENT_SEED=0.
 */
function readFaProjectHierarchyElectronIsPackaged (): boolean {
  try {
    const electron = require('electron') as { app?: { isPackaged: boolean } }
    return electron.app?.isPackaged ?? true
  } catch {
    return true
  }
}

export function readFaProjectHierarchyTestDocumentSeedEnabled (options?: {
  isPackagedOverride?: boolean
}): boolean {
  if (process.env.FA_ENABLE_HIERARCHY_TEST_DOCUMENT_SEED === '0') {
    return false
  }
  if (process.env.FA_ENABLE_HIERARCHY_TEST_DOCUMENT_SEED === '1') {
    return true
  }
  const isPackaged = options?.isPackagedOverride ?? readFaProjectHierarchyElectronIsPackaged()
  if (!isPackaged) {
    return true
  }
  return process.env.NODE_ENV !== 'production'
}

type T_placementSeedRow = {
  id: string
  world_id: string
  document_template_id: string
  display_name: string
}

function listFaProjectHierarchyTestPlacementRows (db: Database): T_placementSeedRow[] {
  return db
    .prepare(
      'SELECT p.id, p.world_id, p.document_template_id, t.display_name ' +
        `FROM ${FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS} p ` +
        `INNER JOIN ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} t ON t.id = p.document_template_id`
    )
    .all() as T_placementSeedRow[]
}

function listFaProjectHierarchyTestSeedDisplayNames (
  db: Database,
  placementId: string
): string[] {
  const rows = db
    .prepare(
      `SELECT display_name FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        `WHERE ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN} = ? AND display_name LIKE 'Test Document - %'`
    )
    .all(placementId) as Array<{ display_name: string }>
  return rows.map((row) => row.display_name)
}

function filterFaProjectHierarchyTestSeedDisplayNames (
  displayNames: string[],
  templateDisplayName: string
): string[] {
  const pattern = new RegExp(
    buildFaProjectHierarchyTestDocumentSeedNamePattern(
      escapeFaProjectHierarchyTestDocumentRegex,
      templateDisplayName
    )
  )
  return displayNames.filter((name) => pattern.test(name))
}

function listFaProjectHierarchyTestUsedSuffixes (
  seedDisplayNames: string[]
): number[] {
  const suffixes: number[] = []
  const suffixRe = / (0[1-9]|10)$/
  for (const displayName of seedDisplayNames) {
    const match = suffixRe.exec(displayName)
    if (match !== null) {
      suffixes.push(Number.parseInt(match[1] as string, 10))
    }
  }
  return suffixes
}

function readFaProjectHierarchyTestMaxSortOrder (
  db: Database,
  placementId: string
): number | null {
  const row = db
    .prepare(
      `SELECT MAX(${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN}) AS max_sort FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        `WHERE ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN} = ? AND ` +
        `${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} IS NULL`
    )
    .get(placementId) as { max_sort: number | null } | undefined
  return row?.max_sort ?? null
}

function insertFaProjectHierarchyTestDocumentPlan (
  db: Database,
  plan: {
    id: string
    displayName: string
    worldId: string
    templateId: string
    placementId: string
    parentDocumentId: null
    sortOrder: number
    createdAtMs: number
    updatedAtMs: number
  }
): void {
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_DOCUMENTS} ` +
      `(id, world_id, template_id, ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN}, ` +
      `${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN}, ` +
      `${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN}, ` +
      'display_name, created_at_ms, updated_at_ms) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    plan.id,
    plan.worldId,
    plan.templateId,
    plan.placementId,
    plan.parentDocumentId,
    plan.sortOrder,
    plan.displayName,
    plan.createdAtMs,
    plan.updatedAtMs
  )
}

/**
 * Seeds numbered test documents per placement after worlds snapshot save (dev / QA gate).
 */
export function seedFaProjectHierarchyTestDocumentsForPlacements (db: Database): number {
  if (!readFaProjectHierarchyTestDocumentSeedEnabled()) {
    return 0
  }
  const placements = listFaProjectHierarchyTestPlacementRows(db)
  let inserted = 0
  for (const placement of placements) {
    const templateDisplayName = placement.display_name.trim()
    if (templateDisplayName.length === 0) {
      continue
    }
    const placementDisplayNames = listFaProjectHierarchyTestSeedDisplayNames(db, placement.id)
    const seedDisplayNames = filterFaProjectHierarchyTestSeedDisplayNames(
      placementDisplayNames,
      templateDisplayName
    )
    const plans = planFaProjectHierarchyTestDocumentInserts(
      {
        generateUuid: uuidv4,
        nowMs: () => Date.now()
      },
      {
        placementId: placement.id,
        worldId: placement.world_id,
        documentTemplateId: placement.document_template_id,
        templateDisplayName
      },
      {
        existingSeedCount: seedDisplayNames.length,
        usedSuffixes: listFaProjectHierarchyTestUsedSuffixes(seedDisplayNames),
        maxSortOrder: readFaProjectHierarchyTestMaxSortOrder(db, placement.id)
      }
    )
    for (const plan of plans) {
      insertFaProjectHierarchyTestDocumentPlan(db, plan)
      inserted += 1
    }
  }
  return inserted
}
