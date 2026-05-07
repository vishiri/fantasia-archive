import fs from 'node:fs'

import type Database from 'better-sqlite3'
import BetterSqlite3 from 'better-sqlite3'
import { Result } from 'neverthrow'

let activeDb: Database | null = null

export function getFaProjectActiveDatabase (): Database | null {
  return activeDb
}

function closeDbIgnoringErrors (db: Database): void {
  void Result.fromThrowable(
    (): void => {
      db.close()
    },
    (): undefined => undefined
  )()
}

export function closeFaProjectActiveDatabase (): void {
  if (activeDb === null) {
    return
  }
  closeDbIgnoringErrors(activeDb)
  activeDb = null
}

/**
 * Closes any previous project DB handle and adopts the new open database.
 */
export function replaceFaProjectActiveDatabase (next: Database): void {
  if (activeDb !== null && activeDb !== next) {
    closeDbIgnoringErrors(activeDb)
  }
  activeDb = next
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
