import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'

import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import { FA_KEYBIND_COMMAND_IDS } from 'app/types/I_faKeybindsDomain'

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

const faKeybindOverridesPatchShape = Object.fromEntries(
  FA_KEYBIND_COMMAND_IDS.map((id) => {
    return [
      id,
      z.union([
        faChordSerializedSchema,
        z.null()
      ]).optional()
    ]
  })
) as unknown as z.ZodRawShape

export const faKeybindsPatchSchema = z.object({
  overrides: z.object(faKeybindOverridesPatchShape).strict().optional(),
  replaceAllOverrides: z.boolean().optional()
}).strict().superRefine((val, ctx) => {
  if (val.replaceAllOverrides === true && val.overrides === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'replaceAllOverrides requires overrides'
    })
  }
})

function isPlainRecord (value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

/**
 * Parses IPC patch for keybind overrides. Throws on invalid shape.
 */
export function parseFaKeybindsPatch (patch: unknown): {
  overrides?: I_faKeybindsRoot['overrides']
  replaceAllOverrides?: boolean
} {
  if (!isPlainRecord(patch)) {
    throw new TypeError('Keybinds patch must be a plain object')
  }

  const parsed = faKeybindsPatchSchema.parse(patch)
  const result: {
    overrides?: I_faKeybindsRoot['overrides']
    replaceAllOverrides?: boolean
  } = {}

  if (parsed.replaceAllOverrides !== undefined) {
    result.replaceAllOverrides = parsed.replaceAllOverrides
  }

  if (parsed.overrides !== undefined) {
    result.overrides = dropUndefinedRecordValues(parsed.overrides)
  }

  return result
}
