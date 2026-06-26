import type Database from 'better-sqlite3'

import type {
  I_faProjectSidebarPatch,
  I_faProjectSidebarRoot
} from 'app/types/I_faProjectSidebarDomain'
import {
  formatFaProjectSidebarWidthPxForKv,
  resolveFaProjectSidebarWidthPxFromKvText
} from './functions/faProjectSidebarWidthPx'
import {
  readFaProjectDataKv,
  upsertFaProjectDataKv
} from './faProjectDataKvWiring'
import { parseFaProjectOverlayFinitePx } from './functions/faProjectOverlayFinitePx'

export const FA_PROJECT_SIDEBAR_KV_KEY = 'sidebar_width' as const

/**
 * Reads persisted workspace sidebar width from project_data after migrations.
 */
export function readFaProjectSidebarRoot (db: Database): I_faProjectSidebarRoot {
  const widthPx = resolveFaProjectSidebarWidthPxFromKvText(
    readFaProjectDataKv(db, FA_PROJECT_SIDEBAR_KV_KEY),
    parseFaProjectOverlayFinitePx
  )
  return {
    schemaVersion: 1,
    widthPx
  }
}

/**
 * Merges a validated patch into the sidebar_width KV row for the loaded project SQLite file.
 */
export function upsertFaProjectSidebarKv (
  db: Database,
  patch: I_faProjectSidebarPatch
): void {
  if (patch.widthPx === undefined) {
    return
  }
  upsertFaProjectDataKv(
    db,
    FA_PROJECT_SIDEBAR_KV_KEY,
    formatFaProjectSidebarWidthPxForKv(patch.widthPx)
  )
}
