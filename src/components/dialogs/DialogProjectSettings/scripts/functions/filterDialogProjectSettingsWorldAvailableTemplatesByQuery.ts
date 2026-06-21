import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'

export function filterDialogProjectSettingsWorldAvailableTemplatesByQuery (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[],
  query: string
): I_dialogProjectSettingsDocumentTemplateDraft[] {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) {
    return templates
  }

  return templates.filter((template) => {
    const displayName = template.displayName.toLowerCase()
    const worldAppendix = template.worldAppendix.trim().toLowerCase()
    return displayName.includes(needle) || worldAppendix.includes(needle)
  })
}
