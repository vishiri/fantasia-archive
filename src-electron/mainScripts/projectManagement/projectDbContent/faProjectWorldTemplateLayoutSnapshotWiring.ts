import type Database from 'better-sqlite3'

import {
  deleteFaProjectWorldTemplateGroupsForWorld,
  deleteFaProjectWorldTemplatePlacementsForWorld,
  insertFaProjectWorldTemplateGroupRow,
  insertFaProjectWorldTemplatePlacementRow
} from './faProjectWorldTemplateLayoutSqlWiring'
import type { I_faProjectWorldTemplateLayoutSnapshot } from 'app/types/I_faProjectWorldTemplateLayoutDomain'

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

/**
 * Replaces the full template layout for one world in one transaction.
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

  deleteFaProjectWorldTemplatePlacementsForWorld(db, worldId)
  deleteFaProjectWorldTemplateGroupsForWorld(db, worldId)

  for (const group of layout.groups) {
    const displayName = group.displayName.trim()
    if (displayName.length === 0) {
      throw new Error('World template group display name must not be empty')
    }
    insertFaProjectWorldTemplateGroupRow(db, {
      createdAtMs: nowMs,
      displayName,
      id: group.id,
      rootSortOrder: group.rootSortOrder,
      updatedAtMs: nowMs,
      worldId
    })
  }

  for (const placement of layout.placements) {
    insertFaProjectWorldTemplatePlacementRow(db, {
      createdAtMs: nowMs,
      documentTemplateId: placement.documentTemplateId,
      groupId: placement.groupId,
      groupSortOrder: placement.groupSortOrder,
      id: placement.id,
      nickname: placement.nickname.trim(),
      rootSortOrder: placement.rootSortOrder,
      updatedAtMs: nowMs,
      worldId
    })
  }
}
