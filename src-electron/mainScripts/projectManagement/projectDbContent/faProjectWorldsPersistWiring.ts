import type Database from 'better-sqlite3'

import {
  deleteFaProjectWorldRow,
  getFaProjectWorldRowById,
  insertFaProjectWorld,
  listFaProjectWorldDocumentCounts,
  listFaProjectWorldRows,
  updateFaProjectWorldRow
} from './faProjectWorldsSqlWiring'
import { listFaProjectWorldTemplateLayoutForProjectSettings } from './faProjectWorldTemplateLayoutReadWiring'
import { replaceFaProjectWorldsSnapshot } from './faProjectWorldsSnapshotWiring'
import { serializeFaProjectWorldDisplayNameTranslationsJson } from 'app/src-electron/shared/faProjectWorldDisplayNameTranslationsSchema'
import { resolveFaProjectWorldDisplayNameForStorage } from 'app/src/scripts/projectWorlds/faProjectWorldDisplayName_manager'
import type { I_faProjectWorldsForProjectSettingsResult } from 'app/types/I_dialogProjectSettingsWorlds'
import type {
  I_faProjectWorld,
  I_faProjectWorldCreateInput,
  I_faProjectWorldListResult,
  I_faProjectWorldPatch
} from 'app/types/I_faProjectWorldDomain'

export function createFaProjectWorld (
  db: Database,
  input: I_faProjectWorldCreateInput
): I_faProjectWorld {
  return insertFaProjectWorld(db, input.displayName)
}

export function updateFaProjectWorld (
  db: Database,
  id: string,
  patch: I_faProjectWorldPatch
): I_faProjectWorld {
  const rowPatch: {
    color?: string
    colorPallete?: string
    displayName?: string
    displayNameTranslationsJson?: string
    sortOrder?: number
  } = {}
  if (patch.displayName !== undefined) {
    rowPatch.displayName = patch.displayName
  }
  if (patch.displayNameTranslations !== undefined) {
    rowPatch.displayNameTranslationsJson = serializeFaProjectWorldDisplayNameTranslationsJson(
      patch.displayNameTranslations
    )
    rowPatch.displayName = resolveFaProjectWorldDisplayNameForStorage(patch.displayNameTranslations)
  }
  if (patch.color !== undefined) {
    rowPatch.color = patch.color
  }
  if (patch.colorPallete !== undefined) {
    rowPatch.colorPallete = patch.colorPallete
  }
  if (patch.sortOrder !== undefined) {
    rowPatch.sortOrder = patch.sortOrder
  }
  return updateFaProjectWorldRow(db, id, rowPatch)
}

export function deleteFaProjectWorld (db: Database, id: string): void {
  deleteFaProjectWorldRow(db, id)
}

export function getFaProjectWorldById (db: Database, id: string): I_faProjectWorld {
  return getFaProjectWorldRowById(db, id)
}

export function listFaProjectWorlds (db: Database): I_faProjectWorldListResult {
  return { items: listFaProjectWorldRows(db) }
}

export function listFaProjectWorldsForProjectSettings (
  db: Database
): I_faProjectWorldsForProjectSettingsResult {
  const documentCounts = listFaProjectWorldDocumentCounts(db)
  const items = listFaProjectWorldRows(db).map((world) => ({
    color: world.color,
    colorPallete: world.colorPallete,
    createdAtMs: world.createdAtMs,
    displayNameTranslations: world.displayNameTranslations,
    documentCount: documentCounts[world.id] ?? 0,
    id: world.id,
    sortOrder: world.sortOrder,
    templateLayout: listFaProjectWorldTemplateLayoutForProjectSettings(db, world.id),
    updatedAtMs: world.updatedAtMs
  }))
  return { items }
}

export {
  replaceFaProjectWorldsSnapshot
}
