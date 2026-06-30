import type Database from 'better-sqlite3'

import { serializeFaProjectWorldTemplateGroupDisplayNameTranslationsJson } from 'app/src-electron/shared/faProjectWorldTemplateGroupDisplayNameTranslationsSchema'
import { serializeFaProjectWorldTemplatePlacementNicknameSingularTranslationsJson } from 'app/src-electron/shared/faProjectWorldTemplatePlacementNicknameSingularTranslationsSchema'
import { serializeFaProjectWorldTemplatePlacementNicknameTranslationsJson } from 'app/src-electron/shared/faProjectWorldTemplatePlacementNicknameTranslationsSchema'
import type { I_faProjectWorldTemplateLayoutSnapshot } from 'app/types/I_faProjectWorldTemplateLayoutDomain'

import {
  hasFaProjectWorldTemplateGroupDisplayNameTranslation,
  resolveFaProjectWorldTemplateGroupDisplayNameForStorage
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplateGroupDisplayName_manager'
import {
  buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations,
  resolveFaProjectWorldTemplatePlacementNicknameForStorage
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'

import {
  deleteFaProjectDocumentsForPlacementId,
  deleteFaProjectWorldTemplateGroupById,
  deleteFaProjectWorldTemplatePlacementById,
  insertFaProjectWorldTemplateGroupRow,
  insertFaProjectWorldTemplatePlacementRow,
  listFaProjectWorldTemplateGroupIdsForWorld,
  listFaProjectWorldTemplatePlacementIdsForWorld,
  updateFaProjectWorldTemplateGroupRow,
  updateFaProjectWorldTemplatePlacementRow
} from './faProjectWorldTemplateLayoutSqlWiring'

function assertPlacementSortFields (placement: {
  groupId: string | null
  groupSortOrder: number | null
  rootSortOrder: number | null
}): void {
  if (placement.groupId === null) {
    if (placement.rootSortOrder === null || placement.groupSortOrder !== null) {
      throw new Error('Root template placement requires rootSortOrder and no groupSortOrder')
    }
    return
  }
  if (placement.groupSortOrder === null || placement.rootSortOrder !== null) {
    throw new Error('Grouped template placement requires groupSortOrder and no rootSortOrder')
  }
}

function deleteRemovedFaProjectWorldTemplateLayoutRows (
  db: Database,
  worldId: string,
  layout: I_faProjectWorldTemplateLayoutSnapshot
): void {
  const snapshotGroupIds = new Set(layout.groups.map((group) => group.id))
  const snapshotPlacementIds = new Set(layout.placements.map((placement) => placement.id))
  const existingPlacementIds = listFaProjectWorldTemplatePlacementIdsForWorld(db, worldId)
  const existingGroupIds = listFaProjectWorldTemplateGroupIdsForWorld(db, worldId)

  for (const placementId of existingPlacementIds) {
    if (!snapshotPlacementIds.has(placementId)) {
      deleteFaProjectDocumentsForPlacementId(db, placementId)
      deleteFaProjectWorldTemplatePlacementById(db, placementId)
    }
  }
  for (const groupId of existingGroupIds) {
    if (!snapshotGroupIds.has(groupId)) {
      deleteFaProjectWorldTemplateGroupById(db, groupId)
    }
  }
}

function upsertFaProjectWorldTemplateLayoutGroups (
  db: Database,
  worldId: string,
  layout: I_faProjectWorldTemplateLayoutSnapshot,
  existingGroupIds: Set<string>,
  nowMs: number
): void {
  for (const group of layout.groups) {
    if (!hasFaProjectWorldTemplateGroupDisplayNameTranslation(group.displayNameTranslations)) {
      throw new Error('World template group display name must not be empty')
    }
    const displayName = resolveFaProjectWorldTemplateGroupDisplayNameForStorage(
      group.displayNameTranslations
    )
    const displayNameTranslationsJson = serializeFaProjectWorldTemplateGroupDisplayNameTranslationsJson(
      group.displayNameTranslations
    )
    if (existingGroupIds.has(group.id)) {
      updateFaProjectWorldTemplateGroupRow(db, {
        displayName,
        displayNameTranslationsJson,
        id: group.id,
        rootSortOrder: group.rootSortOrder,
        updatedAtMs: nowMs
      })
      continue
    }
    insertFaProjectWorldTemplateGroupRow(db, {
      createdAtMs: nowMs,
      displayName,
      displayNameTranslationsJson,
      id: group.id,
      rootSortOrder: group.rootSortOrder,
      updatedAtMs: nowMs,
      worldId
    })
  }
}

function upsertFaProjectWorldTemplateLayoutPlacements (
  db: Database,
  worldId: string,
  layout: I_faProjectWorldTemplateLayoutSnapshot,
  existingPlacementIds: Set<string>,
  nowMs: number
): void {
  for (const placement of layout.placements) {
    const nickname = resolveFaProjectWorldTemplatePlacementNicknameForStorage(
      buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
        nicknamePluralTranslations: placement.nicknamePluralTranslations,
        nicknameSingularTranslations: placement.nicknameSingularTranslations
      })
    )
    const nicknamePluralTranslationsJson = serializeFaProjectWorldTemplatePlacementNicknameTranslationsJson(
      placement.nicknamePluralTranslations
    )
    const nicknameSingularTranslationsJson =
      serializeFaProjectWorldTemplatePlacementNicknameSingularTranslationsJson(
        placement.nicknameSingularTranslations
      )
    if (existingPlacementIds.has(placement.id)) {
      updateFaProjectWorldTemplatePlacementRow(db, {
        documentTemplateId: placement.documentTemplateId,
        groupId: placement.groupId,
        groupSortOrder: placement.groupSortOrder,
        id: placement.id,
        nickname,
        nicknamePluralTranslationsJson,
        nicknameSingularTranslationsJson,
        rootSortOrder: placement.rootSortOrder,
        updatedAtMs: nowMs
      })
      continue
    }
    insertFaProjectWorldTemplatePlacementRow(db, {
      createdAtMs: nowMs,
      documentTemplateId: placement.documentTemplateId,
      groupId: placement.groupId,
      groupSortOrder: placement.groupSortOrder,
      id: placement.id,
      nickname,
      nicknamePluralTranslationsJson,
      nicknameSingularTranslationsJson,
      rootSortOrder: placement.rootSortOrder,
      updatedAtMs: nowMs,
      worldId
    })
  }
}

/**
 * Replaces the full template layout for one world by upserting rows and deleting removed ids.
 */
export function replaceFaProjectWorldTemplateLayoutSnapshot (
  db: Database,
  worldId: string,
  layout: I_faProjectWorldTemplateLayoutSnapshot
): void {
  const groupIds = new Set(layout.groups.map((group) => group.id))
  const nowMs = Date.now()

  for (const placement of layout.placements) {
    assertPlacementSortFields(placement)
    if (placement.groupId !== null && !groupIds.has(placement.groupId)) {
      throw new Error('Template placement references unknown group id')
    }
  }

  const existingPlacementIds = new Set(
    listFaProjectWorldTemplatePlacementIdsForWorld(db, worldId)
  )
  const existingGroupIds = new Set(listFaProjectWorldTemplateGroupIdsForWorld(db, worldId))

  deleteRemovedFaProjectWorldTemplateLayoutRows(db, worldId, layout)
  upsertFaProjectWorldTemplateLayoutGroups(db, worldId, layout, existingGroupIds, nowMs)
  upsertFaProjectWorldTemplateLayoutPlacements(db, worldId, layout, existingPlacementIds, nowMs)
}
