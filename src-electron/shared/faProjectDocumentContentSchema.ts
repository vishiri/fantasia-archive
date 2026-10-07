import { z } from 'zod'

import {
  faProjectContentIdSchema,
  parseFaProjectContentDroppedRecord,
  parseFaProjectContentIdPayload,
  parseFaProjectContentPlainRecord
} from 'app/src-electron/shared/faProjectContentSchemaShared'
import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'
import type {
  I_faProjectDocumentCreateInput,
  I_faProjectDocumentListFilter,
  I_faProjectDocumentPatch
} from 'app/types/I_faProjectDocumentDomain'

const nullableTemplateIdSchema = z.union([
  faProjectContentIdSchema,
  z.null()
])

const faProjectDocumentDisplayNameSchema = z
  .string()
  .min(1, 'display name is required')
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, 'display name is empty after trim')

export const faProjectDocumentNullableHexColorSchema = z.union([
  z.literal(''),
  z.null(),
  z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid document appearance color')
]).transform((value) => (value === '' ? null : value))

export const faProjectDocumentCreateInputSchema = z.object({
  displayName: faProjectDocumentDisplayNameSchema,
  id: faProjectContentIdSchema.optional(),
  templateId: nullableTemplateIdSchema.optional(),
  worldId: faProjectContentIdSchema,
  placementId: nullableTemplateIdSchema.optional(),
  parentDocumentId: nullableTemplateIdSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
  documentTextColor: faProjectDocumentNullableHexColorSchema.optional(),
  documentBackgroundColor: faProjectDocumentNullableHexColorSchema.optional(),
  isCategory: z.boolean().optional(),
  isFinished: z.boolean().optional(),
  isMinor: z.boolean().optional(),
  isDead: z.boolean().optional(),
  treeOrderNumber: z.number().int().optional(),
  extraClasses: z.string().max(512).optional()
}).strict()

export const faProjectDocumentPatchSchema = z.object({
  displayName: faProjectDocumentDisplayNameSchema.optional(),
  templateId: nullableTemplateIdSchema.optional(),
  worldId: faProjectContentIdSchema.optional(),
  placementId: nullableTemplateIdSchema.optional(),
  parentDocumentId: nullableTemplateIdSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
  documentTextColor: faProjectDocumentNullableHexColorSchema.optional(),
  documentBackgroundColor: faProjectDocumentNullableHexColorSchema.optional(),
  isCategory: z.boolean().optional(),
  isFinished: z.boolean().optional(),
  isMinor: z.boolean().optional(),
  isDead: z.boolean().optional(),
  treeOrderNumber: z.number().int().optional(),
  extraClasses: z.string().max(512).optional()
}).strict()

export const faProjectDocumentIdPayloadSchema = z.object({
  id: faProjectContentIdSchema
}).strict()

export const faProjectDocumentListFilterSchema = z.object({
  worldId: faProjectContentIdSchema.optional()
}).strict()

export const faProjectSetDocumentWorldPayloadSchema = z.object({
  documentId: faProjectContentIdSchema,
  worldId: faProjectContentIdSchema
}).strict()

export const faProjectSetDocumentTemplatePayloadSchema = z.object({
  documentId: faProjectContentIdSchema,
  templateId: nullableTemplateIdSchema
}).strict()

export function parseFaProjectDocumentCreateInput (
  payload: unknown
): I_faProjectDocumentCreateInput {
  return parseFaProjectContentDroppedRecord(faProjectDocumentCreateInputSchema, payload)
}

export function parseFaProjectDocumentPatch (payload: unknown): I_faProjectDocumentPatch {
  return parseFaProjectContentDroppedRecord(faProjectDocumentPatchSchema, payload)
}

export function parseFaProjectDocumentIdPayload (payload: unknown): string {
  return parseFaProjectContentIdPayload(faProjectDocumentIdPayloadSchema, payload)
}

export function parseFaProjectDocumentListFilter (
  payload: unknown
): I_faProjectDocumentListFilter | undefined {
  if (payload === undefined) {
    return undefined
  }
  return parseFaProjectContentDroppedRecord(faProjectDocumentListFilterSchema, payload)
}

export function parseFaProjectSetDocumentWorldPayload (
  payload: unknown
): { documentId: string, worldId: string } {
  return faProjectSetDocumentWorldPayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectSetDocumentTemplatePayload (
  payload: unknown
): { documentId: string, templateId: string | null } {
  return faProjectSetDocumentTemplatePayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export const faProjectDocumentUpdatePayloadSchema = z.object({
  id: faProjectContentIdSchema,
  patch: faProjectDocumentPatchSchema
}).strict()

export function parseFaProjectDocumentUpdatePayload (
  payload: unknown
): { id: string, patch: I_faProjectDocumentPatch } {
  const parsed = faProjectDocumentUpdatePayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
  const id = parsed.id
  const patch = dropUndefinedRecordValues(parsed.patch) as I_faProjectDocumentPatch
  return {
    id,
    patch
  }
}
