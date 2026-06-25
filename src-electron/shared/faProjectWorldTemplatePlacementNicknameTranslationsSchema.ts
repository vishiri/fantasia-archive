import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'

import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_faProjectWorldTemplatePlacementNicknameTranslations } from 'app/types/I_faProjectWorldTemplatePlacementNicknameTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_MAX_LENGTH } from 'app/src-electron/mainScripts/projectManagement/functions/faProjectDbSchemaDdl'
import { normalizeFaProjectWorldTemplatePlacementNicknameTranslations } from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'

/** Max stored JSON payload for world_template_placements.nickname_translations_json. */
export const FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_TRANSLATIONS_JSON_MAX_LENGTH = 4096

const faProjectWorldTemplatePlacementNicknameTranslationValueSchema = z.string().max(
  FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_MAX_LENGTH
)

const faProjectWorldTemplatePlacementNicknameTranslationsRecordSchema = z.object(
  Object.fromEntries(
    FA_USER_SETTINGS_LANGUAGE_CODES.map((code) => {
      return [code, faProjectWorldTemplatePlacementNicknameTranslationValueSchema.optional()]
    })
  ) as Record<T_faUserSettingsLanguageCode, z.ZodOptional<z.ZodString>>
).strict()

export function parseFaProjectWorldTemplatePlacementNicknameTranslationsJson (
  rawJson: string
): I_faProjectWorldTemplatePlacementNicknameTranslations {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson)
  } catch {
    return {}
  }
  const recordResult = faProjectWorldTemplatePlacementNicknameTranslationsRecordSchema.safeParse(parsed)
  if (!recordResult.success) {
    return {}
  }
  return normalizeFaProjectWorldTemplatePlacementNicknameTranslations(dropUndefinedRecordValues(recordResult.data) as I_faProjectWorldTemplatePlacementNicknameTranslations)
}

export function serializeFaProjectWorldTemplatePlacementNicknameTranslationsJson (
  nicknamePluralTranslations: I_faProjectWorldTemplatePlacementNicknameTranslations
): string {
  const normalized = normalizeFaProjectWorldTemplatePlacementNicknameTranslations(nicknamePluralTranslations)
  const serialized = JSON.stringify(normalized)
  if (serialized.length > FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_TRANSLATIONS_JSON_MAX_LENGTH) {
    throw new Error('World template placement nickname translations exceed storage limit')
  }
  return serialized
}

export function parseFaProjectWorldTemplatePlacementNicknameTranslationsSnapshot (
  payload: unknown
): I_faProjectWorldTemplatePlacementNicknameTranslations {
  const parsed = faProjectWorldTemplatePlacementNicknameTranslationsRecordSchema.parse(payload)
  return normalizeFaProjectWorldTemplatePlacementNicknameTranslations(dropUndefinedRecordValues(parsed) as I_faProjectWorldTemplatePlacementNicknameTranslations)
}

export const faProjectWorldTemplatePlacementNicknameTranslationsSnapshotSchema =
  faProjectWorldTemplatePlacementNicknameTranslationsRecordSchema
