import type Database from 'better-sqlite3'

import type {
  I_faProjectSettingsPatch,
  I_faProjectSettingsRoot
} from 'app/types/I_faProjectSettingsDomain'
import { readFaProjectStoredDisplayName } from './faProjectDbMigrateWiring'
import {
  readFaProjectDataKv,
  upsertFaProjectDataKv
} from './faProjectDataKvWiring'

const FA_PROJECT_SETTINGS_KV_PROJECT_NAME = 'project_name'

/**
 * Reads persisted project settings KV rows after migrations.
 */
export function readFaProjectSettingsRoot (db: Database): I_faProjectSettingsRoot {
  return {
    projectName: readFaProjectStoredDisplayName(db),
    schemaVersion: 1
  }
}

/**
 * Merges a validated patch against the KV store for the loaded project SQLite file.
 */
export function upsertFaProjectSettingsKv (
  db: Database,
  patch: I_faProjectSettingsPatch
): void {
  if (patch.projectName !== undefined) {
    upsertFaProjectDataKv(
      db,
      FA_PROJECT_SETTINGS_KV_PROJECT_NAME,
      patch.projectName
    )
  }
}

/**
 * Reads raw project_name KV without throwing when the row is absent (tests only seam).
 */
export function readFaProjectSettingsProjectNameRaw (db: Database): string | undefined {
  return readFaProjectDataKv(db, FA_PROJECT_SETTINGS_KV_PROJECT_NAME)
}
