import type Database from 'better-sqlite3'
import { Result } from 'neverthrow'

import {
  openFaProjectDatabase,
  replaceFaProjectActiveDatabase
} from 'app/src-electron/mainScripts/projectManagement/faProjectActiveDatabase'
import {
  applyFaProjectMigrations,
  assertFaProjectDatabaseQuickCheck
} from 'app/src-electron/mainScripts/projectManagement/faProjectDbMigrate'
import { faDisplayNameFallbackFromProjectPath } from 'app/src-electron/mainScripts/projectManagement/faProjectPathValidation'

function closeAttemptDb (db: Database | null): void {
  if (db === null) {
    return
  }
  void Result.fromThrowable(
    (): void => {
      db.close()
    },
    (): undefined => undefined
  )()
}

/**
 * Reopens the same on-disk project without the "already active" duplicate-project check used by user-driven open.
 */
export function reconnectFaProjectDatabaseAtKnownPathSync (filePath: string): boolean {
  let db: Database | null = null
  const opened = Result.fromThrowable((): true => {
    db = openFaProjectDatabase(filePath)
    db.pragma('foreign_keys = ON')
    db.pragma('busy_timeout = 5000')
    db.pragma('journal_mode = DELETE')
    const fallbackName = faDisplayNameFallbackFromProjectPath(filePath)
    applyFaProjectMigrations(db, fallbackName)
    assertFaProjectDatabaseQuickCheck(db)
    replaceFaProjectActiveDatabase(db, filePath)
    db = null
    return true
  }, (e: unknown) => e)()

  if (opened.isErr()) {
    closeAttemptDb(db)
    return false
  }

  return true
}
