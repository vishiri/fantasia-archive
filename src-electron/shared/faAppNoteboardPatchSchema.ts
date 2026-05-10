import { z } from 'zod'

import { FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX } from 'app/src/scripts/floatingWindows/faFloatingWindowPersistedGeometry'
import type { I_faAppNoteboardPatch } from 'app/types/I_faAppNoteboardDomain'

/**
 * Upper bound on persisted note text (~1 MiB) so malformed bridge calls cannot grow the store unbounded.
 */
export const FA_APP_NOTEBOARD_MAX_TEXT_LENGTH = 1_048_576

const faFloatingWindowPersistedRectSchema = z.object({
  height: z.number().finite().positive().max(FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX),
  width: z.number().finite().positive().max(FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX),
  x: z.number().finite(),
  y: z.number().finite()
}).strict()

export const faAppNoteboardPatchSchema = z.object({
  frame: z.union([faFloatingWindowPersistedRectSchema, z.null()]).optional(),
  text: z.string().max(FA_APP_NOTEBOARD_MAX_TEXT_LENGTH).optional()
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
 * Parses an IPC payload patching the app note board. Throws for non-object payloads or Zod failures.
 */
export function parseFaAppNoteboardPatch (patch: unknown): I_faAppNoteboardPatch {
  if (!isPlainRecord(patch)) {
    throw new TypeError('App note board patch must be a plain object')
  }

  return faAppNoteboardPatchSchema.parse(patch)
}
