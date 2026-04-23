import { z } from 'zod'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { FA_PROGRAM_STYLING_MAX_CSS_LENGTH } from 'app/src-electron/shared/faProgramStylingPatchSchema'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faProgramStylingRoot } from 'app/types/I_faProgramStylingDomain'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

const faUserSettingsLanguageCodeSchema = z.enum(['en-US', 'fr', 'de'])

/**
 * Full persisted 'faUserSettings.json' document (not a patch). Unknown keys rejected via .strict().
 */
const faUserSettingsFileShape = Object.fromEntries(
  (Object.keys(FA_USER_SETTINGS_DEFAULTS) as Array<keyof I_faUserSettings>).map((key) => {
    const fieldSchema = key === 'languageCode'
      ? faUserSettingsLanguageCodeSchema
      : z.boolean()

    return [
      key,
      fieldSchema
    ]
  })
) as unknown as z.ZodRawShape

export const faUserSettingsFileSchema = z.object(faUserSettingsFileShape).strict()

const faKeybindModifierLiteralSchema = z.enum([
  'alt',
  'ctrl',
  'meta',
  'shift'
])

const faChordSerializedSchema = z.object({
  code: z.string().min(1),
  mods: z.array(faKeybindModifierLiteralSchema)
}).strict()

/**
 * Full 'faKeybinds.json' document. Unknown top-level keys rejected. 'overrides' allows any string key
 * so older exports with deprecated command ids still parse; 'cleanupFaKeybinds' normalizes.
 */
export const faKeybindsRootFileSchema = z.object({
  schemaVersion: z.number().int(),
  overrides: z.record(
    z.string(),
    z.union([
      faChordSerializedSchema,
      z.null()
    ])
  )
}).strict()

/**
 * Full 'faProgramStyling.json' document.
 */
export const faProgramStylingRootFileSchema = z.object({
  css: z.string().max(FA_PROGRAM_STYLING_MAX_CSS_LENGTH),
  schemaVersion: z.number().int()
}).strict()

export function parseFaUserSettingsFile (raw: unknown): I_faUserSettings {
  return faUserSettingsFileSchema.parse(raw) as I_faUserSettings
}

export function parseFaKeybindsRootFile (raw: unknown): I_faKeybindsRoot {
  return faKeybindsRootFileSchema.parse(raw) as I_faKeybindsRoot
}

export function parseFaProgramStylingRootFile (raw: unknown): I_faProgramStylingRoot {
  const n = faProgramStylingRootFileSchema.parse(raw)
  return {
    css: n.css,
    schemaVersion: 1 as const
  }
}
