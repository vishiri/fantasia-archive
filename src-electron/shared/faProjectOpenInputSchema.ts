import { z } from 'zod'

function isPlainRecord (value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

const faProjectOpenInputSchema = z
  .object({
    filePath: z
      .string()
      .min(1, 'filePath must be non-empty')
      .optional()
  })
  .strict()

export type I_faProjectOpenInputParsed = z.infer<typeof faProjectOpenInputSchema>

/**
 * Parses renderer IPC payload for project open (empty object or optional absolute file path).
 * Throws TypeError for non-plain objects; ZodError on invalid fields.
 */
export function parseFaProjectOpenInput (raw: unknown): I_faProjectOpenInputParsed {
  if (!isPlainRecord(raw)) {
    throw new TypeError('project open input must be a plain object')
  }

  return faProjectOpenInputSchema.parse(raw)
}
