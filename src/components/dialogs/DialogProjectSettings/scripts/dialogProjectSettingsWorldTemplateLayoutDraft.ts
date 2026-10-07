import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type {
  I_dialogProjectSettingsWorldTemplateLayoutDraft
} from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectWorldTemplateLayoutSnapshot } from 'app/types/I_faProjectWorldTemplateLayoutDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import {
  normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder,
  resolveDialogProjectSettingsWorldTemplateLayoutNextRootSortOrder
} from './dialogProjectSettingsWorldTemplateLayoutRootOrder'
import { normalizeFaProjectWorldTemplateGroupDisplayNameTranslations } from 'app/src/scripts/projectWorlds/faProjectWorldTemplateGroupDisplayName_manager'
import {
  buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations,
  normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations,
  normalizeFaProjectWorldTemplatePlacementNicknameTranslations
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'
import {
  hasFaProjectWorldTemplateGroupDisplayNameTranslation
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplateGroupDisplayName_manager'
import {
  resolveFaProjectWorldTemplateGroupDisplayNameForStorage
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplateGroupDisplayName_manager'
import {
  resolveFaProjectWorldTemplatePlacementNicknameForStorage
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'

export function createEmptyDialogProjectSettingsWorldTemplateLayoutDraft (
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const groups: I_dialogProjectSettingsWorldTemplateLayoutDraft['groups'] = []
  const placements: I_dialogProjectSettingsWorldTemplateLayoutDraft['placements'] = []
  return {
    groups,
    placements
  }
}

export function mapDialogProjectSettingsWorldTemplateLayoutToSnapshot (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): I_faProjectWorldTemplateLayoutSnapshot {
  const groups = layout.groups.map((group) => {
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
  })
  const placements = layout.placements.map((placement) => {
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
  return {
    groups,
    placements
  }
}

export function appendDialogProjectSettingsWorldTemplateGroupDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  languageCode: T_faUserSettingsLanguageCode,
  defaultDisplayName: string
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const nextRootOrder = resolveDialogProjectSettingsWorldTemplateLayoutNextRootSortOrder(layout)
  return normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder({
    groups: [
      ...layout.groups,
      {
        displayNameTranslations: {
          [languageCode]: defaultDisplayName
        },
        id: crypto.randomUUID(),
        rootSortOrder: nextRootOrder
      }
    ],
    placements: layout.placements
  })
}

export function renameDialogProjectSettingsWorldTemplateGroupDisplayNameTranslationsDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  groupId: string,
  displayNameTranslations: I_dialogProjectSettingsWorldTemplateLayoutDraft['groups'][number]['displayNameTranslations']
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const groups = layout.groups.map((group) => {
    if (group.id !== groupId) {
      return group
    }
    const nextDisplayNameTranslations = normalizeFaProjectWorldTemplateGroupDisplayNameTranslations(
      displayNameTranslations
    )
    return {
      ...group,
      displayNameTranslations: nextDisplayNameTranslations
    }
  })
  const placements = layout.placements
  return {
    groups,
    placements
  }
}

export function renameDialogProjectSettingsWorldTemplatePlacementNicknameTranslationsDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  placementId: string,
  nicknameTranslations: I_faLocaleSingularPluralTranslations
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const nicknamePluralTranslations = normalizeFaProjectWorldTemplatePlacementNicknameTranslations(
    nicknameTranslations.plural
  )
  const nicknameSingularTranslations = normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations(
    nicknameTranslations.singular
  )
  const groups = layout.groups
  const placements = layout.placements.map((placement) => {
    if (placement.id !== placementId) {
      return placement
    }
    const nickname = resolveFaProjectWorldTemplatePlacementNicknameForStorage(
      buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
        nicknamePluralTranslations,
        nicknameSingularTranslations
      })
    )
    return {
      ...placement,
      nickname,
      nicknamePluralTranslations,
      nicknameSingularTranslations
    }
  })
  return {
    groups,
    placements
  }
}

export function syncDialogProjectSettingsWorldTemplatePlacementTemplateDisplayNames (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  documentTemplateId: string,
  templateDisplayName: string
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const groups = layout.groups
  const placements = layout.placements.map((placement) => {
    if (placement.documentTemplateId !== documentTemplateId) {
      return placement
    }
    return {
      ...placement,
      templateDisplayName
    }
  })
  return {
    groups,
    placements
  }
}

export { removeDialogProjectSettingsWorldTemplateGroupDraft } from './dialogProjectSettingsWorldTemplateLayoutGroupDraft'

export function appendDialogProjectSettingsWorldTemplatePlacementDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  template: {
    documentTemplateId: string
    icon: string
    templateDisplayName: string
    worldAppendix: string
  }
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const rootCount = resolveDialogProjectSettingsWorldTemplateLayoutNextRootSortOrder(layout)
  return normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder({
    groups: layout.groups,
    placements: [
      ...layout.placements,
      {
        categoryCountInWorld: 0,
        documentCountInWorld: 0,
        documentTemplateId: template.documentTemplateId,
        groupId: null,
        groupSortOrder: null,
        icon: template.icon,
        id: crypto.randomUUID(),
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        rootSortOrder: rootCount,
        templateDisplayName: template.templateDisplayName,
        worldAppendix: template.worldAppendix
      }
    ]
  })
}

export function removeDialogProjectSettingsWorldTemplatePlacementDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  placementId: string
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  return normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder({
    groups: layout.groups,
    placements: layout.placements.filter((placement) => placement.id !== placementId)
  })
}

export function hasDialogProjectSettingsWorldTemplateGroupNameValidationError (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): boolean {
  return layout.groups.some(
    (group) => !hasFaProjectWorldTemplateGroupDisplayNameTranslation(group.displayNameTranslations)
  )
}
