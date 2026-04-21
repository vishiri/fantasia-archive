import { z } from 'zod'

import type { I_faProgramStylingPatch } from 'app/types/I_faProgramStylingDomain'

/**
 * Upper bound on persisted user CSS size. Generous (~1 MB) but bounded so a malformed bridge call
 * cannot make the main-process JSON store unbounded.
 */
export const FA_PROGRAM_STYLING_MAX_CSS_LENGTH = 1_048_576

export const faProgramStylingPatchSchema = z.object({
  css: z.string().max(FA_PROGRAM_STYLING_MAX_CSS_LENGTH)
}).strict()

function isPlainRecord (value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

/**
 * Parses an IPC payload patching the user CSS. Throws 'TypeError' for non-object payloads or 'ZodError' for shape/type issues.
 */
export function parseFaProgramStylingPatch (patch: unknown): I_faProgramStylingPatch {
  if (!isPlainRecord(patch)) {
    throw new TypeError('Program styling patch must be a plain object')
  }

  return faProgramStylingPatchSchema.parse(patch)
}
