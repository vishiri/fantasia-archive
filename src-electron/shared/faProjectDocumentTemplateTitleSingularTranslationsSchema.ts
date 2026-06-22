import { z } from 'zod'

import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_faProjectDocumentTemplateTitleSingularTranslations } from 'app/types/I_faProjectDocumentTemplateTitleSingularTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { FA_PROJECT_NAME_MAX_LEN } from './faProjectConstants'
import { normalizeFaProjectDocumentTemplateTitleSingularTranslations } from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateTitle_manager'

/** Max stored JSON payload for document_templates.title_singular_translations_json. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_SINGULAR_TRANSLATIONS_JSON_MAX_LENGTH = 4096

const faProjectDocumentTemplateTitleSingularTranslationValueSchema = z.string().max(FA_PROJECT_NAME_MAX_LEN)

const faProjectDocumentTemplateTitleSingularTranslationsRecordSchema = z.object(
  Object.fromEntries(
    FA_USER_SETTINGS_LANGUAGE_CODES.map((code) => {
      return [code, faProjectDocumentTemplateTitleSingularTranslationValueSchema.optional()]
    })
  ) as Record<T_faUserSettingsLanguageCode, z.ZodOptional<z.ZodString>>
).strict()

export function parseFaProjectDocumentTemplateTitleSingularTranslationsJson (
  rawJson: string
): I_faProjectDocumentTemplateTitleSingularTranslations {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson)
  } catch {
    return {}
  }
  const recordResult = faProjectDocumentTemplateTitleSingularTranslationsRecordSchema.safeParse(parsed)
  if (!recordResult.success) {
    return {}
  }
  return normalizeFaProjectDocumentTemplateTitleSingularTranslations(recordResult.data)
}

export function serializeFaProjectDocumentTemplateTitleSingularTranslationsJson (
  titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations
): string {
  const normalized = normalizeFaProjectDocumentTemplateTitleSingularTranslations(titleSingularTranslations)
  const serialized = JSON.stringify(normalized)
  if (serialized.length > FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_SINGULAR_TRANSLATIONS_JSON_MAX_LENGTH) {
    throw new Error('Document template singular title translations exceed storage limit')
  }
  return serialized
}

export function parseFaProjectDocumentTemplateTitleSingularTranslationsSnapshot (
  payload: unknown
): I_faProjectDocumentTemplateTitleSingularTranslations {
  const parsed = faProjectDocumentTemplateTitleSingularTranslationsRecordSchema.parse(payload)
  return normalizeFaProjectDocumentTemplateTitleSingularTranslations(parsed)
}

export const faProjectDocumentTemplateTitleSingularTranslationsSnapshotSchema =
  faProjectDocumentTemplateTitleSingularTranslationsRecordSchema
