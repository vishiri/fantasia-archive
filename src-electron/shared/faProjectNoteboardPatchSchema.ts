import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'

import { FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX } from 'app/src/scripts/floatingWindows/faFloatingWindowPersistedGeometry_manager'
import { FA_APP_NOTEBOARD_MAX_TEXT_LENGTH } from './faAppNoteboardPatchSchema'
import type { I_faProjectNoteboardPatch } from 'app/types/I_faProjectNoteboardDomain'

const faFloatingWindowPersistedRectSchema = z.object({
  height: z.number().finite().positive().max(FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX),
  width: z.number().finite().positive().max(FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX),
  x: z.number().finite(),
  y: z.number().finite()
}).strict()

export const faProjectNoteboardPatchSchema = z.object({
  frame: z.union([
    faFloatingWindowPersistedRectSchema,
    z.null()
  ]).optional(),
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
 * Parses an IPC payload patching the active project noteboard. Throws when the payload fails Zod.
 */
export function parseFaProjectNoteboardPatch (patch: unknown): I_faProjectNoteboardPatch {
  if (!isPlainRecord(patch)) {
    throw new TypeError('Project noteboard patch must be a plain object')
  }

  return dropUndefinedRecordValues(faProjectNoteboardPatchSchema.parse(patch)) as I_faProjectNoteboardPatch
}
