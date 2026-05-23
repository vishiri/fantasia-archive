import { z } from 'zod'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { FA_APP_NOTEBOARD_MAX_TEXT_LENGTH } from 'app/src-electron/shared/faAppNoteboardPatchSchema'
import { FA_APP_STYLING_MAX_CSS_LENGTH } from 'app/src-electron/shared/faAppStylingPatchSchema'
import { FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX } from 'app/src/scripts/floatingWindows/faFloatingWindowPersistedGeometry'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faAppNoteboardRoot } from 'app/types/I_faAppNoteboardDomain'
import type { I_faAppStylingRoot } from 'app/types/I_faAppStylingDomain'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'

const faUserSettingsLanguageCodeSchema = z.enum(FA_USER_SETTINGS_LANGUAGE_CODES)

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
 * Full 'faAppStyling.json' document.
 */
const faAppStylingPersistedFrameFileSchema = z.object({
  height: z.number().finite().positive().max(FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX),
  width: z.number().finite().positive().max(FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX),
  x: z.number().finite(),
  y: z.number().finite()
}).strict()

export const faAppStylingRootFileSchema = z.object({
  css: z.string().max(FA_APP_STYLING_MAX_CSS_LENGTH),
  frame: z.union([faAppStylingPersistedFrameFileSchema, z.null()]).optional(),
  schemaVersion: z.number().int()
}).strict()

export const faAppNoteboardRootFileSchema = z.object({
  frame: z.union([faAppStylingPersistedFrameFileSchema, z.null()]).optional(),
  schemaVersion: z.number().int(),
  text: z.string().max(FA_APP_NOTEBOARD_MAX_TEXT_LENGTH)
}).strict()

export function parseFaUserSettingsFile (raw: unknown): I_faUserSettings {
  return faUserSettingsFileSchema.parse(raw) as I_faUserSettings
}

export function parseFaKeybindsRootFile (raw: unknown): I_faKeybindsRoot {
  return faKeybindsRootFileSchema.parse(raw) as I_faKeybindsRoot
}

export function parseFaAppNoteboardRootFile (raw: unknown): I_faAppNoteboardRoot {
  const n = faAppNoteboardRootFileSchema.parse(raw)
  return {
    frame: n.frame === undefined ? null : n.frame,
    schemaVersion: 1 as const,
    text: n.text
  }
}

export function parseFaAppStylingRootFile (raw: unknown): I_faAppStylingRoot {
  const n = faAppStylingRootFileSchema.parse(raw)
  return {
    css: n.css,
    frame: n.frame === undefined ? null : n.frame,
    schemaVersion: 1 as const
  }
}
