import type Database from 'better-sqlite3'

import type { I_faProjectNoteboardPatch, I_faProjectNoteboardRoot } from 'app/types/I_faProjectNoteboardDomain'
import { FA_PROJECT_DATA_TABLE_NAME } from './faProjectDatabaseConstants'
import {
  readFaProjectDataKv,
  upsertFaProjectDataKv
} from './faProjectDataKv'
import { parseFaProjectOverlayFinitePx } from './faProjectOverlayFrameKvShared'

const FA_PROJECT_NOTEBOARD_KV_KEYS = {
  content: 'project_noteboard_content',
  heightPx: 'project_noteboard_height',
  widthPx: 'project_noteboard_width',
  xPx: 'project_noteboard_x',
  yPx: 'project_noteboard_y'
} as const

/**
 * Deletes persisted frame KV rows used by the project noteboard overlay.
 */
export function deleteFaProjectNoteboardFrameKv (db: Database): void {
  db.prepare(
    `DELETE FROM ${FA_PROJECT_DATA_TABLE_NAME} WHERE option_name IN ` +
      '(@a, @b, @c, @d)'
  ).run({
    a: FA_PROJECT_NOTEBOARD_KV_KEYS.xPx,
    b: FA_PROJECT_NOTEBOARD_KV_KEYS.yPx,
    c: FA_PROJECT_NOTEBOARD_KV_KEYS.widthPx,
    d: FA_PROJECT_NOTEBOARD_KV_KEYS.heightPx
  })
}

function readPersistedFrame (db: Database): I_faProjectNoteboardRoot['frame'] {
  const x = parseFaProjectOverlayFinitePx(readFaProjectDataKv(db, FA_PROJECT_NOTEBOARD_KV_KEYS.xPx))
  const y = parseFaProjectOverlayFinitePx(readFaProjectDataKv(db, FA_PROJECT_NOTEBOARD_KV_KEYS.yPx))
  const w = parseFaProjectOverlayFinitePx(readFaProjectDataKv(db, FA_PROJECT_NOTEBOARD_KV_KEYS.widthPx))
  const h = parseFaProjectOverlayFinitePx(readFaProjectDataKv(db, FA_PROJECT_NOTEBOARD_KV_KEYS.heightPx))
  if (
    x === undefined ||
    y === undefined ||
    w === undefined ||
    h === undefined
  ) {
    return null
  }
  return {
    height: h,
    width: w,
    x,
    y
  }
}

/**
 * Reads persisted project-noteboard KV rows after migrations.
 */
export function readFaProjectNoteboardRoot (db: Database): I_faProjectNoteboardRoot {
  const textRaw = readFaProjectDataKv(db, FA_PROJECT_NOTEBOARD_KV_KEYS.content)
  return {
    frame: readPersistedFrame(db),
    schemaVersion: 1,
    text: textRaw === undefined ? '' : textRaw
  }
}

/**
 * Merges a validated patch against the KV store for the loaded project SQLite file.
 */
export function upsertFaProjectNoteboardKv (
  db: Database,
  patch: I_faProjectNoteboardPatch
): void {
  const txn = db.transaction(() => {
    if (patch.text !== undefined) {
      upsertFaProjectDataKv(
        db,
        FA_PROJECT_NOTEBOARD_KV_KEYS.content,
        patch.text
      )
    }
    if (patch.frame === undefined) {
      return
    }
    if (patch.frame === null) {
      deleteFaProjectNoteboardFrameKv(db)
      return
    }
    const { frame } = patch
    upsertFaProjectDataKv(db, FA_PROJECT_NOTEBOARD_KV_KEYS.xPx, String(frame.x))
    upsertFaProjectDataKv(db, FA_PROJECT_NOTEBOARD_KV_KEYS.yPx, String(frame.y))
    upsertFaProjectDataKv(db, FA_PROJECT_NOTEBOARD_KV_KEYS.widthPx, String(frame.width))
    upsertFaProjectDataKv(db, FA_PROJECT_NOTEBOARD_KV_KEYS.heightPx, String(frame.height))
  })
  txn()
}
