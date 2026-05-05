import { z } from 'zod'

import {
  FA_PROJECT_DISPLAY_NAME_MAX_LEN
} from 'app/src-electron/shared/faProjectConstants'

const projectNameSchema = z
  .string()
  .min(1, 'project name is required')
  .max(FA_PROJECT_DISPLAY_NAME_MAX_LEN, 'project name is too long')
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, 'project name is empty after trim')

export const faProjectCreateInputSchema = z.object({
  projectName: projectNameSchema
}).strict()

export type I_faProjectCreateInputParsed = z.infer<typeof faProjectCreateInputSchema>

function isPlainRecord (value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

/**
 * Parses renderer IPC payload for project creation.
 * Throws TypeError for non-plain objects; ZodError on invalid fields.
 */
export function parseFaProjectCreateInput (raw: unknown): I_faProjectCreateInputParsed {
  if (!isPlainRecord(raw)) {
    throw new TypeError('project create input must be a plain object')
  }

  return faProjectCreateInputSchema.parse(raw)
}
