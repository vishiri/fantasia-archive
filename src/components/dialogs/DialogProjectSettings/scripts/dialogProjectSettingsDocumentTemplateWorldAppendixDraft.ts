import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faProjectDocumentTemplateWorldAppendixTranslations } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import {
  normalizeFaProjectDocumentTemplateWorldAppendixTranslations,
  resolveFaProjectDocumentTemplateWorldAppendix,
  resolveFaProjectDocumentTemplateWorldAppendixLanguageCode
} from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateWorldAppendix_manager'

export function resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix (
  template: Pick<I_dialogProjectSettingsDocumentTemplateDraft, 'worldAppendixTranslations'>,
  languageCode: T_faUserSettingsLanguageCode
): string {
  return resolveFaProjectDocumentTemplateWorldAppendix(
    template.worldAppendixTranslations,
    languageCode
  )
}

export function resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendixLanguageCode (
  template: Pick<I_dialogProjectSettingsDocumentTemplateDraft, 'worldAppendixTranslations'>,
  languageCode: T_faUserSettingsLanguageCode
): T_faUserSettingsLanguageCode | null {
  return resolveFaProjectDocumentTemplateWorldAppendixLanguageCode(
    template.worldAppendixTranslations,
    languageCode
  )
}

export function normalizeDialogProjectSettingsDocumentTemplateWorldAppendixTranslations (
  worldAppendixTranslations: I_faProjectDocumentTemplateWorldAppendixTranslations
): I_faProjectDocumentTemplateWorldAppendixTranslations {
  return normalizeFaProjectDocumentTemplateWorldAppendixTranslations(worldAppendixTranslations)
}
