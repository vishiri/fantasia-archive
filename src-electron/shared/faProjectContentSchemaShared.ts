import { z } from 'zod'

import { FA_PROJECT_NAME_MAX_LEN } from 'app/src-electron/shared/faProjectConstants'

export const faProjectContentDisplayNameSchema = z
  .string()
  .min(1, 'display name is required')
  .max(FA_PROJECT_NAME_MAX_LEN, 'display name is too long')
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, 'display name is empty after trim')

/** Optional placement nickname: empty string means no override. */
export const faProjectWorldTemplatePlacementNicknameSchema = z
  .string()
  .max(FA_PROJECT_NAME_MAX_LEN, 'nickname is too long')
  .transform((s) => s.trim())

export const faProjectContentIdSchema = z.string().uuid('id must be a UUID')

export function parseFaProjectContentPlainRecord (value: unknown): Record<string, unknown> {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new TypeError('payload must be a plain object')
  }
  return value as Record<string, unknown>
}
