import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'

import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { FA_PROJECT_NAME_MAX_LEN } from './faProjectConstants'
import {
  hasFaProjectWorldDisplayNameTranslation,
  normalizeFaProjectWorldDisplayNameTranslations
} from 'app/src/scripts/projectWorlds/faProjectWorldDisplayName_manager'

/** Max stored JSON payload for worlds.display_name_translations_json. */
export const FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH = 4096

const faProjectWorldDisplayNameTranslationValueSchema = z.string().max(FA_PROJECT_NAME_MAX_LEN)

const faProjectWorldDisplayNameTranslationsRecordSchema = z.object(
  Object.fromEntries(
    FA_USER_SETTINGS_LANGUAGE_CODES.map((code) => {
      return [code, faProjectWorldDisplayNameTranslationValueSchema.optional()]
    })
  ) as Record<T_faUserSettingsLanguageCode, z.ZodOptional<z.ZodString>>
).strict()

export function parseFaProjectWorldDisplayNameTranslationsJson (
  rawJson: string
): I_faProjectWorldDisplayNameTranslations {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson)
  } catch {
    return {}
  }
  const recordResult = faProjectWorldDisplayNameTranslationsRecordSchema.safeParse(parsed)
  if (!recordResult.success) {
    return {}
  }
  return normalizeFaProjectWorldDisplayNameTranslations(
    dropUndefinedRecordValues(recordResult.data) as I_faProjectWorldDisplayNameTranslations as I_faProjectWorldDisplayNameTranslations
  )
}

export function serializeFaProjectWorldDisplayNameTranslationsJson (
  displayNameTranslations: I_faProjectWorldDisplayNameTranslations
): string {
  const normalized = normalizeFaProjectWorldDisplayNameTranslations(displayNameTranslations)
  const serialized = JSON.stringify(normalized)
  if (serialized.length > FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH) {
    throw new Error('World display name translations exceed storage limit')
  }
  return serialized
}

export const faProjectWorldDisplayNameTranslationsSnapshotSchema =
  faProjectWorldDisplayNameTranslationsRecordSchema.superRefine((value, ctx) => {
    if (!hasFaProjectWorldDisplayNameTranslation(dropUndefinedRecordValues(value) as I_faProjectWorldDisplayNameTranslations)) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one world display name translation is required'
      })
    }
  })

export function parseFaProjectWorldDisplayNameTranslationsSnapshot (
  payload: unknown
): I_faProjectWorldDisplayNameTranslations {
  const parsed = faProjectWorldDisplayNameTranslationsSnapshotSchema.parse(payload)
  return normalizeFaProjectWorldDisplayNameTranslations(dropUndefinedRecordValues(parsed) as I_faProjectWorldDisplayNameTranslations)
}
