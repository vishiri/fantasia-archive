import { z } from 'zod'

import type { I_faProjectStylingPatch } from 'app/types/I_faProjectStylingDomain'
import { FA_APP_STYLING_MAX_CSS_LENGTH } from 'app/src-electron/shared/faAppStylingPatchSchema'
import { FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX } from 'app/src/scripts/floatingWindows/faFloatingWindowPersistedGeometry_manager'

const faFloatingWindowPersistedRectSchema = z.object({
  height: z.number().finite().positive().max(FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX),
  width: z.number().finite().positive().max(FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX),
  x: z.number().finite(),
  y: z.number().finite()
}).strict()

export const faProjectStylingPatchSchema = z.object({
  css: z.string().max(FA_APP_STYLING_MAX_CSS_LENGTH).optional(),
  frame: z.union([
    faFloatingWindowPersistedRectSchema,
    z.null()
  ]).optional()
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
 * Parses an IPC payload patching the active project styling. Throws when the payload fails Zod.
 */
export function parseFaProjectStylingPatch (patch: unknown): I_faProjectStylingPatch {
  if (!isPlainRecord(patch)) {
    throw new TypeError('Project styling patch must be a plain object')
  }

  return faProjectStylingPatchSchema.parse(patch)
}
