import type Database from 'better-sqlite3'
import { v4 as uuidv4, validate as validateUuid } from 'uuid'

import {
  applyFaProjectContentSchemaV1,
  applyFaProjectProjectDataSchemaV1,
  applyFaProjectWorldTemplateLayoutSchemaV6,
  FA_PROJECT_DATA_TABLE_NAME,
  FA_PROJECT_TABLE_WORLD_DOCUMENT_TEMPLATES
} from './functions/faProjectDbSchemaDdl'
import { migrateFaProjectSchemaV1ToV2 } from './functions/faProjectDbMigrateV1ToV2'
import { migrateFaProjectSchemaV2ToV3 } from './functions/faProjectDbMigrateV2ToV3'
import { migrateFaProjectSchemaV3ToV4 } from './functions/faProjectDbMigrateV3ToV4'
import { migrateFaProjectSchemaV4ToV5 } from './functions/faProjectDbMigrateV4ToV5'
import { migrateFaProjectSchemaV5ToV6 } from './functions/faProjectDbMigrateV5ToV6'
import { seedFaProjectDefaultWorldIfEmpty } from './projectDbContent/faProjectWorldBootstrapWiring'

const OPTION_PROJECT_NAME = 'project_name'
const OPTION_PROJECT_UUID = 'project_uuid'

/** Current schema revision: content tables at user_version 6 (world template layout). */
export const FA_PROJECT_USER_VERSION_SUPPORTED_MAX = 6

function sqlSelectValueFromActiveTable (): string {
  return `SELECT option_value AS v FROM ${FA_PROJECT_DATA_TABLE_NAME} WHERE option_name = ?`
}

function readUserVersion (db: Database): number {
  const rawVer = db.pragma('user_version', { simple: true })
  const current = typeof rawVer === 'number' ? rawVer : Number(rawVer)
  return Number.isFinite(current) ? current : 0
}

function bootstrapFaProjectSchemaV0ToV1 (
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
    db.pragma('user_version = 1')
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
 * Applies SQLite migrations up to the latest supported schema.
 * Fresh files start at user_version 0, bootstrap v1, migrate through v6, seed default world.
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

  if (startVer === 0) {
    bootstrapFaProjectSchemaV0ToV1(db, displayProjectName)
    verifyFaProjectMetadataAfterBootstrap(db, displayProjectName)
    seedFaProjectDefaultWorldIfEmpty(db, displayProjectName)
  }

  const afterBootstrapVer = readUserVersion(db)
  if (afterBootstrapVer === 1 && FA_PROJECT_USER_VERSION_SUPPORTED_MAX >= 2) {
    const runV1ToV2 = db.transaction(() => {
      migrateFaProjectSchemaV1ToV2(db)
    })
    runV1ToV2()
  }

  const afterV2Ver = readUserVersion(db)
  if (afterV2Ver === 2 && FA_PROJECT_USER_VERSION_SUPPORTED_MAX >= 3) {
    const runV2ToV3 = db.transaction(() => {
      migrateFaProjectSchemaV2ToV3(db)
    })
    runV2ToV3()
  }

  const afterV3Ver = readUserVersion(db)
  if (afterV3Ver === 3 && FA_PROJECT_USER_VERSION_SUPPORTED_MAX >= 4) {
    const runV3ToV4 = db.transaction(() => {
      migrateFaProjectSchemaV3ToV4(db)
    })
    runV3ToV4()
  }

  const afterV4Ver = readUserVersion(db)
  if (afterV4Ver === 4 && FA_PROJECT_USER_VERSION_SUPPORTED_MAX >= 5) {
    const runV4ToV5 = db.transaction(() => {
      migrateFaProjectSchemaV4ToV5(db)
    })
    runV4ToV5()
  }

  const afterV5Ver = readUserVersion(db)
  if (afterV5Ver === 5 && FA_PROJECT_USER_VERSION_SUPPORTED_MAX >= 6) {
    const runV5ToV6 = db.transaction(() => {
      migrateFaProjectSchemaV5ToV6(db, {
        applyLayoutSchema: applyFaProjectWorldTemplateLayoutSchemaV6,
        createPlacementId: uuidv4,
        junctionTableName: FA_PROJECT_TABLE_WORLD_DOCUMENT_TEMPLATES
      })
    })
    runV5ToV6()
  }

  const finalVer = readUserVersion(db)
  if (finalVer !== FA_PROJECT_USER_VERSION_SUPPORTED_MAX) {
    throw new Error('Unexpected project file schema state')
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
