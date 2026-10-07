import fs from 'node:fs'

import type Database from 'better-sqlite3'
import BetterSqlite3 from 'better-sqlite3'
import { Result } from 'neverthrow'

import { pathLooksLikeFaProjectFile } from './projectManagementSharedPathWiring'

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

/** Sibling path used while a new project database is built, before the chosen path is replaced. */
export function faProjectCreateStagingFilePath (filePath: string): string {
  return `${filePath}.creating`
}

function faProjectCreateBackupFilePath (filePath: string): string {
  return `${filePath}.creating-bak`
}

/**
 * Replaces filePath with a finished staging database.
 * The previous file is moved aside first and put back if the staging rename fails.
 */
export function promoteFaProjectCreateStagingFile (
  stagingPath: string,
  filePath: string
): void {
  const backupPath = faProjectCreateBackupFilePath(filePath)
  unlinkFaProjectFileIfExists(backupPath)
  const movedExistingAside = fs.existsSync(filePath)
  if (movedExistingAside) {
    fs.renameSync(filePath, backupPath)
  }
  const renamed = Result.fromThrowable(
    (): void => {
      fs.renameSync(stagingPath, filePath)
    },
    (error): unknown => error
  )()
  if (renamed.isOk()) {
    return
  }
  if (movedExistingAside) {
    fs.renameSync(backupPath, filePath)
  }
  const error = renamed.error
  throw error instanceof Error ? error : new Error(String(error))
}

export function discardFaProjectCreateBackupFile (filePath: string): void {
  unlinkFaProjectFileIfExists(faProjectCreateBackupFilePath(filePath))
}

export function restoreFaProjectCreateBackupFile (filePath: string): void {
  const backupPath = faProjectCreateBackupFilePath(filePath)
  if (!fs.existsSync(backupPath)) {
    return
  }
  unlinkFaProjectFileIfExists(filePath)
  fs.renameSync(backupPath, filePath)
}
