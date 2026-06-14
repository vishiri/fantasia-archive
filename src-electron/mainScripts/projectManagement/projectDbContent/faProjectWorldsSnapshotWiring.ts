import type Database from 'better-sqlite3'

import { coerceFaProjectWorldColorForStorage } from '../functions/coerceFaProjectWorldColorForStorage'
import { coerceFaProjectWorldColorPalleteForStorage } from '../functions/coerceFaProjectWorldColorPalleteForStorage'
import {
  FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
  FA_PROJECT_WORLD_DEFAULT_COLOR
} from '../functions/faProjectDbSchemaDdl'
import {
  deleteFaProjectWorldRow,
  insertFaProjectWorldWithId,
  listFaProjectWorldIds,
  updateFaProjectWorldRow
} from './faProjectWorldsSqlWiring'
import type { I_faProjectWorldSnapshotItem } from 'app/types/I_faProjectWorldDomain'

/**
 * Replaces the full ordered worlds list in one transaction (Project Settings save).
 */
export function replaceFaProjectWorldsSnapshot (
  db: Database,
  items: I_faProjectWorldSnapshotItem[]
): void {
  if (items.length === 0) {
    throw new Error('Project must contain at least one world')
  }

  const runReplace = db.transaction(() => {
    const existingIds = new Set(listFaProjectWorldIds(db))
    const snapshotIds = new Set(items.map((item) => item.id))

    for (const existingId of existingIds) {
      if (!snapshotIds.has(existingId)) {
        deleteFaProjectWorldRow(db, existingId)
      }
    }

    items.forEach((item, index) => {
      const color = coerceFaProjectWorldColorForStorage(
        item.color,
        FA_PROJECT_WORLD_DEFAULT_COLOR
      )
      const colorPallete = coerceFaProjectWorldColorPalleteForStorage(
        item.colorPallete,
        FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH
      )
      if (existingIds.has(item.id)) {
        updateFaProjectWorldRow(db, item.id, {
          color,
          colorPallete,
          displayName: item.displayName,
          sortOrder: index
        })
        return
      }
      insertFaProjectWorldWithId(db, {
        color,
        colorPallete,
        displayName: item.displayName,
        id: item.id,
        sortOrder: index
      })
    })
  })

  runReplace()
}
