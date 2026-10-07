import { FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_TRANSLATIONS_JSON_MAX_LENGTH } from 'app/src-electron/mainScripts/projectManagement/functions/faProjectDbSchemaDdl'
import {
  hasFaProjectDocumentTemplateTitlePluralTranslation,
  normalizeFaProjectDocumentTemplateTitles
} from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateTitle_manager'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'

import { FA_PROJECT_NAME_MAX_LEN } from './faProjectConstants'
import { createFaProjectLocaleTranslationsJsonApi } from './faProjectLocaleTranslationsJsonApi'

const titleTranslationsApi = createFaProjectLocaleTranslationsJsonApi<I_faProjectDocumentTemplateTitleTranslations>({
  valueMaxLength: FA_PROJECT_NAME_MAX_LEN,
  jsonMaxLength: FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_TRANSLATIONS_JSON_MAX_LENGTH,
  storageLimitMessage: 'Document template title translations exceed storage limit',
  normalize: normalizeFaProjectDocumentTemplateTitles,
  hasTranslation: hasFaProjectDocumentTemplateTitlePluralTranslation,
  requiredTranslationMessage: 'At least one document template title translation is required'
})

export const parseFaProjectDocumentTemplateTitleTranslationsJson = titleTranslationsApi.parseJson

export const serializeFaProjectDocumentTemplateTitleTranslationsJson = titleTranslationsApi.serializeJson

export const faProjectDocumentTemplateTitleTranslationsSnapshotSchema =
  titleTranslationsApi.snapshotSchema

export const parseFaProjectDocumentTemplateTitleTranslationsSnapshot =
  titleTranslationsApi.parseSnapshot
