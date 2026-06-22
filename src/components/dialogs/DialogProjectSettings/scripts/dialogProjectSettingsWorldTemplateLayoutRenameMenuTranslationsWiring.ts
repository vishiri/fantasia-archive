import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

import {
  normalizeFaProjectWorldTemplateGroupDisplayNameTranslations
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplateGroupDisplayName_manager'
import {
  buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations,
  normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations,
  normalizeFaProjectWorldTemplatePlacementNicknameTranslations
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'

import {
  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate as emitRenameMenuDraftUpdatePure
} from './functions/dialogProjectSettingsWorldTemplateLayoutRenameMenuNodeHelpers'

import type { T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft } from 'app/types/T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft'

export function resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsDraftSeed (
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
): T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft {
  if (node.nodeKind === 'template') {
    return buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
      nicknamePluralTranslations: normalizeFaProjectWorldTemplatePlacementNicknameTranslations(
        node.nicknamePluralTranslations
      ),
      nicknameSingularTranslations: normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations(
        node.nicknameSingularTranslations
      )
    })
  }
  if (node.nodeKind === 'group') {
    return normalizeFaProjectWorldTemplateGroupDisplayNameTranslations(node.displayNameTranslations)
  }
  return {}
}

export function emitDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsUpdate (params: {
  emitRenameGroup: (groupId: string, displayNameTranslations: I_faLocaleStringTranslations) => void
  emitRenamePlacementNickname: (
    placementId: string,
    nicknameTranslations: I_faLocaleSingularPluralTranslations
  ) => void
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  translationsDraft: T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft
}): void {
  const nodeKind = params.node.nodeKind
  if (nodeKind === 'group') {
    emitRenameMenuDraftUpdatePure({
      displayNameTranslations: normalizeFaProjectWorldTemplateGroupDisplayNameTranslations(
        params.translationsDraft as I_faLocaleStringTranslations
      ),
      emitRenameGroup: params.emitRenameGroup,
      emitRenamePlacementNickname: params.emitRenamePlacementNickname,
      node: params.node
    })
    return
  }
  if (nodeKind === 'template') {
    const nicknameTranslations = params.translationsDraft as I_faLocaleSingularPluralTranslations
    emitRenameMenuDraftUpdatePure({
      emitRenameGroup: params.emitRenameGroup,
      emitRenamePlacementNickname: params.emitRenamePlacementNickname,
      nicknameTranslations: {
        plural: normalizeFaProjectWorldTemplatePlacementNicknameTranslations(nicknameTranslations.plural),
        singular: normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations(nicknameTranslations.singular)
      },
      node: params.node
    })
  }
}
