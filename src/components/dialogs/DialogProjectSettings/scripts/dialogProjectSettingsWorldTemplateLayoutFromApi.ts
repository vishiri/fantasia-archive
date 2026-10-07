import type { I_dialogProjectSettingsWorldTemplateLayoutDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectWorldTemplateLayoutForProjectSettings } from 'app/types/I_faProjectWorldTemplateLayoutDomain'

import { normalizeFaProjectWorldTemplateGroupDisplayNameTranslations } from 'app/src/scripts/projectWorlds/faProjectWorldTemplateGroupDisplayName_manager'
import {
  normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations,
  normalizeFaProjectWorldTemplatePlacementNicknameTranslations
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'

export function mapDialogProjectSettingsWorldTemplateLayoutFromApi (
  layout: I_faProjectWorldTemplateLayoutForProjectSettings
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const groups = layout.groups.map((group) => {
    const displayNameTranslations = normalizeFaProjectWorldTemplateGroupDisplayNameTranslations(
      group.displayNameTranslations
    )
    const id = group.id
    const rootSortOrder = group.rootSortOrder
    return {
      displayNameTranslations,
      id,
      rootSortOrder
    }
  })
  const placements = layout.placements.map((placement) => {
    const categoryCountInWorld = placement.categoryCountInWorld
    const documentCountInWorld = placement.documentCountInWorld
    const documentTemplateId = placement.documentTemplateId
    const groupId = placement.groupId
    const groupSortOrder = placement.groupSortOrder
    const icon = placement.icon
    const id = placement.id
    const nicknamePluralTranslations = normalizeFaProjectWorldTemplatePlacementNicknameTranslations(
      placement.nicknamePluralTranslations
    )
    const nicknameSingularTranslations = normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations(
      placement.nicknameSingularTranslations
    )
    const rootSortOrder = placement.rootSortOrder
    const templateDisplayName = placement.displayName
    const worldAppendix = placement.worldAppendix
    return {
      categoryCountInWorld,
      documentCountInWorld,
      documentTemplateId,
      groupId,
      groupSortOrder,
      icon,
      id,
      nicknamePluralTranslations,
      nicknameSingularTranslations,
      rootSortOrder,
      templateDisplayName,
      worldAppendix
    }
  })
  return {
    groups,
    placements
  }
}
