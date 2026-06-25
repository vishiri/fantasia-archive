import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'

import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { FA_PROJECT_NAME_MAX_LEN } from './faProjectConstants'
import {
  hasFaProjectDocumentTemplateTitlePluralTranslation,
  normalizeFaProjectDocumentTemplateTitles
} from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateTitle_manager'

/** Max stored JSON payload for document_templates.title_translations_json. */
export const FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_TRANSLATIONS_JSON_MAX_LENGTH = 4096

const faProjectDocumentTemplateTitleTranslationValueSchema = z.string().max(FA_PROJECT_NAME_MAX_LEN)

const faProjectDocumentTemplateTitleTranslationsRecordSchema = z.object(
  Object.fromEntries(
    FA_USER_SETTINGS_LANGUAGE_CODES.map((code) => {
      return [code, faProjectDocumentTemplateTitleTranslationValueSchema.optional()]
    })
  ) as Record<T_faUserSettingsLanguageCode, z.ZodOptional<z.ZodString>>
).strict()

export function parseFaProjectDocumentTemplateTitleTranslationsJson (
  rawJson: string
): I_faProjectDocumentTemplateTitleTranslations {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson)
  } catch {
    return {}
  }
  const recordResult = faProjectDocumentTemplateTitleTranslationsRecordSchema.safeParse(parsed)
  if (!recordResult.success) {
    return {}
  }
  return normalizeFaProjectDocumentTemplateTitles(dropUndefinedRecordValues(recordResult.data) as I_faProjectDocumentTemplateTitleTranslations)
}

export function serializeFaProjectDocumentTemplateTitleTranslationsJson (
  titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations
): string {
  const normalized = normalizeFaProjectDocumentTemplateTitles(titlePluralTranslations)
  const serialized = JSON.stringify(normalized)
  if (serialized.length > FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_TRANSLATIONS_JSON_MAX_LENGTH) {
    throw new Error('Document template title translations exceed storage limit')
  }
  return serialized
}

export const faProjectDocumentTemplateTitleTranslationsSnapshotSchema =
  faProjectDocumentTemplateTitleTranslationsRecordSchema.superRefine((value, ctx) => {
    if (!hasFaProjectDocumentTemplateTitlePluralTranslation(dropUndefinedRecordValues(value) as I_faProjectDocumentTemplateTitleTranslations)) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one document template title translation is required'
      })
    }
  })

export function parseFaProjectDocumentTemplateTitleTranslationsSnapshot (
  payload: unknown
): I_faProjectDocumentTemplateTitleTranslations {
  const parsed = faProjectDocumentTemplateTitleTranslationsSnapshotSchema.parse(payload)
  return normalizeFaProjectDocumentTemplateTitles(dropUndefinedRecordValues(parsed) as I_faProjectDocumentTemplateTitleTranslations)
}
