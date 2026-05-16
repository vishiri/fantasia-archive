import fs from 'node:fs'

import type Database from 'better-sqlite3'
import BetterSqlite3 from 'better-sqlite3'
import { Result } from 'neverthrow'

import { pathLooksLikeFaProjectFile } from 'app/src-electron/mainScripts/projectManagement/faProjectPathValidation'

let activeDb: Database | null = null

/** Absolute path for the current handle; survives handle-only close for reconnect. Cleared on full session close. */
let lastKnownActiveProjectFilePath: string | null = null

export function getFaProjectActiveDatabase (): Database | null {
  return activeDb
}

export function getFaProjectLastKnownActiveProjectFilePath (): string | null {
  return lastKnownActiveProjectFilePath
}

function closeDbIgnoringErrors (db: Database): void {
  void Result.fromThrowable(
    (): void => {
      db.close()
    },
    (): undefined => undefined
  )()
}

/**
 * Closes the active handle only so a new open can replace it; keeps last-known path for failsafe reconnect.
 */
export function closeFaProjectActiveDatabaseHandleOnly (): void {
  if (activeDb === null) {
    return
  }
  closeDbIgnoringErrors(activeDb)
  activeDb = null
}

/** Full session teardown: closes the SQLite handle and drops the mirrored project path. */
export function closeFaProjectActiveDatabase (): void {
  closeFaProjectActiveDatabaseHandleOnly()
  lastKnownActiveProjectFilePath = null
}

/**
 * Closes any previous project DB handle and adopts the new open database; mirrors filePath for reconnect.
 */
export function replaceFaProjectActiveDatabase (next: Database, filePath: string): void {
  if (!pathLooksLikeFaProjectFile(filePath)) {
    throw new TypeError('replaceFaProjectActiveDatabase: filePath must look like an absolute .faproject file')
  }
  if (activeDb !== null && activeDb !== next) {
    closeDbIgnoringErrors(activeDb)
  }
  activeDb = next
  lastKnownActiveProjectFilePath = filePath
}

/**
 * Factory for tests: inject a mock or use real better-sqlite3.
 */
export type T_faProjectDatabaseOpener = (filePath: string) => Database

export function openFaProjectDatabase (filePath: string): Database {
  return new BetterSqlite3(filePath)
}

/**
 * Removes an existing project file so a new empty SQLite file can be created at the same path.
 */
export function unlinkFaProjectFileIfExists (filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}
