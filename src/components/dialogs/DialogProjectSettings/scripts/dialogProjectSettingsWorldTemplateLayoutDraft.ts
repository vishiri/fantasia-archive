import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type {
  I_dialogProjectSettingsWorldTemplateLayoutDraft
} from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectWorldTemplateLayoutForProjectSettings } from 'app/types/I_faProjectWorldTemplateLayoutDomain'
import type { I_faProjectWorldTemplateLayoutSnapshot } from 'app/types/I_faProjectWorldTemplateLayoutDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import {
  normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder
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
  return {
    groups: [],
    placements: []
  }
}

export function mapDialogProjectSettingsWorldTemplateLayoutFromApi (
  layout: I_faProjectWorldTemplateLayoutForProjectSettings
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  return {
    groups: layout.groups.map((group) => ({
      displayNameTranslations: normalizeFaProjectWorldTemplateGroupDisplayNameTranslations(
        group.displayNameTranslations
      ),
      id: group.id,
      rootSortOrder: group.rootSortOrder
    })),
    placements: layout.placements.map((placement) => ({
      documentCountInWorld: placement.documentCountInWorld,
      documentTemplateId: placement.documentTemplateId,
      groupId: placement.groupId,
      groupSortOrder: placement.groupSortOrder,
      icon: placement.icon,
      id: placement.id,
      nicknamePluralTranslations: normalizeFaProjectWorldTemplatePlacementNicknameTranslations(
        placement.nicknamePluralTranslations
      ),
      nicknameSingularTranslations: normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations(
        placement.nicknameSingularTranslations
      ),
      rootSortOrder: placement.rootSortOrder,
      templateDisplayName: placement.displayName,
      worldAppendix: placement.worldAppendix
    }))
  }
}

export function mapDialogProjectSettingsWorldTemplateLayoutToSnapshot (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): I_faProjectWorldTemplateLayoutSnapshot {
  return {
    groups: layout.groups.map((group) => {
      const displayNameTranslations = normalizeFaProjectWorldTemplateGroupDisplayNameTranslations(
        group.displayNameTranslations
      )
      return {
        displayName: resolveFaProjectWorldTemplateGroupDisplayNameForStorage(displayNameTranslations),
        displayNameTranslations,
        id: group.id,
        rootSortOrder: group.rootSortOrder
      }
    }),
    placements: layout.placements.map((placement) => {
      const nicknamePluralTranslations = normalizeFaProjectWorldTemplatePlacementNicknameTranslations(
        placement.nicknamePluralTranslations
      )
      const nicknameSingularTranslations = normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations(
        placement.nicknameSingularTranslations
      )
      return {
        documentTemplateId: placement.documentTemplateId,
        groupId: placement.groupId,
        groupSortOrder: placement.groupSortOrder,
        id: placement.id,
        nickname: resolveFaProjectWorldTemplatePlacementNicknameForStorage(
          buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
            nicknamePluralTranslations,
            nicknameSingularTranslations
          })
        ),
        nicknamePluralTranslations,
        nicknameSingularTranslations,
        rootSortOrder: placement.rootSortOrder
      }
    })
  }
}

export function appendDialogProjectSettingsWorldTemplateGroupDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  languageCode: T_faUserSettingsLanguageCode,
  defaultDisplayName: string
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const nextRootOrder = layout.groups.length + layout.placements.filter(
    (placement) => placement.groupId === null
  ).length
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
  return {
    groups: layout.groups.map((group) => {
      if (group.id !== groupId) {
        return group
      }
      return {
        ...group,
        displayNameTranslations: normalizeFaProjectWorldTemplateGroupDisplayNameTranslations(
          displayNameTranslations
        )
      }
    }),
    placements: layout.placements
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
  return {
    groups: layout.groups,
    placements: layout.placements.map((placement) => {
      if (placement.id !== placementId) {
        return placement
      }
      return {
        ...placement,
        nickname: resolveFaProjectWorldTemplatePlacementNicknameForStorage(
          buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
            nicknamePluralTranslations,
            nicknameSingularTranslations
          })
        ),
        nicknamePluralTranslations,
        nicknameSingularTranslations
      }
    })
  }
}

export function syncDialogProjectSettingsWorldTemplatePlacementTemplateDisplayNames (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  documentTemplateId: string,
  templateDisplayName: string
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  return {
    groups: layout.groups,
    placements: layout.placements.map((placement) => {
      if (placement.documentTemplateId !== documentTemplateId) {
        return placement
      }
      return {
        ...placement,
        templateDisplayName
      }
    })
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
  const rootCount = layout.groups.length + layout.placements.filter(
    (placement) => placement.groupId === null
  ).length
  return normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder({
    groups: layout.groups,
    placements: [
      ...layout.placements,
      {
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
