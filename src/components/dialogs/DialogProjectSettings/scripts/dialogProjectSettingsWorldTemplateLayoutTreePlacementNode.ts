import type {
  I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode,
  I_dialogProjectSettingsWorldTemplatePlacementDraft
} from 'app/types/I_dialogProjectSettingsWorlds'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import {
  buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations,
  resolveFaProjectWorldTemplatePlacementNickname
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'

import {
  resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabelFromResolved,
  resolveDialogProjectSettingsWorldTemplatePlacementUsesNicknameFromResolved
} from './functions/dialogProjectSettingsWorldTemplateLayoutTreeLocalizedLabels'

export function readPlacementDraftLabelFields (
  placement: I_dialogProjectSettingsWorldTemplatePlacementDraft
): {
    nicknamePluralTranslations: I_dialogProjectSettingsWorldTemplatePlacementDraft['nicknamePluralTranslations']
    nicknameSingularTranslations: I_dialogProjectSettingsWorldTemplatePlacementDraft['nicknameSingularTranslations']
    templateDisplayName: string
  } {
  const nicknamePluralTranslations = placement.nicknamePluralTranslations ?? {}
  const nicknameSingularTranslations = placement.nicknameSingularTranslations ?? {}
  const templateDisplayName = placement.templateDisplayName ??
    (placement as { displayName?: string }).displayName ??
    ''
  return {
    nicknamePluralTranslations,
    nicknameSingularTranslations,
    templateDisplayName
  }
}

export function mapPlacementToHeTreeNode (
  placement: I_dialogProjectSettingsWorldTemplatePlacementDraft,
  languageCode: T_faUserSettingsLanguageCode
): I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode {
  const {
    nicknamePluralTranslations,
    nicknameSingularTranslations,
    templateDisplayName
  } = readPlacementDraftLabelFields(placement)
  const resolvedNickname = resolveFaProjectWorldTemplatePlacementNickname(
    buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
      nicknamePluralTranslations,
      nicknameSingularTranslations
    }),
    languageCode
  )
  const usesNickname = resolveDialogProjectSettingsWorldTemplatePlacementUsesNicknameFromResolved({
    resolvedNickname
  })
  const label = resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabelFromResolved({
    resolvedNickname,
    templateDisplayName
  })
  const children: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode['children'] = []
  const displayNameTranslations: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode['displayNameTranslations'] = {}
  const categoryCountInWorld = placement.categoryCountInWorld
  const documentCountInWorld = placement.documentCountInWorld
  const documentTemplateId = placement.documentTemplateId
  const icon = placement.icon
  const id = placement.id
  const worldAppendix = placement.worldAppendix
  return {
    children,
    displayNameTranslations,
    categoryCountInWorld,
    documentCountInWorld,
    documentTemplateId,
    icon,
    id,
    label,
    nicknamePluralTranslations,
    nicknameSingularTranslations,
    nodeKind: 'template',
    templateDisplayName,
    usesNickname,
    worldAppendix
  }
}
