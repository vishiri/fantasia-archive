import type Database from 'better-sqlite3'
import { v4 as uuidv4, validate as validateUuid } from 'uuid'

import {
  applyFaProjectContentSchemaV1,
  applyFaProjectProjectDataSchemaV1,
  applyFaProjectWorldTemplateLayoutSchemaV6,
  FA_PROJECT_DATA_TABLE_NAME,
  FA_PROJECT_TABLE_WORLD_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS,
  FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_WORLDS
} from './functions/faProjectDbSchemaDdl'
import { migrateFaProjectSchemaV1ToV2 } from './functions/faProjectDbMigrateV1ToV2'
import { migrateFaProjectSchemaV2ToV3 } from './functions/faProjectDbMigrateV2ToV3'
import { migrateFaProjectSchemaV3ToV4 } from './functions/faProjectDbMigrateV3ToV4'
import { migrateFaProjectSchemaV4ToV5 } from './functions/faProjectDbMigrateV4ToV5'
import { migrateFaProjectSchemaV5ToV6 } from './functions/faProjectDbMigrateV5ToV6'
import { migrateFaProjectSchemaV6ToV7 } from './functions/faProjectDbMigrateV6ToV7'
import { migrateFaProjectSchemaV7ToV8 } from './functions/faProjectDbMigrateV7ToV8'
import { migrateFaProjectSchemaV8ToV9 } from './functions/faProjectDbMigrateV8ToV9'
import { migrateFaProjectSchemaV9ToV10 } from './functions/faProjectDbMigrateV9ToV10'
import { migrateFaProjectSchemaV10ToV11 } from './functions/faProjectDbMigrateV10ToV11'
import { readFaProjectDbUserVersion, runFaProjectDbMigrationStep } from './faProjectDbRunMigrationStepWiring'
import { seedFaProjectDefaultWorldIfEmpty } from './projectDbContent/faProjectWorldBootstrapWiring'

const OPTION_PROJECT_NAME = 'project_name'
const OPTION_PROJECT_UUID = 'project_uuid'

/** Current schema revision: content tables at user_version 11 (singular title + nickname translations). */
export const FA_PROJECT_USER_VERSION_SUPPORTED_MAX = 11

function sqlSelectValueFromActiveTable (): string {
  return `SELECT option_value AS v FROM ${FA_PROJECT_DATA_TABLE_NAME} WHERE option_name = ?`
}

function readUserVersion (db: Database): number {
  return readFaProjectDbUserVersion(db)
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
 * Applies SQLite migrations up to the latest supported schema.
 * Fresh files bootstrap directly to the current revision, then seed the default world.
 * Older files migrate stepwise from their stored user_version.
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
    bootstrapFaProjectSchemaFresh(db, displayProjectName)
    verifyFaProjectMetadataAfterBootstrap(db, displayProjectName)
    seedFaProjectDefaultWorldIfEmpty(db, displayProjectName)
    return
  }

  runFaProjectDbMigrationStep(db, 1, FA_PROJECT_USER_VERSION_SUPPORTED_MAX, () => {
    migrateFaProjectSchemaV1ToV2(db)
  })
  runFaProjectDbMigrationStep(db, 2, FA_PROJECT_USER_VERSION_SUPPORTED_MAX, () => {
    migrateFaProjectSchemaV2ToV3(db)
  })
  runFaProjectDbMigrationStep(db, 3, FA_PROJECT_USER_VERSION_SUPPORTED_MAX, () => {
    migrateFaProjectSchemaV3ToV4(db)
  })
  runFaProjectDbMigrationStep(db, 4, FA_PROJECT_USER_VERSION_SUPPORTED_MAX, () => {
    migrateFaProjectSchemaV4ToV5(db)
  })
  runFaProjectDbMigrationStep(db, 5, FA_PROJECT_USER_VERSION_SUPPORTED_MAX, () => {
    migrateFaProjectSchemaV5ToV6(db, {
      applyLayoutSchema: applyFaProjectWorldTemplateLayoutSchemaV6,
      createPlacementId: uuidv4,
      junctionTableName: FA_PROJECT_TABLE_WORLD_DOCUMENT_TEMPLATES
    })
  })
  runFaProjectDbMigrationStep(db, 6, FA_PROJECT_USER_VERSION_SUPPORTED_MAX, () => {
    migrateFaProjectSchemaV6ToV7(db, {
      worldTemplatePlacementsTableName: FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS
    })
  })
  runFaProjectDbMigrationStep(db, 7, FA_PROJECT_USER_VERSION_SUPPORTED_MAX, () => {
    migrateFaProjectSchemaV7ToV8(db, {
      documentTemplatesTableName: FA_PROJECT_TABLE_DOCUMENT_TEMPLATES
    })
  })
  runFaProjectDbMigrationStep(db, 8, FA_PROJECT_USER_VERSION_SUPPORTED_MAX, () => {
    migrateFaProjectSchemaV8ToV9(db, {
      documentTemplatesTableName: FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
      worldsTableName: FA_PROJECT_TABLE_WORLDS
    })
  })
  runFaProjectDbMigrationStep(db, 9, FA_PROJECT_USER_VERSION_SUPPORTED_MAX, () => {
    migrateFaProjectSchemaV9ToV10(db, {
      worldTemplateGroupsTableName: FA_PROJECT_TABLE_WORLD_TEMPLATE_GROUPS,
      worldTemplatePlacementsTableName: FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS
    })
  })
  runFaProjectDbMigrationStep(db, 10, FA_PROJECT_USER_VERSION_SUPPORTED_MAX, () => {
    migrateFaProjectSchemaV10ToV11(db, {
      documentTemplatesTableName: FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
      worldTemplatePlacementsTableName: FA_PROJECT_TABLE_WORLD_TEMPLATE_PLACEMENTS
    })
  })

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
