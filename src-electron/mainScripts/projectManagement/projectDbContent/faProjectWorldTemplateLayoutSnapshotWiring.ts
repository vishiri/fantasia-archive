import type Database from 'better-sqlite3'

import {
  deleteFaProjectWorldTemplateGroupsForWorld,
  deleteFaProjectWorldTemplatePlacementsForWorld,
  insertFaProjectWorldTemplateGroupRow,
  insertFaProjectWorldTemplatePlacementRow
} from './faProjectWorldTemplateLayoutSqlWiring'
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
    if (!hasFaProjectWorldTemplateGroupDisplayNameTranslation(group.displayNameTranslations)) {
      throw new Error('World template group display name must not be empty')
    }
    const displayName = resolveFaProjectWorldTemplateGroupDisplayNameForStorage(
      group.displayNameTranslations
    )
    insertFaProjectWorldTemplateGroupRow(db, {
      createdAtMs: nowMs,
      displayName,
      displayNameTranslationsJson: serializeFaProjectWorldTemplateGroupDisplayNameTranslationsJson(
        group.displayNameTranslations
      ),
      id: group.id,
      rootSortOrder: group.rootSortOrder,
      updatedAtMs: nowMs,
      worldId
    })
  }

  for (const placement of layout.placements) {
    const nickname = resolveFaProjectWorldTemplatePlacementNicknameForStorage(
      buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
        nicknamePluralTranslations: placement.nicknamePluralTranslations,
        nicknameSingularTranslations: placement.nicknameSingularTranslations
      })
    )
    insertFaProjectWorldTemplatePlacementRow(db, {
      createdAtMs: nowMs,
      documentTemplateId: placement.documentTemplateId,
      groupId: placement.groupId,
      groupSortOrder: placement.groupSortOrder,
      id: placement.id,
      nickname,
      nicknamePluralTranslationsJson: serializeFaProjectWorldTemplatePlacementNicknameTranslationsJson(
        placement.nicknamePluralTranslations
      ),
      nicknameSingularTranslationsJson:
        serializeFaProjectWorldTemplatePlacementNicknameSingularTranslationsJson(
          placement.nicknameSingularTranslations
        ),
      rootSortOrder: placement.rootSortOrder,
      updatedAtMs: nowMs,
      worldId
    })
  }
}
