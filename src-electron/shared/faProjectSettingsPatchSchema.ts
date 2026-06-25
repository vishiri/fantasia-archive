import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'

import type { I_faProjectSettingsPatch } from 'app/types/I_faProjectSettingsDomain'
import { FA_PROJECT_NAME_MAX_LEN } from 'app/src-electron/shared/faProjectConstants'

const projectNamePatchSchema = z
  .string()
  .min(1, 'project name is required')
  .max(FA_PROJECT_NAME_MAX_LEN, 'project name is too long')
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, 'project name is empty after trim')

export const faProjectSettingsPatchSchema = z.object({
  projectName: projectNamePatchSchema.optional()
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
 * Parses an IPC payload patching the active project settings. Throws when the payload fails Zod.
 */
export function parseFaProjectSettingsPatch (patch: unknown): I_faProjectSettingsPatch {
  if (!isPlainRecord(patch)) {
    throw new TypeError('Project settings patch must be a plain object')
  }

  return dropUndefinedRecordValues(faProjectSettingsPatchSchema.parse(patch)) as I_faProjectSettingsPatch
}
