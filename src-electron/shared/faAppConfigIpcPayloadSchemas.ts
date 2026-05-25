import { z } from 'zod'

import type {
  I_faAppConfigApplyInput,
  I_faAppConfigExportOptions
} from 'app/types/I_faAppConfigDomain'

const faAppConfigIncludeFlagsSchema = z.object({
  includeAppNoteboard: z.boolean(),
  includeAppSettings: z.boolean(),
  includeAppStyling: z.boolean(),
  includeKeybinds: z.boolean()
}).strict()

export const faAppConfigExportOptionsSchema = faAppConfigIncludeFlagsSchema.superRefine(
  (value, ctx) => {
    if (
      !value.includeKeybinds &&
      !value.includeAppNoteboard &&
      !value.includeAppSettings &&
      !value.includeAppStyling
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'at least one include flag is required'
      })
    }
  }
)

export const faAppConfigApplyInputSchema = z.object({
  applyAppNoteboard: z.boolean(),
  applyAppSettings: z.boolean(),
  applyAppStyling: z.boolean(),
  applyKeybinds: z.boolean(),
  sessionId: z.string().min(1)
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
 * Parses export options from an IPC payload.
 */
export function parseFaAppConfigExportOptions (payload: unknown): I_faAppConfigExportOptions {
  if (!isPlainRecord(payload)) {
    throw new TypeError('export options must be an object')
  }
  return faAppConfigExportOptionsSchema.parse(payload)
}

/**
 * Parses apply-import input from an IPC payload.
 */
export function parseFaAppConfigApplyInput (payload: unknown): I_faAppConfigApplyInput {
  if (!isPlainRecord(payload)) {
    throw new TypeError('applyImport: expected object')
  }
  return faAppConfigApplyInputSchema.parse(payload)
}
