import type Database from 'better-sqlite3'
import { v4 as uuidv4, validate as validateUuid } from 'uuid'

import {
  applyFaProjectContentSchemaV1,
  applyFaProjectProjectDataSchemaV1,
  FA_PROJECT_DATA_TABLE_NAME
} from './functions/faProjectDbSchemaDdl'
import { seedFaProjectDefaultWorldIfEmpty } from './projectDbContent/faProjectWorldBootstrapWiring'

const OPTION_PROJECT_NAME = 'project_name'
const OPTION_PROJECT_UUID = 'project_uuid'

/** Current schema revision: project_data KV + content tables at user_version 1. */
export const FA_PROJECT_USER_VERSION_SUPPORTED_MAX = 1

function sqlSelectValueFromActiveTable (): string {
  return `SELECT option_value AS v FROM ${FA_PROJECT_DATA_TABLE_NAME} WHERE option_name = ?`
}

function readUserVersion (db: Database): number {
  const rawVer = db.pragma('user_version', { simple: true })
  const current = typeof rawVer === 'number' ? rawVer : Number(rawVer)
  return Number.isFinite(current) ? current : 0
}

/**
 * Applies SQLite migrations up to the latest supported schema.
 * Fresh files start at user_version 0, bootstrap full schema v1, seed metadata and default world.
 * Add future steps as migrateProjectDataV1ToV2 (etc.) when the schema grows.
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
    return
  }

  if (startVer !== 0) {
    throw new Error('Unexpected project file schema state')
  }

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
    db.pragma('user_version = 1')
  })
  runBootstrap()

  seedFaProjectDefaultWorldIfEmpty(db, displayProjectName)

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
