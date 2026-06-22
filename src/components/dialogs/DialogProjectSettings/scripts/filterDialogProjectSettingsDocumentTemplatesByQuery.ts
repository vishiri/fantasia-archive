import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { resolveFaProjectDocumentTemplateDisplayTitleFromFields } from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateTitle_manager'
import { resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix } from './dialogProjectSettingsDocumentTemplateWorldAppendixDraft'

export function filterDialogProjectSettingsDocumentTemplatesByQuery (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[],
  query: string,
  languageCode: T_faUserSettingsLanguageCode
): I_dialogProjectSettingsDocumentTemplateDraft[] {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) {
    return templates
  }

  return templates.filter((template) => {
    const resolvedTitle = resolveFaProjectDocumentTemplateDisplayTitleFromFields(
      template.titlePluralTranslations,
      template.titleSingularTranslations,
      languageCode
    ).toLowerCase()
    const worldAppendix = resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix(
      template,
      languageCode
    ).toLowerCase()
    return resolvedTitle.includes(needle) || worldAppendix.includes(needle)
  })
}

/** @deprecated Use filterDialogProjectSettingsDocumentTemplatesByQuery */
export const filterDialogProjectSettingsWorldAvailableTemplatesByQuery =
  filterDialogProjectSettingsDocumentTemplatesByQuery
