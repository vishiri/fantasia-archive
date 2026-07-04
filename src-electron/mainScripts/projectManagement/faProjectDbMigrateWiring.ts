import type Database from 'better-sqlite3'
import { v4 as uuidv4, validate as validateUuid } from 'uuid'

import {
  applyFaProjectContentSchemaV1,
  applyFaProjectProjectDataSchemaV1,
  FA_PROJECT_DATA_TABLE_NAME,
  FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_LEGACY_PARENT_DOCUMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_LEGACY_PLACEMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_LEGACY_PLACEMENT_PARENT_SORT_INDEX,
  FA_PROJECT_DOCUMENT_TREE_LEGACY_SORT_ORDER_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PLACEMENT_PARENT_SORT_INDEX,
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS
} from './functions/faProjectDbSchemaDdl'
import { createApplyFaProjectDocumentsHierarchySchemaPatch } from './functions/faProjectDocumentsHierarchySchemaPatch'
import { seedFaProjectDefaultWorldIfEmpty } from './projectDbContent/faProjectWorldBootstrapWiring'

const OPTION_PROJECT_NAME = 'project_name'
const OPTION_PROJECT_UUID = 'project_uuid'

/** Current schema revision: flattened to a single bootstrap version. */
export const FA_PROJECT_USER_VERSION_SUPPORTED_MAX = 1

const applyFaProjectDocumentsHierarchySchemaPatch = createApplyFaProjectDocumentsHierarchySchemaPatch({
  documentsTableName: FA_PROJECT_TABLE_DOCUMENTS,
  placementsTableName: FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS,
  treePlacementIdColumn: FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN,
  treeParentDocumentIdColumn: FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN,
  treeCustomSortOrderColumn: FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN,
  legacyPlacementIdColumn: FA_PROJECT_DOCUMENT_TREE_LEGACY_PLACEMENT_ID_COLUMN,
  legacyParentDocumentIdColumn: FA_PROJECT_DOCUMENT_TREE_LEGACY_PARENT_DOCUMENT_ID_COLUMN,
  legacySortOrderColumn: FA_PROJECT_DOCUMENT_TREE_LEGACY_SORT_ORDER_COLUMN,
  treePlacementParentSortIndex: FA_PROJECT_DOCUMENT_TREE_PLACEMENT_PARENT_SORT_INDEX,
  legacyPlacementParentSortIndex: FA_PROJECT_DOCUMENT_TREE_LEGACY_PLACEMENT_PARENT_SORT_INDEX
})

function readUserVersion (db: Database): number {
  const rawVer = db.pragma('user_version', { simple: true })
  const current = typeof rawVer === 'number' ? rawVer : Number(rawVer)
  return Number.isFinite(current) ? current : 0
}

function sqlSelectValueFromActiveTable (): string {
  return `SELECT option_value AS v FROM ${FA_PROJECT_DATA_TABLE_NAME} WHERE option_name = ?`
}

function bootstrapFaProjectSchemaFresh (
  db: Database,
  displayProjectName: string
): void {
  const runBootstrap = db.transaction(() => {
    applyFaProjectProjectDataSchemaV1(db)
    db.prepare(
      `INSERT INTO ${FA_PROJECT_DATA_TABLE_NAME} ` +
        '(option_name, option_value) VALUES (?, ?)'
    ).run(OPTION_PROJECT_NAME, displayProjectName)
    db.prepare(
      `INSERT INTO ${FA_PROJECT_DATA_TABLE_NAME} ` +
        '(option_name, option_value) VALUES (?, ?)'
    ).run(OPTION_PROJECT_UUID, uuidv4())
    applyFaProjectContentSchemaV1(db)
    db.pragma(`user_version = ${FA_PROJECT_USER_VERSION_SUPPORTED_MAX}`)
  })
  runBootstrap()
}

function verifyFaProjectMetadataAfterBootstrap (db: Database, displayProjectName: string): void {
  const verifyName = db
    .prepare(sqlSelectValueFromActiveTable())
    .get(OPTION_PROJECT_NAME) as { v?: string } | undefined
  if (verifyName?.v !== displayProjectName) {
    throw new Error('Failed to verify project_name row after migration')
  }

  const uuidVerify = db
    .prepare(sqlSelectValueFromActiveTable())
    .get(OPTION_PROJECT_UUID) as { v?: string } | undefined
  const uuidStr = uuidVerify?.v?.trim()
  if (uuidStr === undefined || uuidStr.length === 0) {
    throw new Error('Failed to verify project_uuid row after migration')
  }
}

/**
 * Applies the flattened single-version schema. Fresh files bootstrap to the
 * current revision and seed the default world. Files already at the supported
 * version are a no-op. Any other version is unsupported (throws).
 */
export function applyFaProjectMigrations (
  db: Database,
  displayProjectName: string
): void {
  const startVer = readUserVersion(db)
  if (startVer > FA_PROJECT_USER_VERSION_SUPPORTED_MAX) {
    throw new Error('This project file requires a newer version of Fantasia Archive')
  }
  if (startVer === FA_PROJECT_USER_VERSION_SUPPORTED_MAX) {
    applyFaProjectDocumentsHierarchySchemaPatch(db)
    return
  }
  if (startVer === 0) {
    bootstrapFaProjectSchemaFresh(db, displayProjectName)
    verifyFaProjectMetadataAfterBootstrap(db, displayProjectName)
    seedFaProjectDefaultWorldIfEmpty(db, displayProjectName)
    return
  }
  throw new Error('Unexpected project file schema state')
}

/**
 * Runs SQLite integrity quick_check; throws if result is not ok.
 */
export function assertFaProjectDatabaseQuickCheck (db: Database): void {
  const r = db.pragma('quick_check', { simple: true })
  if (r !== 'ok') {
    throw new Error('Project file failed SQLite quick_check')
  }
}

/**
 * Reads persisted display name from schema after migrations.
 */
export function readFaProjectStoredDisplayName (db: Database): string {
  const row = db
    .prepare(sqlSelectValueFromActiveTable())
    .get(OPTION_PROJECT_NAME) as { v?: string } | undefined
  const name = row?.v?.trim()
  if (name === undefined || name.length === 0) {
    throw new Error('Project file is missing project metadata')
  }
  return name
}

/**
 * Reads persisted logical project id ('project_data.project_uuid') after migrations.
 */
export function readFaProjectStoredProjectUuid (db: Database): string {
  const row = db
    .prepare(sqlSelectValueFromActiveTable())
    .get(OPTION_PROJECT_UUID) as { v?: string } | undefined
  const raw = row?.v?.trim()
  if (raw === undefined || raw.length === 0) {
    throw new Error('Project file is missing project_uuid metadata')
  }
  if (!validateUuid(raw)) {
    throw new Error('Project file has invalid project_uuid metadata')
  }
  return raw
}
