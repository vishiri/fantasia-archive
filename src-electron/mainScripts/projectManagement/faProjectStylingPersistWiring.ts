import type Database from 'better-sqlite3'

import type { I_faProjectStylingPatch, I_faProjectStylingRoot } from 'app/types/I_faProjectStylingDomain'
import { FA_PROJECT_DATA_TABLE_NAME } from './functions/faProjectDbSchemaDdl'
import {
  readFaProjectDataKv,
  upsertFaProjectDataKv
} from './faProjectDataKvWiring'
import { parseFaProjectOverlayFinitePx } from './functions/faProjectOverlayFinitePx'

const FA_PROJECT_STYLING_KV_KEYS = {
  content: 'project_styling_content',
  heightPx: 'project_styling_height',
  widthPx: 'project_styling_width',
  xPx: 'project_styling_x',
  yPx: 'project_styling_y'
} as const

/**
 * Deletes persisted frame KV rows used by the project styling overlay.
 */
export function deleteFaProjectStylingFrameKv (db: Database): void {
  db.prepare(
    `DELETE FROM ${FA_PROJECT_DATA_TABLE_NAME} WHERE option_name IN ` +
      '(@a, @b, @c, @d)'
  ).run({
    a: FA_PROJECT_STYLING_KV_KEYS.xPx,
    b: FA_PROJECT_STYLING_KV_KEYS.yPx,
    c: FA_PROJECT_STYLING_KV_KEYS.widthPx,
    d: FA_PROJECT_STYLING_KV_KEYS.heightPx
  })
}

function readPersistedFrame (db: Database): I_faProjectStylingRoot['frame'] {
  const x = parseFaProjectOverlayFinitePx(readFaProjectDataKv(db, FA_PROJECT_STYLING_KV_KEYS.xPx))
  const y = parseFaProjectOverlayFinitePx(readFaProjectDataKv(db, FA_PROJECT_STYLING_KV_KEYS.yPx))
  const w = parseFaProjectOverlayFinitePx(readFaProjectDataKv(db, FA_PROJECT_STYLING_KV_KEYS.widthPx))
  const h = parseFaProjectOverlayFinitePx(readFaProjectDataKv(db, FA_PROJECT_STYLING_KV_KEYS.heightPx))
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
 * Reads persisted project styling KV rows after migrations.
 */
export function readFaProjectStylingRoot (db: Database): I_faProjectStylingRoot {
  const cssRaw = readFaProjectDataKv(db, FA_PROJECT_STYLING_KV_KEYS.content)
  return {
    css: cssRaw === undefined ? '' : cssRaw,
    frame: readPersistedFrame(db),
    schemaVersion: 1
  }
}

/**
 * Merges a validated patch against the KV store for the loaded project SQLite file.
 */
export function upsertFaProjectStylingKv (
  db: Database,
  patch: I_faProjectStylingPatch
): void {
  const txn = db.transaction(() => {
    if (patch.css !== undefined) {
      upsertFaProjectDataKv(
        db,
        FA_PROJECT_STYLING_KV_KEYS.content,
        patch.css
      )
    }
    if (patch.frame === undefined) {
      return
    }
    if (patch.frame === null) {
      deleteFaProjectStylingFrameKv(db)
      return
    }
    const { frame } = patch
    upsertFaProjectDataKv(db, FA_PROJECT_STYLING_KV_KEYS.xPx, String(frame.x))
    upsertFaProjectDataKv(db, FA_PROJECT_STYLING_KV_KEYS.yPx, String(frame.y))
    upsertFaProjectDataKv(db, FA_PROJECT_STYLING_KV_KEYS.widthPx, String(frame.width))
    upsertFaProjectDataKv(db, FA_PROJECT_STYLING_KV_KEYS.heightPx, String(frame.height))
  })
  txn()
}
