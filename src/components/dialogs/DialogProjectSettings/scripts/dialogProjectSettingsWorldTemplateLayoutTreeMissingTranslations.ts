import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_dialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning } from 'app/types/T_dialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

import {
  hasFaProjectWorldTemplatePlacementNicknameTranslation,
  resolveFaProjectWorldTemplatePlacementNicknameMissingTranslationWarning
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'
import {
  buildFaProjectDocumentTemplateTitleSingularPluralTranslations,
  resolveFaProjectDocumentTemplateTitleMissingTranslationWarning
} from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateTitle_manager'

function isMissingActiveLocaleTranslation (
  translations: I_faLocaleStringTranslations,
  languageCode: T_faUserSettingsLanguageCode
): boolean {
  const activeLocaleValue = translations[languageCode] ?? ''
  return activeLocaleValue.trim().length === 0
}

export function isDialogProjectSettingsWorldTemplateGroupMissingCurrentLanguageTranslations (
  displayNameTranslations: I_faLocaleStringTranslations,
  languageCode: T_faUserSettingsLanguageCode
): boolean {
  return isMissingActiveLocaleTranslation(displayNameTranslations, languageCode)
}

export function resolveDialogProjectSettingsWorldTemplatePlacementTreeMissingTranslationWarning (params: {
  documentTemplateTitlePluralTranslations: I_faLocaleStringTranslations | null
  documentTemplateTitleSingularTranslations: I_faLocaleStringTranslations | null
  languageCode: T_faUserSettingsLanguageCode
  nicknamePluralTranslations: I_faLocaleStringTranslations
  nicknameSingularTranslations: I_faLocaleStringTranslations
}): Extract<
  T_dialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning,
  { kind: 'documentTemplateTitle' | 'placementNickname' }
> | null {
  const nicknameTranslations: I_faLocaleSingularPluralTranslations = {
    plural: params.nicknamePluralTranslations,
    singular: params.nicknameSingularTranslations
  }
  if (hasFaProjectWorldTemplatePlacementNicknameTranslation(nicknameTranslations)) {
    const warning = resolveFaProjectWorldTemplatePlacementNicknameMissingTranslationWarning(
      nicknameTranslations,
      params.languageCode
    )
    if (warning === null) {
      return null
    }
    return {
      kind: 'placementNickname',
      warning
    }
  }
  if (params.documentTemplateTitlePluralTranslations === null) {
    return null
  }
  const titleTranslations = buildFaProjectDocumentTemplateTitleSingularPluralTranslations({
    titlePluralTranslations: params.documentTemplateTitlePluralTranslations,
    titleSingularTranslations: params.documentTemplateTitleSingularTranslations ?? {}
  })
  const warning = resolveFaProjectDocumentTemplateTitleMissingTranslationWarning(
    titleTranslations,
    params.languageCode
  )
  if (warning === null) {
    return null
  }
  return {
    kind: 'documentTemplateTitle',
    warning
  }
}

export function resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning (params: {
  documentTemplateTitlePluralTranslations: I_faLocaleStringTranslations | null
  documentTemplateTitleSingularTranslations: I_faLocaleStringTranslations | null
  languageCode: T_faUserSettingsLanguageCode
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
}): T_dialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning | null {
  if (params.node.nodeKind === 'group') {
    if (isDialogProjectSettingsWorldTemplateGroupMissingCurrentLanguageTranslations(
      params.node.displayNameTranslations,
      params.languageCode
    )) {
      return 'groupDisplayName'
    }
    return null
  }
  if (params.node.documentTemplateId === null) {
    return null
  }
  return resolveDialogProjectSettingsWorldTemplatePlacementTreeMissingTranslationWarning({
    documentTemplateTitlePluralTranslations: params.documentTemplateTitlePluralTranslations,
    documentTemplateTitleSingularTranslations: params.documentTemplateTitleSingularTranslations,
    languageCode: params.languageCode,
    nicknamePluralTranslations: params.node.nicknamePluralTranslations,
    nicknameSingularTranslations: params.node.nicknameSingularTranslations
  })
}

export function resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarningI18nKey (
  warning: T_dialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning | null
): string | null {
  if (warning === null) {
    return null
  }
  if (warning === 'groupDisplayName') {
    return 'dialogs.projectSettings.fields.worldTemplateLayout.missingGroupDisplayNameTreeTooltip'
  }
  return null
}
