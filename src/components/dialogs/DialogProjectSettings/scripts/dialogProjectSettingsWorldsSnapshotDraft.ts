import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectWorldSnapshotItem } from 'app/types/I_faProjectWorldDomain'

import { normalizeFaProjectWorldDisplayNameTranslations } from 'app/src/scripts/projectWorlds/faProjectWorldDisplayName_manager'
import { normalizeFaProjectWorldTemplateGroupDisplayNameTranslations } from 'app/src/scripts/projectWorlds/faProjectWorldTemplateGroupDisplayName_manager'
import {
  buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations,
  normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations,
  normalizeFaProjectWorldTemplatePlacementNicknameTranslations
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'
import {
  resolveFaProjectWorldTemplateGroupDisplayNameForStorage
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplateGroupDisplayName_manager'
import {
  resolveFaProjectWorldTemplatePlacementNicknameForStorage
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'
import { normalizeFaProjectWorldColorPaletteString } from 'app/src/scripts/projectWorlds/functions/faProjectWorldColorPaletteHexList'

export function mapDialogProjectSettingsWorldsToSnapshot (
  worlds: I_dialogProjectSettingsWorldDraft[]
): I_faProjectWorldSnapshotItem[] {
  return worlds.map((world) => {
    const trimmedColor = world.color.trim()
    const item: I_faProjectWorldSnapshotItem = {
      color: trimmedColor,
      displayNameTranslations: normalizeFaProjectWorldDisplayNameTranslations(
        world.displayNameTranslations
      ),
      id: world.id
    }
    const normalizedPalette = normalizeFaProjectWorldColorPaletteString(world.colorPalette)
    if (normalizedPalette.length > 0) {
      item.colorPalette = normalizedPalette
    }
    item.templateLayout = {
      groups: world.templateLayout.groups.map((group) => {
        const displayNameTranslations = normalizeFaProjectWorldTemplateGroupDisplayNameTranslations(
          group.displayNameTranslations
        )
        const displayName = resolveFaProjectWorldTemplateGroupDisplayNameForStorage(displayNameTranslations)
        const id = group.id
        const rootSortOrder = group.rootSortOrder
        return {
          displayName,
          displayNameTranslations,
          id,
          rootSortOrder
        }
      }),
      placements: world.templateLayout.placements.map((placement) => {
        const nicknamePluralTranslations = normalizeFaProjectWorldTemplatePlacementNicknameTranslations(
          placement.nicknamePluralTranslations
        )
        const nicknameSingularTranslations = normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations(
          placement.nicknameSingularTranslations
        )
        const documentTemplateId = placement.documentTemplateId
        const groupId = placement.groupId
        const groupSortOrder = placement.groupSortOrder
        const id = placement.id
        const nickname = resolveFaProjectWorldTemplatePlacementNicknameForStorage(
          buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
            nicknamePluralTranslations,
            nicknameSingularTranslations
          })
        )
        const rootSortOrder = placement.rootSortOrder
        return {
          documentTemplateId,
          groupId,
          groupSortOrder,
          id,
          nickname,
          nicknamePluralTranslations,
          nicknameSingularTranslations,
          rootSortOrder
        }
      })
    }
    return item
  })
}
