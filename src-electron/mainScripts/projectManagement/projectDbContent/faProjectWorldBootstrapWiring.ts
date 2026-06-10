import type Database from 'better-sqlite3'

import {
  countFaProjectWorlds,
  insertFaProjectWorld
} from './faProjectWorldsSqlWiring'

/**
 * Inserts a default world named like the project when a brand-new file has no worlds yet.
 */
export function seedFaProjectDefaultWorldIfEmpty (
  db: Database,
  displayProjectName: string
): void {
  if (countFaProjectWorlds(db) > 0) {
    return
  }
  insertFaProjectWorld(db, displayProjectName)
}
