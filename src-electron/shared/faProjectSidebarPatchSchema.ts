import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'

import { FA_PROJECT_SIDEBAR_MIN_WIDTH_PX } from 'app/types/I_faProjectSidebarDomain'
import type { I_faProjectSidebarPatch } from 'app/types/I_faProjectSidebarDomain'

export const faProjectSidebarPatchSchema = z.object({
  widthPx: z.number().finite().min(FA_PROJECT_SIDEBAR_MIN_WIDTH_PX).optional()
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
 * Parses an IPC payload patching the active project workspace sidebar width. Throws when the payload fails Zod.
 */
export function parseFaProjectSidebarPatch (patch: unknown): I_faProjectSidebarPatch {
  if (!isPlainRecord(patch)) {
    throw new TypeError('Project sidebar patch must be a plain object')
  }

  return dropUndefinedRecordValues(faProjectSidebarPatchSchema.parse(patch)) as I_faProjectSidebarPatch
}
