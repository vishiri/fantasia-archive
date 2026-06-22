import { z } from 'zod'

import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_faProjectWorldTemplatePlacementNicknameSingularTranslations } from 'app/types/I_faProjectWorldTemplatePlacementNicknameSingularTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_MAX_LENGTH } from 'app/src-electron/mainScripts/projectManagement/functions/faProjectDbSchemaDdl'
import { normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations } from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'

/** Max stored JSON payload for world_template_placements.nickname_singular_translations_json. */
export const FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_SINGULAR_TRANSLATIONS_JSON_MAX_LENGTH = 4096

const faProjectWorldTemplatePlacementNicknameSingularTranslationValueSchema = z.string().max(
  FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_MAX_LENGTH
)

const faProjectWorldTemplatePlacementNicknameSingularTranslationsRecordSchema = z.object(
  Object.fromEntries(
    FA_USER_SETTINGS_LANGUAGE_CODES.map((code) => {
      return [code, faProjectWorldTemplatePlacementNicknameSingularTranslationValueSchema.optional()]
    })
  ) as Record<T_faUserSettingsLanguageCode, z.ZodOptional<z.ZodString>>
).strict()

export function parseFaProjectWorldTemplatePlacementNicknameSingularTranslationsJson (
  rawJson: string
): I_faProjectWorldTemplatePlacementNicknameSingularTranslations {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson)
  } catch {
    return {}
  }
  const recordResult =
    faProjectWorldTemplatePlacementNicknameSingularTranslationsRecordSchema.safeParse(parsed)
  if (!recordResult.success) {
    return {}
  }
  return normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations(recordResult.data)
}

export function serializeFaProjectWorldTemplatePlacementNicknameSingularTranslationsJson (
  nicknameSingularTranslations: I_faProjectWorldTemplatePlacementNicknameSingularTranslations
): string {
  const normalized = normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations(
    nicknameSingularTranslations
  )
  const serialized = JSON.stringify(normalized)
  if (serialized.length > FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_SINGULAR_TRANSLATIONS_JSON_MAX_LENGTH) {
    throw new Error('World template placement singular nickname translations exceed storage limit')
  }
  return serialized
}

export function parseFaProjectWorldTemplatePlacementNicknameSingularTranslationsSnapshot (
  payload: unknown
): I_faProjectWorldTemplatePlacementNicknameSingularTranslations {
  const parsed = faProjectWorldTemplatePlacementNicknameSingularTranslationsRecordSchema.parse(payload)
  return normalizeFaProjectWorldTemplatePlacementNicknameSingularTranslations(parsed)
}

export const faProjectWorldTemplatePlacementNicknameSingularTranslationsSnapshotSchema =
  faProjectWorldTemplatePlacementNicknameSingularTranslationsRecordSchema
