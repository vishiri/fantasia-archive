import type Database from 'better-sqlite3'

const USER_VERSION_SUPPORTED_MAX = 1

/**
 * Applies SQLite migrations up to the latest supported schema. Inserts project_name when bootstrapping v1.
 */
export function applyFaProjectMigrations (
  db: Database,
  displayProjectName: string
): void {
  const rawVer = db.pragma('user_version', { simple: true })
  const current = typeof rawVer === 'number' ? rawVer : Number(rawVer)
  const safeCurrent = Number.isFinite(current) ? current : 0
  if (safeCurrent > USER_VERSION_SUPPORTED_MAX) {
    throw new Error('This project file requires a newer version of Fantasia Archive')
  }
  if (safeCurrent === USER_VERSION_SUPPORTED_MAX) {
    return
  }

  const run = db.transaction(() => {
    db.exec(`
CREATE TABLE project_options (
  option_id INTEGER PRIMARY KEY,
  option_name TEXT NOT NULL UNIQUE CHECK (length(option_name) BETWEEN 1 AND 255),
  option_value TEXT NOT NULL
);
`)
    db.prepare(
      'INSERT INTO project_options (option_name, option_value) VALUES (?, ?)'
    ).run('project_name', displayProjectName)
    db.pragma('user_version = 1')
  })
  run()

  const verify = db.prepare(
    'SELECT option_value AS v FROM project_options WHERE option_name = ?'
  ).get('project_name') as { v?: string } | undefined
  if (verify?.v !== displayProjectName) {
    throw new Error('Failed to verify project_name row after migration')
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
