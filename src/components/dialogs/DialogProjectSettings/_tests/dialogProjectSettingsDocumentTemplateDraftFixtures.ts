import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'

export function buildDialogProjectSettingsDocumentTemplateDraft (
  overrides?: Partial<I_dialogProjectSettingsDocumentTemplateDraft>
): I_dialogProjectSettingsDocumentTemplateDraft {
  return {
    documentCount: 0,
    icon: '',
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    titleTranslations: { 'en-US': 'Character' },
    worldAppendixTranslations: {},
    ...overrides
  }
}
