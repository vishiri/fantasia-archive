import type Database from 'better-sqlite3'
import { Result } from 'neverthrow'

import {
  openFaProjectDatabase,
  replaceFaProjectActiveDatabase
} from 'app/src-electron/mainScripts/projectManagement/faProjectActiveDatabaseWiring'
import {
  applyFaProjectMigrations,
  assertFaProjectDatabaseQuickCheck
} from 'app/src-electron/mainScripts/projectManagement/faProjectDbMigrateWiring'
import { faDisplayNameFallbackFromProjectPath } from './projectManagementSharedPathWiring'
import { resolveHardenedFaProjectFilePath } from './faProjectFilePathHardeningWiring'

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
  const hardened = resolveHardenedFaProjectFilePath(filePath)
  if (hardened === null) {
    return false
  }

  let db: Database | null = null
  const opened = Result.fromThrowable((): true => {
    db = openFaProjectDatabase(hardened)
    db.pragma('foreign_keys = ON')
    db.pragma('busy_timeout = 5000')
    db.pragma('journal_mode = DELETE')
    const fallbackName = faDisplayNameFallbackFromProjectPath(hardened)
    applyFaProjectMigrations(db, fallbackName)
    assertFaProjectDatabaseQuickCheck(db)
    replaceFaProjectActiveDatabase(db, hardened)
    db = null
    return true
  }, (e: unknown) => e)()

  if (opened.isErr()) {
    closeAttemptDb(db)
    return false
  }

  return true
}
