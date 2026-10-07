import { z } from 'zod'

import {
  faProjectContentIdSchema,
  parseFaProjectContentDroppedRecord,
  parseFaProjectContentIdPayload,
  parseFaProjectContentPlainRecord
} from 'app/src-electron/shared/faProjectContentSchemaShared'
import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'
import type {
  I_faProjectMedia,
  I_faProjectMediaCreateInput,
  I_faProjectMediaPatch,
  I_faProjectMediaUpsertItem
} from 'app/types/I_faProjectMediaDomain'

const faProjectMediaDisplayNameSchema = z
  .string()
  .min(1, 'display name is required')
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, 'display name is empty after trim')

export const faProjectMediaCreateInputSchema = z.object({
  displayName: faProjectMediaDisplayNameSchema
}).strict()

export const faProjectMediaPatchSchema = z.object({
  displayName: faProjectMediaDisplayNameSchema.optional()
}).strict()

export const faProjectMediaIdPayloadSchema = z.object({
  id: faProjectContentIdSchema
}).strict()

export function parseFaProjectMediaCreateInput (
  payload: unknown
): I_faProjectMediaCreateInput {
  return faProjectMediaCreateInputSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectMediaPatch (payload: unknown): I_faProjectMediaPatch {
  return parseFaProjectContentDroppedRecord(faProjectMediaPatchSchema, payload)
}

export function parseFaProjectMediaIdPayload (payload: unknown): string {
  return parseFaProjectContentIdPayload(faProjectMediaIdPayloadSchema, payload)
}

export const faProjectMediaUpdatePayloadSchema = z.object({
  id: faProjectContentIdSchema,
  patch: faProjectMediaPatchSchema
}).strict()

export function parseFaProjectMediaUpdatePayload (
  payload: unknown
): { id: string, patch: I_faProjectMediaPatch } {
  const parsed = faProjectMediaUpdatePayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
  const id = parsed.id
  const patch = dropUndefinedRecordValues(parsed.patch) as I_faProjectMediaPatch
  return {
    id,
    patch
  }
}

export const faProjectMediaPersistedRowSchema = z.object({
  id: faProjectContentIdSchema,
  displayName: z.string().min(1),
  type: z.enum(['external', 'internal']),
  internalType: z.enum(['', 'embedded', 'linked_outside', 'linked_in_project']),
  externalType: z.enum(['', 'embed', 'linked']),
  externalLink: z.string(),
  externalEmbed: z.string(),
  internalLink: z.string(),
  internalEmbed: z.instanceof(Uint8Array).nullable(),
  createdAtMs: z.number(),
  updatedAtMs: z.number()
}).strict()

export function parseFaProjectMediaPersistedRow (payload: unknown): I_faProjectMedia {
  return faProjectMediaPersistedRowSchema.parse(payload)
}

export const faProjectMediaUpsertItemSchema = z.object({
  id: faProjectContentIdSchema,
  displayName: faProjectMediaDisplayNameSchema,
  type: z.enum(['external', 'internal']),
  internalType: z.enum(['', 'embedded', 'linked_outside', 'linked_in_project']),
  externalType: z.enum(['', 'embed', 'linked']),
  externalLink: z.string(),
  externalEmbed: z.string(),
  internalLink: z.string()
}).strict()

export const faProjectMediaUpsertPayloadSchema = z.object({
  items: z.array(faProjectMediaUpsertItemSchema)
}).strict()

export function parseFaProjectMediaUpsertPayload (
  payload: unknown
): I_faProjectMediaUpsertItem[] {
  return faProjectMediaUpsertPayloadSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  ).items
}
