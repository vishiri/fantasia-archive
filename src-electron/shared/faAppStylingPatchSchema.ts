import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'

import { FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX } from 'app/src/scripts/floatingWindows/faFloatingWindowPersistedGeometry_manager'
import type { I_faAppStylingPatch } from 'app/types/I_faAppStylingDomain'

/**
 * Upper bound on persisted user CSS size. Generous (~1 MB) but bounded so a malformed bridge call
 * cannot make the main-process JSON store unbounded.
 */
export const FA_APP_STYLING_MAX_CSS_LENGTH = 1_048_576

const faAppStylingFrameSchema = z.object({
  height: z.number().finite().positive().max(FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX),
  width: z.number().finite().positive().max(FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX),
  x: z.number().finite(),
  y: z.number().finite()
}).strict()

export const faAppStylingPatchSchema = z.object({
  css: z.string().max(FA_APP_STYLING_MAX_CSS_LENGTH).optional(),
  frame: z.union([faAppStylingFrameSchema, z.null()]).optional()
}).strict().superRefine((val, ctx) => {
  if (val.css === undefined && val.frame === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'App styling patch must include css and/or frame'
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
 * Parses an IPC payload patching the user CSS and/or window frame. Throws 'TypeError' for non-object payloads or 'ZodError' for shape/type issues.
 */
export function parseFaAppStylingPatch (patch: unknown): I_faAppStylingPatch {
  if (!isPlainRecord(patch)) {
    throw new TypeError('App styling patch must be a plain object')
  }

  return dropUndefinedRecordValues(faAppStylingPatchSchema.parse(patch)) as I_faAppStylingPatch
}
