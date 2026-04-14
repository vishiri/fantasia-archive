import { z } from 'zod'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

const faUserSettingsLanguageCodeSchema = z.enum(['en-US', 'fr', 'de'])

/**
 * Strict partial: only keys from 'FA_USER_SETTINGS_DEFAULTS'.
 * Boolean fields accept optional booleans; 'languageCode' accepts optional 'en-US' | 'fr' | 'de'.
 * Unknown keys are rejected. Built from defaults so IPC allowed keys stay aligned with 'cleanupFaUserSettings'.
 */
const faUserSettingsPatchShape = Object.fromEntries(
  (Object.keys(FA_USER_SETTINGS_DEFAULTS) as Array<keyof I_faUserSettings>).map((key) => {
    const fieldSchema = key === 'languageCode'
      ? faUserSettingsLanguageCodeSchema.optional()
      : z.boolean().optional()

    return [
      key,
      fieldSchema
    ]
  })
) as unknown as z.ZodRawShape

export const faUserSettingsPatchSchema = z.object(faUserSettingsPatchShape).strict()

function isPlainRecord (value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

/**
 * Parses and returns a 'Partial<I_faUserSettings>' from an IPC payload.
 * Throws 'TypeError' when the root is not a plain object, or 'ZodError' when shape or types are invalid.
 */
export function parseFaUserSettingsPatch (patch: unknown): Partial<I_faUserSettings> {
  if (!isPlainRecord(patch)) {
    throw new TypeError('User settings patch must be a plain object')
  }

  return faUserSettingsPatchSchema.parse(patch)
}
