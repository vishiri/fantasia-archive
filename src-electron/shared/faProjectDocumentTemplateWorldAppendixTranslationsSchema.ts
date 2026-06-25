import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'

import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_faProjectDocumentTemplateWorldAppendixTranslations } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_MAX_LENGTH } from 'app/src-electron/mainScripts/projectManagement/functions/faProjectDbSchemaDdl'
import { normalizeFaProjectDocumentTemplateWorldAppendixTranslations } from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateWorldAppendix_manager'

/** Max stored JSON payload for document_templates.world_appendix_translations_json. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_TRANSLATIONS_JSON_MAX_LENGTH = 8192

const faProjectDocumentTemplateWorldAppendixTranslationValueSchema = z.string().max(
  FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_MAX_LENGTH
)

const faProjectDocumentTemplateWorldAppendixTranslationsRecordSchema = z.object(
  Object.fromEntries(
    FA_USER_SETTINGS_LANGUAGE_CODES.map((code) => {
      return [code, faProjectDocumentTemplateWorldAppendixTranslationValueSchema.optional()]
    })
  ) as Record<T_faUserSettingsLanguageCode, z.ZodOptional<z.ZodString>>
).strict()

export function parseFaProjectDocumentTemplateWorldAppendixTranslationsJson (
  rawJson: string
): I_faProjectDocumentTemplateWorldAppendixTranslations {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson)
  } catch {
    return {}
  }
  const recordResult = faProjectDocumentTemplateWorldAppendixTranslationsRecordSchema.safeParse(parsed)
  if (!recordResult.success) {
    return {}
  }
  return normalizeFaProjectDocumentTemplateWorldAppendixTranslations(dropUndefinedRecordValues(recordResult.data) as I_faProjectDocumentTemplateWorldAppendixTranslations)
}

export function serializeFaProjectDocumentTemplateWorldAppendixTranslationsJson (
  worldAppendixTranslations: I_faProjectDocumentTemplateWorldAppendixTranslations
): string {
  const normalized = normalizeFaProjectDocumentTemplateWorldAppendixTranslations(worldAppendixTranslations)
  const serialized = JSON.stringify(normalized)
  if (serialized.length > FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_TRANSLATIONS_JSON_MAX_LENGTH) {
    throw new Error('Document template world appendix translations exceed storage limit')
  }
  return serialized
}

export function parseFaProjectDocumentTemplateWorldAppendixTranslationsSnapshot (
  payload: unknown
): I_faProjectDocumentTemplateWorldAppendixTranslations {
  const parsed = faProjectDocumentTemplateWorldAppendixTranslationsRecordSchema.parse(payload)
  return normalizeFaProjectDocumentTemplateWorldAppendixTranslations(dropUndefinedRecordValues(parsed) as I_faProjectDocumentTemplateWorldAppendixTranslations)
}
