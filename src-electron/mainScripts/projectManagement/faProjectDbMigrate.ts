import type Database from 'better-sqlite3'
import { v4 as uuidv4, validate as validateUuid } from 'uuid'

const OPTION_PROJECT_NAME = 'project_name'
const OPTION_PROJECT_UUID = 'project_uuid'

const USER_VERSION_SUPPORTED_MAX = 2

function readUserVersion (db: Database): number {
  const rawVer = db.pragma('user_version', { simple: true })
  const current = typeof rawVer === 'number' ? rawVer : Number(rawVer)
  return Number.isFinite(current) ? current : 0
}

/**
 * Applies SQLite migrations up to the latest supported schema. Inserts project_name and project_uuid when bootstrapping from v0; backfills project_uuid for legacy v1 files.
 */
export function applyFaProjectMigrations (
  db: Database,
  displayProjectName: string
): void {
  const startVer = readUserVersion(db)
  if (startVer > USER_VERSION_SUPPORTED_MAX) {
    throw new Error('This project file requires a newer version of Fantasia Archive')
  }
  if (startVer === USER_VERSION_SUPPORTED_MAX) {
    return
  }

  const run = db.transaction(() => {
    if (startVer === 0) {
      db.exec(`
CREATE TABLE project_options (
  option_id INTEGER PRIMARY KEY,
  option_name TEXT NOT NULL UNIQUE CHECK (length(option_name) BETWEEN 1 AND 255),
  option_value TEXT NOT NULL
);
`)
      db.prepare(
        'INSERT INTO project_options (option_name, option_value) VALUES (?, ?)'
      ).run(OPTION_PROJECT_NAME, displayProjectName)
      db.prepare(
        'INSERT INTO project_options (option_name, option_value) VALUES (?, ?)'
      ).run(OPTION_PROJECT_UUID, uuidv4())
      db.pragma('user_version = 2')
    } else if (startVer === 1) {
      const existingUuid = db.prepare(
        'SELECT option_value AS v FROM project_options WHERE option_name = ?'
      ).get(OPTION_PROJECT_UUID) as { v?: string } | undefined
      const u = existingUuid?.v?.trim()
      if (u === undefined || u.length === 0) {
        db.prepare(
          'INSERT INTO project_options (option_name, option_value) VALUES (?, ?)'
        ).run(OPTION_PROJECT_UUID, uuidv4())
      }
      db.pragma('user_version = 2')
    } else {
      throw new Error('Unexpected project file schema state')
    }
  })
  run()

  if (startVer === 0) {
    const verify = db.prepare(
      'SELECT option_value AS v FROM project_options WHERE option_name = ?'
    ).get(OPTION_PROJECT_NAME) as { v?: string } | undefined
    if (verify?.v !== displayProjectName) {
      throw new Error('Failed to verify project_name row after migration')
    }
  }

  const uuidVerify = db.prepare(
    'SELECT option_value AS v FROM project_options WHERE option_name = ?'
  ).get(OPTION_PROJECT_UUID) as { v?: string } | undefined
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
  const row = db.prepare(
    'SELECT option_value AS v FROM project_options WHERE option_name = ?'
  ).get(OPTION_PROJECT_NAME) as { v?: string } | undefined
  const name = row?.v?.trim()
  if (name === undefined || name.length === 0) {
    throw new Error('Project file is missing project metadata')
  }
  return name
}

/**
 * Reads persisted logical project id (`project_options.project_uuid`) after migrations.
 */
export function readFaProjectStoredProjectUuid (db: Database): string {
  const row = db.prepare(
    'SELECT option_value AS v FROM project_options WHERE option_name = ?'
  ).get(OPTION_PROJECT_UUID) as { v?: string } | undefined
  const raw = row?.v?.trim()
  if (raw === undefined || raw.length === 0) {
    throw new Error('Project file is missing project_uuid metadata')
  }
  if (!validateUuid(raw)) {
    throw new Error('Project file has invalid project_uuid metadata')
  }
  return raw
}
