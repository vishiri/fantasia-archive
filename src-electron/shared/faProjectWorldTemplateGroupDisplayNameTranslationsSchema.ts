import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'

import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_faProjectWorldTemplateGroupDisplayNameTranslations } from 'app/types/I_faProjectWorldTemplateGroupDisplayNameTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { FA_PROJECT_NAME_MAX_LEN } from './faProjectConstants'
import {
  hasFaProjectWorldTemplateGroupDisplayNameTranslation,
  normalizeFaProjectWorldTemplateGroupDisplayNameTranslations
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplateGroupDisplayName_manager'

/** Max stored JSON payload for world_template_groups.display_name_translations_json. */
export const FA_PROJECT_WORLD_TEMPLATE_GROUP_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH = 4096

const faProjectWorldTemplateGroupDisplayNameTranslationValueSchema = z.string().max(
  FA_PROJECT_NAME_MAX_LEN
)

const faProjectWorldTemplateGroupDisplayNameTranslationsRecordSchema = z.object(
  Object.fromEntries(
    FA_USER_SETTINGS_LANGUAGE_CODES.map((code) => {
      return [code, faProjectWorldTemplateGroupDisplayNameTranslationValueSchema.optional()]
    })
  ) as Record<T_faUserSettingsLanguageCode, z.ZodOptional<z.ZodString>>
).strict()

export function parseFaProjectWorldTemplateGroupDisplayNameTranslationsJson (
  rawJson: string
): I_faProjectWorldTemplateGroupDisplayNameTranslations {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson)
  } catch {
    return {}
  }
  const recordResult = faProjectWorldTemplateGroupDisplayNameTranslationsRecordSchema.safeParse(parsed)
  if (!recordResult.success) {
    return {}
  }
  return normalizeFaProjectWorldTemplateGroupDisplayNameTranslations(dropUndefinedRecordValues(recordResult.data) as I_faProjectWorldTemplateGroupDisplayNameTranslations)
}

export function serializeFaProjectWorldTemplateGroupDisplayNameTranslationsJson (
  displayNameTranslations: I_faProjectWorldTemplateGroupDisplayNameTranslations
): string {
  const normalized = normalizeFaProjectWorldTemplateGroupDisplayNameTranslations(displayNameTranslations)
  const serialized = JSON.stringify(normalized)
  if (serialized.length > FA_PROJECT_WORLD_TEMPLATE_GROUP_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH) {
    throw new Error('World template group display name translations exceed storage limit')
  }
  return serialized
}

export const faProjectWorldTemplateGroupDisplayNameTranslationsSnapshotSchema =
  faProjectWorldTemplateGroupDisplayNameTranslationsRecordSchema.superRefine((value, ctx) => {
    if (!hasFaProjectWorldTemplateGroupDisplayNameTranslation(dropUndefinedRecordValues(value) as I_faProjectWorldTemplateGroupDisplayNameTranslations)) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one world template group display name translation is required'
      })
    }
  })

export function parseFaProjectWorldTemplateGroupDisplayNameTranslationsSnapshot (
  payload: unknown
): I_faProjectWorldTemplateGroupDisplayNameTranslations {
  const parsed = faProjectWorldTemplateGroupDisplayNameTranslationsSnapshotSchema.parse(payload)
  return normalizeFaProjectWorldTemplateGroupDisplayNameTranslations(dropUndefinedRecordValues(parsed) as I_faProjectWorldTemplateGroupDisplayNameTranslations)
}
