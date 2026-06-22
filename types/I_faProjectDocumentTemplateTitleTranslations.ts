import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'

/** Max stored length per locale title (matches document_templates.display_name). */
export const FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_TRANSLATION_MAX_LENGTH = 120

/** Per-locale document template title strings keyed by interface language code. */
export type I_faProjectDocumentTemplateTitleTranslations = I_faLocaleStringTranslations
